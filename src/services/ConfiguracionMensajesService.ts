import { supabase } from '@/config/supabaseClient'
import { ok, fail, friendlyMessage } from '@/services/utils/serviceResponse'
import { PLANTILLA_POR_DEFECTO_PRODUCCION } from '@/utils/whatsapp'
import type { ServiceResponse } from '@/types/service'

const FALLBACK_ERROR = 'No fue posible guardar el mensaje.'

export const ConfiguracionMensajesService = {
  // Si no hay fila guardada para ese estado (o falla la consulta), devuelve
  // el mensaje por defecto: el envío de WhatsApp nunca debe quedarse sin
  // texto por falta de configuración.
  async obtener(estado: string): Promise<ServiceResponse<string>> {
    const { data, error } = await supabase
      .from('configuracion_mensajes')
      .select('plantilla')
      .eq('estado', estado)
      .maybeSingle()

    if (error) return fail(friendlyMessage(error, 'No fue posible consultar el mensaje.'))
    return ok(data?.plantilla ?? PLANTILLA_POR_DEFECTO_PRODUCCION)
  },

  async guardar(estado: string, plantilla: string): Promise<ServiceResponse<string>> {
    if (!plantilla.trim()) {
      return fail('El mensaje no puede quedar vacío.')
    }

    const { data, error } = await supabase
      .from('configuracion_mensajes')
      .upsert({ estado, plantilla: plantilla.trim() }, { onConflict: 'estado' })
      .select('plantilla')
      .single()

    if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
    return ok(data.plantilla)
  },
}
