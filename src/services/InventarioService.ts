import { supabase } from '@/config/supabaseClient'
import { ok, fail, friendlyMessage } from '@/services/utils/serviceResponse'
import type { ServiceResponse } from '@/types/service'
import type { Inventario, MovimientoInventario } from '@/types/database'

export interface RegistrarMovimientoInput {
  inventario_id: string
  cantidad: number
  motivo?: string
  pedido_id?: string
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

    const criticos = data.filter((item) => item.stock_actual <= item.stock_minimo)
    return ok(criticos)
  },

  async listarInsumos(): Promise<ServiceResponse<Inventario[]>> {
    const { data, error } = await supabase
      .from('inventario')
      .select()
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) return fail(friendlyMessage(error, 'No fue posible listar el inventario.'))
    return ok(data)
  },
}
