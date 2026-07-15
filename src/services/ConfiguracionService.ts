import { supabase } from '@/config/supabaseClient'
import { ok, fail, friendlyMessage } from '@/services/utils/serviceResponse'
import type { ServiceResponse } from '@/types/service'
import type { BolsilloFinanciero, Configuracion } from '@/types/database'

export interface ActualizarEmpresaInput {
  nombre_empresa?: string
  correo_contacto?: string
  telefono_contacto?: string
}

export interface ActualizarPreferenciasInput {
  dias_habiles_mes?: number
}

export interface PorcentajeBolsilloInput {
  bolsilloId: string
  porcentaje: number
}

const FALLBACK_ERROR = 'No fue posible actualizar la configuración.'

// Tabla de fila única (singleton): la crea si todavía no existe.
async function obtenerOCrear(): Promise<ServiceResponse<Configuracion>> {
  const { data: existente, error: errorConsulta } = await supabase
    .from('configuracion')
    .select()
    .limit(1)
    .maybeSingle()

  if (errorConsulta) {
    return fail(friendlyMessage(errorConsulta, 'No fue posible consultar la configuración.'))
  }
  if (existente) return ok(existente)

  const { data: creada, error: errorCreacion } = await supabase
    .from('configuracion')
    .insert({})
    .select()
    .single()

  if (errorCreacion) {
    return fail(friendlyMessage(errorCreacion, 'No fue posible inicializar la configuración.'))
  }
  return ok(creada)
}

export const ConfiguracionService = {
  async obtenerConfiguracion(): Promise<ServiceResponse<Configuracion>> {
    return obtenerOCrear()
  },

  async actualizarEmpresa(
    input: ActualizarEmpresaInput,
  ): Promise<ServiceResponse<Configuracion>> {
    const actual = await obtenerOCrear()
    if (!actual.success || !actual.data) return actual

    const { data, error } = await supabase
      .from('configuracion')
      .update(input)
      .eq('id', actual.data.id)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
    return ok(data)
  },

  async actualizarPreferencias(
    input: ActualizarPreferenciasInput,
  ): Promise<ServiceResponse<Configuracion>> {
    if (input.dias_habiles_mes !== undefined && input.dias_habiles_mes <= 0) {
      return fail('Los días hábiles del mes deben ser mayores que cero.')
    }

    const actual = await obtenerOCrear()
    if (!actual.success || !actual.data) return actual

    const { data, error } = await supabase
      .from('configuracion')
      .update(input)
      .eq('id', actual.data.id)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
    return ok(data)
  },

  async actualizarPorcentajes(
    porcentajes: PorcentajeBolsilloInput[],
  ): Promise<ServiceResponse<BolsilloFinanciero[]>> {
    const suma = porcentajes.reduce((total, item) => total + item.porcentaje, 0)
    if (Math.round(suma * 100) / 100 !== 100) {
      return fail('Los porcentajes de los bolsillos deben sumar 100%.')
    }

    const actualizados: BolsilloFinanciero[] = []
    for (const item of porcentajes) {
      const { data, error } = await supabase
        .from('bolsillos_financieros')
        .update({ porcentaje: item.porcentaje })
        .eq('id', item.bolsilloId)
        .select()
        .single()

      if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
      actualizados.push(data)
    }

    return ok(actualizados)
  },
}
