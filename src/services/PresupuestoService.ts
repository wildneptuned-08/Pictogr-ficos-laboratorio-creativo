import { supabase } from '@/config/supabaseClient'
import { ok, fail, friendlyMessage } from '@/services/utils/serviceResponse'
import { ConfiguracionService } from '@/services/ConfiguracionService'
import type { ServiceResponse } from '@/types/service'
import type { Presupuesto } from '@/types/database'

export interface CrearMetaInput {
  anio: number
  mes: number
  meta_mensual: number
}

export interface Indicadores {
  meta: number
  ventasActuales: number
  valorPendiente: number
  cumplimientoPorcentaje: number
  promedioDiarioRequerido: number
  proyeccionCierre: number
}

const FALLBACK_ERROR = 'No fue posible completar la operación con el presupuesto.'

function diasDelMes(anio: number, mes: number): number {
  return new Date(anio, mes, 0).getDate()
}

async function calcularMetasDerivadas(metaMensual: number) {
  const configuracion = await ConfiguracionService.obtenerConfiguracion()
  const diasHabiles = configuracion.data?.dias_habiles_mes

  return {
    meta_quincenal: metaMensual / 2,
    meta_semanal: metaMensual / 4,
    meta_diaria: diasHabiles && diasHabiles > 0 ? metaMensual / diasHabiles : 0,
  }
}

export const PresupuestoService = {
  async crearMeta(input: CrearMetaInput): Promise<ServiceResponse<Presupuesto>> {
    if (input.meta_mensual <= 0) {
      return fail('La meta mensual debe ser mayor que cero.')
    }

    // Regla de negocio: solo un presupuesto activo por mes (42_ANALISIS_PRESUPUESTO.md).
    await supabase
      .from('presupuesto')
      .update({ activo: false })
      .eq('anio', input.anio)
      .eq('mes', input.mes)
      .eq('activo', true)

    const derivadas = await calcularMetasDerivadas(input.meta_mensual)

    const { data, error } = await supabase
      .from('presupuesto')
      .insert({
        anio: input.anio,
        mes: input.mes,
        meta_mensual: input.meta_mensual,
        ...derivadas,
        activo: true,
      })
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
    return ok(data)
  },

  async actualizarMeta(
    id: string,
    metaMensual: number,
  ): Promise<ServiceResponse<Presupuesto>> {
    if (metaMensual <= 0) {
      return fail('La meta mensual debe ser mayor que cero.')
    }

    const derivadas = await calcularMetasDerivadas(metaMensual)

    const { data, error } = await supabase
      .from('presupuesto')
      .update({ meta_mensual: metaMensual, ...derivadas })
      .eq('id', id)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
    return ok(data)
  },

  async consultarMeta(anio: number, mes: number): Promise<ServiceResponse<Presupuesto>> {
    const { data, error } = await supabase
      .from('presupuesto')
      .select()
      .eq('anio', anio)
      .eq('mes', mes)
      .eq('activo', true)
      .single()

    if (error) return fail(friendlyMessage(error, 'No fue posible consultar el presupuesto del mes.'))
    return ok(data)
  },

  async calcularAvance(anio: number, mes: number): Promise<ServiceResponse<{ meta: number; ventasActuales: number; valorPendiente: number }>> {
    const meta = await this.consultarMeta(anio, mes)
    if (!meta.success || !meta.data) {
      return fail('No hay un presupuesto activo registrado para ese mes.')
    }

    const desde = `${anio}-${String(mes).padStart(2, '0')}-01`
    const hasta = `${anio}-${String(mes).padStart(2, '0')}-${String(diasDelMes(anio, mes)).padStart(2, '0')}`

    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('valor_total')
      .neq('estado', 'Cancelado')
      .gte('fecha_pedido', desde)
      .lte('fecha_pedido', hasta)

    if (error) return fail(friendlyMessage(error, 'No fue posible calcular el avance del presupuesto.'))

    const ventasActuales = pedidos.reduce((total, p) => total + p.valor_total, 0)

    return ok({
      meta: meta.data.meta_mensual,
      ventasActuales,
      valorPendiente: Math.max(meta.data.meta_mensual - ventasActuales, 0),
    })
  },

  async calcularCumplimiento(anio: number, mes: number): Promise<ServiceResponse<Indicadores>> {
    const avance = await this.calcularAvance(anio, mes)
    if (!avance.success || !avance.data) {
      return fail(avance.error?.message ?? 'No fue posible calcular el cumplimiento del presupuesto.')
    }

    const { meta, ventasActuales, valorPendiente } = avance.data
    const totalDias = diasDelMes(anio, mes)

    const hoy = new Date()
    const esMesActual = hoy.getFullYear() === anio && hoy.getMonth() + 1 === mes
    const diasTranscurridos = esMesActual ? hoy.getDate() : totalDias
    const diasRestantes = Math.max(totalDias - diasTranscurridos, 1)

    const cumplimientoPorcentaje = meta > 0 ? (ventasActuales / meta) * 100 : 0
    const promedioDiarioRequerido = valorPendiente / diasRestantes
    const ritmoDiarioActual = ventasActuales / diasTranscurridos
    const proyeccionCierre = ritmoDiarioActual * totalDias

    return ok({
      meta,
      ventasActuales,
      valorPendiente,
      cumplimientoPorcentaje,
      promedioDiarioRequerido,
      proyeccionCierre,
    })
  },
}
