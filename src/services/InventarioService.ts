import { supabase } from '@/config/supabaseClient'
import { ok, fail, friendlyMessage } from '@/services/utils/serviceResponse'
import { ProveedorService } from '@/services/ProveedorService'
import type { ServiceResponse } from '@/types/service'
import type { ActualizacionDe, Inventario, MovimientoInventario } from '@/types/database'
import type { FilaInventarioExcel } from '@/utils/importarInventarioExcel'

export interface RegistrarMovimientoInput {
  inventario_id: string
  cantidad: number
  motivo?: string
  pedido_id?: string
}

export interface CrearInsumoInput {
  nombre: string
  categoria?: string | null
  proveedor_id?: string | null
  stock_actual?: number
  stock_minimo?: number
  costo_unitario?: number
  observaciones?: string | null
  unidad_medida?: string
}

export type ActualizarInsumoInput = Partial<CrearInsumoInput>

export interface ResumenImportacion {
  creados: number
  actualizados: number
  proveedoresCreados: string[]
}

const FALLBACK_ERROR = 'No fue posible registrar el movimiento de inventario.'
const STOCK_INSUFICIENTE = 'No hay stock suficiente para esta operación.'

async function insertarMovimiento(
  input: RegistrarMovimientoInput & { tipo: 'Entrada' | 'Salida' | 'Ajuste' },
): Promise<ServiceResponse<MovimientoInventario>> {
  const { data, error } = await supabase
    .from('movimientos_inventario')
    .insert(input)
    .select()
    .single()

  if (error) {
    if (error.code === 'P0001') return fail(STOCK_INSUFICIENTE)
    return fail(friendlyMessage(error, FALLBACK_ERROR))
  }
  return ok(data)
}

