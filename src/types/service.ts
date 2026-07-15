// Estructura de respuesta obligatoria para todos los servicios.
// Ver Docs/53_API_CONTRACT.md, sección "RESPUESTAS".

export interface ServiceError {
  message: string
}

export interface ServiceResponse<T> {
  success: boolean
  data?: T
  error?: ServiceError
}
