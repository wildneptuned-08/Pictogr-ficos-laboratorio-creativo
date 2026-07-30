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
  fecha_ingreso?: string | null
}

export type ActualizarInsumoInput = Partial<CrearInsumoInput>

export interface ResumenImportacion {
  creados: number
  actualizados: number
  proveedoresCreados: string[]
}

const FALLBACK_ERROR = 'No fue posible registrar el movimiento de inventario.'
const STOCK_INSUFICIENTE = 'No hay stock suficiente para esta operación.'

const normalizar = (texto: string | null | undefined) => (texto ?? '').trim().toLowerCase()

// El mismo insumo (misma categoría+nombre+observaciones) puede repartirse en
// varias filas de `inventario`, una por cada lote/compra (ver
// 20260729120000 y 20260729120100): esta es la identidad "conceptual" que
// las agrupa para sumarlas, sin importar en qué fila/lote esté cada unidad.
export function claveIdentidadInsumo(
  insumo: Pick<Inventario, 'categoria' | 'nombre' | 'observaciones'>,
): string {
  return [normalizar(insumo.categoria), normalizar(insumo.nombre), normalizar(insumo.observaciones)].join(
    '||',
  )
}

// Un insumo puede tener varias filas (una por lote de compra, ver
// claveIdentidadInsumo): para elegir "el" insumo al vincularlo a un producto
// (productos.insumo_id) solo hace falta UNA fila como ancla por identidad,
// no listar cada lote por separado. El consumo FIFO en Producción resuelve
// las filas hermanas en tiempo de ejecución a partir de esa ancla.
export function insumosUnicosPorIdentidad(insumos: Inventario[]): Inventario[] {
  const porClave = new Map<string, Inventario>()
  for (const insumo of insumos) {
    const clave = claveIdentidadInsumo(insumo)
    const actual = porClave.get(clave)
    if (!actual || insumo.updated_at > actual.updated_at) porClave.set(clave, insumo)
  }
  return Array.from(porClave.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
}

// Suma el stock de todas las filas que comparten identidad, para comparar
// contra el stock mínimo del insumo (no el de una sola fila/lote).
export function stockTotalPorInsumo(insumos: Inventario[]): Map<string, number> {
  const totales = new Map<string, number>()
  for (const insumo of insumos) {
    const clave = claveIdentidadInsumo(insumo)
    totales.set(clave, (totales.get(clave) ?? 0) + insumo.stock_actual)
  }
  return totales
}

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

  // Agrupa por identidad de insumo (no por fila/lote): un insumo con varios
  // lotes pequeños no debe salir "crítico" si la suma alcanza el mínimo.
  async obtenerStockCritico(): Promise<ServiceResponse<Inventario[]>> {
    const { data, error } = await supabase
      .from('inventario')
      .select()
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) return fail(friendlyMessage(error, 'No fue posible consultar el stock crítico.'))

    const grupos = new Map<string, Inventario[]>()
    for (const insumo of data) {
      const clave = claveIdentidadInsumo(insumo)
      const filas = grupos.get(clave) ?? []
      filas.push(insumo)
      grupos.set(clave, filas)
    }

    const criticos: Inventario[] = []
    for (const filas of grupos.values()) {
      const stockTotal = filas.reduce((total, fila) => total + fila.stock_actual, 0)
      // Todas las filas de un mismo insumo deberían compartir stock_minimo;
      // si no coinciden, se usa el de la fila más reciente (mismo criterio
      // que fecha_ingreso al reimportar: gana el dato más nuevo).
      const representativa = filas.reduce((masReciente, fila) =>
        fila.updated_at > masReciente.updated_at ? fila : masReciente,
      )
      // Estrictamente por debajo: estar justo en el mínimo no es crítico.
      if (stockTotal < representativa.stock_minimo) {
        criticos.push({ ...representativa, stock_actual: stockTotal })
      }
    }

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
  // (migración 20260720120000), por eso no se envía desde aquí: '' solo
  // satisface el tipo (la columna es NOT NULL sin default declarado), el
  // trigger la trata como "sin código" y la reemplaza igual.
  async crear(input: CrearInsumoInput): Promise<ServiceResponse<Inventario>> {
    if (!input.nombre.trim()) return fail('El nombre del insumo es obligatorio.')

    const { data, error } = await supabase
      .from('inventario')
      .insert({
        codigo: '',
        nombre: input.nombre.trim(),
        categoria: input.categoria?.trim() || null,
        proveedor_id: input.proveedor_id || null,
        stock_actual: input.stock_actual ?? 0,
        stock_minimo: input.stock_minimo ?? 0,
        costo_unitario: input.costo_unitario ?? 0,
        observaciones: input.observaciones?.trim() || null,
        unidad_medida: input.unidad_medida?.trim() || 'Unidad',
        fecha_ingreso: input.fecha_ingreso || null,
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
    if (input.fecha_ingreso !== undefined) cambios.fecha_ingreso = input.fecha_ingreso || null

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

  // Importación del Excel del negocio. Un insumo se considera "el mismo
  // lote" si coinciden categoría + nombre + observaciones + fecha de
  // ingreso: el nombre solo no basta porque hay productos que únicamente se
  // distinguen por la talla o el gramaje anotado en observaciones, y la
  // fecha es la que separa una compra de otra para el consumo FIFO — dos
  // compras del mismo insumo en fechas distintas quedan en filas (lotes)
  // separadas en vez de sumarse a una sola.
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

    const claveDe = (
      categoria: string | null,
      nombre: string,
      observaciones: string | null,
      fechaIngreso: string | null,
    ) => [claveIdentidadInsumo({ categoria, nombre, observaciones }), fechaIngreso ?? ''].join('||')

    const porClave = new Map<string, Inventario>()
    for (const insumo of existentes ?? []) {
      porClave.set(
        claveDe(insumo.categoria, insumo.nombre, insumo.observaciones, insumo.fecha_ingreso),
        insumo,
      )
    }

    let creados = 0
    let actualizados = 0

    for (const fila of filas) {
      const proveedor = fila.proveedor
        ? proveedores.data.mapa.get(fila.proveedor.trim().toLowerCase())
        : undefined

      const existente = porClave.get(
        claveDe(fila.categoria, fila.nombre, fila.observaciones, fila.fecha_ingreso),
      )

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
          codigo: '',
          nombre: fila.nombre,
          categoria: fila.categoria || null,
          proveedor_id: proveedor?.id ?? null,
          stock_actual: fila.cantidad,
          stock_minimo: fila.stock_minimo,
          costo_unitario: fila.costo_unitario,
          observaciones: fila.observaciones || null,
          unidad_medida: 'Unidad',
          fecha_ingreso: fila.fecha_ingreso || null,
        })
        .select()
        .single()

      if (error) {
        return fail(
          friendlyMessage(error, `No fue posible importar "${fila.nombre}" (fila ${fila.fila}).`),
        )
      }

      // Evita duplicar si el Excel repite la misma combinación dos veces.
      porClave.set(
        claveDe(creado.categoria, creado.nombre, creado.observaciones, creado.fecha_ingreso),
        creado,
      )
      creados += 1
    }

    return ok({
      creados,
      actualizados,
      proveedoresCreados: proveedores.data.creados.map((p) => `${p.nombre} (${p.prefijo_id})`),
    })
  },
}
