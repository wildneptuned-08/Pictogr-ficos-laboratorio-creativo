import { supabase } from '@/config/supabaseClient'
import { ok, fail, friendlyMessage } from '@/services/utils/serviceResponse'
import type { ServiceResponse } from '@/types/service'
import type { BolsilloFinanciero, MovimientoFinanciero } from '@/types/database'

export interface RegistrarMovimientoInput {
  bolsillo_id: string
  valor: number
  categoria?: string
  descripcion?: string
  pedido_id?: string
  fecha?: string
}

export interface ConsultarMovimientosFiltros {
  bolsilloId?: string
  categoria?: string
  desde?: string
  hasta?: string
}

const FALLBACK_ERROR = 'No fue posible registrar el movimiento financiero.'

async function insertarMovimiento(
  input: RegistrarMovimientoInput & { tipo: 'Ingreso' | 'Gasto' | 'Transferencia' | 'Ajuste' },
): Promise<ServiceResponse<MovimientoFinanciero>> {
  const { data, error } = await supabase
    .from('movimientos_financieros')
    .insert(input)
    .select()
    .single()

  if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
  return ok(data)
}

export const FinanzasService = {
  async registrarIngreso(
    input: RegistrarMovimientoInput,
  ): Promise<ServiceResponse<MovimientoFinanciero>> {
    if (input.valor <= 0) return fail('El valor del ingreso debe ser mayor que cero.')
    return insertarMovimiento({ ...input, tipo: 'Ingreso' })
  },

  async registrarGasto(
    input: RegistrarMovimientoInput,
  ): Promise<ServiceResponse<MovimientoFinanciero>> {
    if (input.valor <= 0) return fail('El valor del gasto debe ser mayor que cero.')
    return insertarMovimiento({ ...input, tipo: 'Gasto' })
  },

  // "Actualizar Bolsillos": distribuye una utilidad bruta entre los bolsillos
  // activos según su porcentaje configurado (Docs/43_ANALISIS_FINANZAS.md).
  async distribuirUtilidad(
    utilidadBruta: number,
    pedidoId?: string,
  ): Promise<ServiceResponse<MovimientoFinanciero[]>> {
    if (utilidadBruta <= 0) {
      return fail('La utilidad a distribuir debe ser mayor que cero.')
    }

    const { data: bolsillos, error: errorBolsillos } = await supabase
      .from('bolsillos_financieros')
      .select()
      .eq('activo', true)

    if (errorBolsillos || !bolsillos) {
      return fail('No fue posible consultar los bolsillos financieros.')
    }

    const movimientos: MovimientoFinanciero[] = []
    for (const bolsillo of bolsillos) {
      const valor = Math.round(utilidadBruta * (bolsillo.porcentaje / 100) * 100) / 100
      const resultado = await insertarMovimiento({
        bolsillo_id: bolsillo.id,
        valor,
        categoria: 'Distribución de utilidad',
        pedido_id: pedidoId,
        tipo: 'Ingreso',
      })
      if (!resultado.success || !resultado.data) {
        return fail('No fue posible distribuir la utilidad entre los bolsillos.')
      }
      movimientos.push(resultado.data)
    }

    return ok(movimientos)
  },

  async consultarMovimientos(
    filtros: ConsultarMovimientosFiltros = {},
  ): Promise<ServiceResponse<MovimientoFinanciero[]>> {
    let query = supabase.from('movimientos_financieros').select()

    if (filtros.bolsilloId) query = query.eq('bolsillo_id', filtros.bolsilloId)
    if (filtros.categoria) query = query.eq('categoria', filtros.categoria)
    if (filtros.desde) query = query.gte('fecha', filtros.desde)
    if (filtros.hasta) query = query.lte('fecha', filtros.hasta)

    const { data, error } = await query.order('fecha', { ascending: false })

    if (error) return fail(friendlyMessage(error, 'No fue posible consultar los movimientos.'))
    return ok(data)
  },

  async obtenerUtilidad(desde: string, hasta: string): Promise<ServiceResponse<number>> {
    const { data, error } = await supabase
      .from('movimientos_financieros')
      .select('tipo, valor')
      .gte('fecha', desde)
      .lte('fecha', hasta)

    if (error) return fail(friendlyMessage(error, 'No fue posible calcular la utilidad.'))

    const utilidad = data.reduce((total, movimiento) => {
      if (movimiento.tipo === 'Ingreso') return total + movimiento.valor
      if (movimiento.tipo === 'Gasto') return total - movimiento.valor
      return total
    }, 0)

    return ok(utilidad)
  },

  async consultarSaldos(): Promise<ServiceResponse<BolsilloFinanciero[]>> {
    const { data, error } = await supabase
      .from('bolsillos_financieros')
      .select()
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) return fail(friendlyMessage(error, 'No fue posible consultar los saldos.'))
    return ok(data)
  },
}
