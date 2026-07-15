import type { PostgrestError } from '@supabase/supabase-js'
import type { ServiceResponse } from '@/types/service'

export function ok<T>(data: T): ServiceResponse<T> {
  return { success: true, data }
}

export function fail<T>(message: string): ServiceResponse<T> {
  return { success: false, error: { message } }
}

// Nunca exponer errores técnicos de Postgres/Supabase al usuario.
// Ver Docs/53_API_CONTRACT.md, sección "MANEJO DE ERRORES".
export function friendlyMessage(
  error: PostgrestError,
  fallback: string,
): string {
  switch (error.code) {
    case '23505':
      return 'Ya existe un registro con esos datos.'
    case '23503':
      return 'La operación no es posible porque el registro está relacionado con otra información.'
    case '23514':
      return 'Los datos ingresados no son válidos.'
    default:
      return fallback
  }
}