export const InventarioService = {
  async registrarEntrada(
    input: RegistrarMovimientoInput,
  ): Promise<ServiceResponse<MovimientoInventario>> {
    if (input.cantidad <= 0) {
      return fail('La cantidad debe ser mayor que cero.')
    }
    return insertarMovimiento({ ...input, tipo: 'Entrada' })
  },

  async registrarSalida(
    input: RegistrarMovimientoInput,
  ): Promise<ServiceResponse<MovimientoInventario>> {
    if (input.cantidad <= 0) {
      return fail('La cantidad debe ser mayor que cero.')
    }
    return insertarMovimiento({ ...input, tipo: 'Salida' })
  },

  // "Actualizar Stock": corrección manual a un valor absoluto de stock.
  async actualizarStock(
    inventarioId: string,
    nuevoStock: number,
    motivo?: string,
  ): Promise<ServiceResponse<MovimientoInventario>> {
    if (nuevoStock < 0) {
      return fail('El stock no puede ser negativo.')
    }
    return insertarMovimiento({
      inventario_id: inventarioId,
      cantidad: nuevoStock,
      motivo,
      tipo: 'Ajuste',
    })
  },

  async consultarStock(inventarioId: string): Promise<ServiceResponse<Inventario>> {
    const { data, error } = await supabase
      .from('inventario')
      .select()
      .eq('id', inventarioId)
      .single()

    if (error) return fail(friendlyMessage(error, 'No fue posible consultar el stock.'))
    return ok(data)
  },

  async consultarHistorial(
    inventarioId: string,
  ): Promise<ServiceResponse<MovimientoInventario[]>> {
    const { data, error } = await supabase
      .from('movimientos_inventario')
      .select()
      .eq('inventario_id', inventarioId)
      .order('created_at', { ascending: false })

    if (error) return fail(friendlyMessage(error, 'No fue posible consultar el historial.'))
    return ok(data)
  },

  async obtenerStockCritico(): Promise<ServiceResponse<Inventario[]>> {
    const { data, error } = await supabase
      .from('inventario')
      .select()
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) return fail(friendlyMessage(error, 'No fue posible consultar el stock crítico.'))

    // Estrictamente por debajo: estar justo en el mínimo no es crítico.
    // Misma regla que bajoMinimo() en InventarioPage.
    const criticos = data.filter((item) => item.stock_actual < item.stock_minimo)
    return ok(criticos)
  },

  async listarInsumos(): Promise<ServiceResponse<Inventario[]>> {
    const { data, error } = await supabase
      .from('inventario')
      .select()
      .eq('activo', true)
      .order('categoria', { ascending: true, nullsFirst: false })
      .order('nombre', { ascending: true })

    if (error) return fail(friendlyMessage(error, 'No fue posible listar el inventario.'))
    return ok(data)
  },

  // El código lo genera un trigger a partir del prefijo del proveedor
  // (migración 20260720120000), por eso no se envía desde aquí.
  async crear(input: CrearInsumoInput): Promise<ServiceResponse<Inventario>> {
    if (!input.nombre.trim()) return fail('El nombre del insumo es obligatorio.')

    const { data, error } = await supabase
      .from('inventario')
      .insert({
        nombre: input.nombre.trim(),
        categoria: input.categoria?.trim() || null,
        proveedor_id: input.proveedor_id || null,
        stock_actual: input.stock_actual ?? 0,
        stock_minimo: input.stock_minimo ?? 0,
        costo_unitario: input.costo_unitario ?? 0,
        observaciones: input.observaciones?.trim() || null,
        unidad_medida: input.unidad_medida?.trim() || 'Unidad',
      })
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, 'No fue posible crear el insumo.'))
    return ok(data)
  },

  // Ojo: cambiar stock_actual aquí NO deja rastro en movimientos_inventario.
  // Para corregir existencias usa actualizarStock(), que sí registra el ajuste.
  async actualizar(
    id: string,
    input: ActualizarInsumoInput,
  ): Promise<ServiceResponse<Inventario>> {
    if (input.nombre !== undefined && !input.nombre.trim()) {
      return fail('El nombre del insumo es obligatorio.')
    }

    const cambios: ActualizacionDe<'inventario'> = {}
    if (input.nombre !== undefined) cambios.nombre = input.nombre.trim()
    if (input.categoria !== undefined) cambios.categoria = input.categoria?.trim() || null
    if (input.proveedor_id !== undefined) cambios.proveedor_id = input.proveedor_id || null
    if (input.stock_minimo !== undefined) cambios.stock_minimo = input.stock_minimo
    if (input.costo_unitario !== undefined) cambios.costo_unitario = input.costo_unitario
    if (input.observaciones !== undefined) {
      cambios.observaciones = input.observaciones?.trim() || null
    }
    if (input.unidad_medida !== undefined) {
      cambios.unidad_medida = input.unidad_medida?.trim() || 'Unidad'
    }

    const { data, error } = await supabase
      .from('inventario')
      .update(cambios)
      .eq('id', id)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, 'No fue posible actualizar el insumo.'))
    return ok(data)
  },

  // Baja lógica: los movimientos históricos referencian el insumo, así que
  // borrarlo de verdad rompería el historial de entradas y salidas.
  async eliminar(id: string): Promise<ServiceResponse<Inventario>> {
    const { data, error } = await supabase
      .from('inventario')
      .update({ activo: false })
      .eq('id', id)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, 'No fue posible eliminar el insumo.'))
    return ok(data)
  },

  // Importación del Excel del negocio. Un insumo se considera "el mismo" si
  // coinciden categoría + nombre + observaciones: el nombre solo no basta
  // porque hay productos que únicamente se distinguen por la talla o el
  // gramaje anotado en observaciones.
  async importar(filas: FilaInventarioExcel[]): Promise<ServiceResponse<ResumenImportacion>> {
    if (filas.length === 0) return fail('No hay filas para importar.')

    const proveedores = await ProveedorService.asegurarPorNombre(
      filas.map((f) => f.proveedor).filter(Boolean),
    )
    if (!proveedores.success || !proveedores.data) {
      return fail(proveedores.error?.message ?? 'No fue posible preparar los proveedores.')
    }

    const { data: existentes, error: errorExistentes } = await supabase
      .from('inventario')
      .select()
      .eq('activo', true)

    if (errorExistentes) {
      return fail(friendlyMessage(errorExistentes, 'No fue posible consultar el inventario.'))
    }

    const normalizar = (texto: string | null | undefined) => (texto ?? '').trim().toLowerCase()
    const claveDe = (categoria: string | null, nombre: string, observaciones: string | null) =>
      [normalizar(categoria), normalizar(nombre), normalizar(observaciones)].join('||')

    const porClave = new Map<string, Inventario>()
    for (const insumo of existentes ?? []) {
      porClave.set(claveDe(insumo.categoria, insumo.nombre, insumo.observaciones), insumo)
    }

    let creados = 0
    let actualizados = 0

    for (const fila of filas) {
      const proveedor = fila.proveedor
        ? proveedores.data.mapa.get(fila.proveedor.trim().toLowerCase())
        : undefined

      const existente = porClave.get(claveDe(fila.categoria, fila.nombre, fila.observaciones))

      if (existente) {
        const { error } = await supabase
          .from('inventario')
          .update({
            proveedor_id: proveedor?.id ?? existente.proveedor_id,
            stock_actual: fila.cantidad,
            stock_minimo: fila.stock_minimo,
            costo_unitario: fila.costo_unitario,
          })
          .eq('id', existente.id)

        if (error) {
          return fail(
            friendlyMessage(error, `No fue posible actualizar "${fila.nombre}" (fila ${fila.fila}).`),
          )
        }
        actualizados += 1
        continue
      }

      const { data: creado, error } = await supabase
        .from('inventario')
        .insert({
          nombre: fila.nombre,
          categoria: fila.categoria || null,
          proveedor_id: proveedor?.id ?? null,
          stock_actual: fila.cantidad,
          stock_minimo: fila.stock_minimo,
          costo_unitario: fila.costo_unitario,
          observaciones: fila.observaciones || null,
          unidad_medida: 'Unidad',
        })
        .select()
        .single()

      if (error) {
        return fail(
          friendlyMessage(error, `No fue posible importar "${fila.nombre}" (fila ${fila.fila}).`),
        )
      }

      // Evita duplicar si el Excel repite la misma combinación dos veces.
      porClave.set(claveDe(creado.categoria, creado.nombre, creado.observaciones), creado)
      creados += 1
    }

    return ok({
      creados,
      actualizados,
      proveedoresCreados: proveedores.data.creados.map((p) => `${p.nombre} (${p.prefijo_id})`),
    })
  },
}
