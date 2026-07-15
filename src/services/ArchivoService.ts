import { supabase } from '@/config/supabaseClient'
import { ok, fail, friendlyMessage } from '@/services/utils/serviceResponse'
import type { ServiceResponse } from '@/types/service'
import type { ArchivoPedido } from '@/types/database'

const BUCKET = 'archivos-pedido'
const TIPOS_PERMITIDOS = ['pdf', 'png', 'jpg', 'jpeg', 'svg']
const URL_EXPIRACION_SEGUNDOS = 60 * 60 // 1 hora

const FALLBACK_ERROR = 'No fue posible completar la operación con el archivo.'

function extension(nombreArchivo: string): string {
  return nombreArchivo.split('.').pop()?.toLowerCase() ?? ''
}

export const ArchivoService = {
  async subir(
    pedidoId: string,
    file: File,
  ): Promise<ServiceResponse<ArchivoPedido>> {
    const tipo = extension(file.name)
    if (!TIPOS_PERMITIDOS.includes(tipo)) {
      return fail('Tipo de archivo no permitido. Solo se aceptan PDF, PNG, JPG o SVG.')
    }

    const path = `${pedidoId}/${Date.now()}-${file.name}`

    const { error: errorSubida } = await supabase.storage
      .from(BUCKET)
      .upload(path, file)

    if (errorSubida) {
      return fail('No fue posible subir el archivo.')
    }

    const { data, error } = await supabase
      .from('archivos_pedido')
      .insert({
        pedido_id: pedidoId,
        nombre_archivo: file.name,
        url_storage: path,
        tipo_archivo: tipo,
        tamano: file.size,
      })
      .select()
      .single()

    if (error) {
      await supabase.storage.from(BUCKET).remove([path])
      return fail(friendlyMessage(error, FALLBACK_ERROR))
    }
    return ok(data)
  },

  async eliminar(archivoId: string): Promise<ServiceResponse<null>> {
    const { data: archivo, error: errorConsulta } = await supabase
      .from('archivos_pedido')
      .select()
      .eq('id', archivoId)
      .single()

    if (errorConsulta || !archivo) {
      return fail('No fue posible encontrar el archivo.')
    }

    await supabase.storage.from(BUCKET).remove([archivo.url_storage])

    const { error } = await supabase.from('archivos_pedido').delete().eq('id', archivoId)
    if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
    return ok(null)
  },

  async descargar(archivoId: string): Promise<ServiceResponse<string>> {
    return this.obtenerUrlPublica(archivoId)
  },

  async consultarArchivos(pedidoId: string): Promise<ServiceResponse<ArchivoPedido[]>> {
    const { data, error } = await supabase
      .from('archivos_pedido')
      .select()
      .eq('pedido_id', pedidoId)
      .order('created_at', { ascending: false })

    if (error) return fail(friendlyMessage(error, 'No fue posible consultar los archivos del pedido.'))
    return ok(data)
  },

  // El bucket es privado (Etapa 2), así que la "URL pública" es en
  // realidad una URL firmada de vigencia limitada.
  async obtenerUrlPublica(archivoId: string): Promise<ServiceResponse<string>> {
    const { data: archivo, error: errorConsulta } = await supabase
      .from('archivos_pedido')
      .select('url_storage')
      .eq('id', archivoId)
      .single()

    if (errorConsulta || !archivo) {
      return fail('No fue posible encontrar el archivo.')
    }

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(archivo.url_storage, URL_EXPIRACION_SEGUNDOS)

    if (error || !data) {
      return fail('No fue posible generar el enlace del archivo.')
    }
    return ok(data.signedUrl)
  },
}
