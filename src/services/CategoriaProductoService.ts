import { supabase } from '@/config/supabaseClient'
import { ok, fail, friendlyMessage } from '@/services/utils/serviceResponse'
import type { ServiceResponse } from '@/types/service'
import type { CategoriaProducto } from '@/types/database'

// No forma parte de la lista oficial de 53_API_CONTRACT.md, pero
// categorias_producto es una tabla real del esquema y 56_ESTANDARES_DESARROLLO.md
// (de mayor jerarquía que el API Contract, ver 57_GUIA_CLAUDE_CODE.md
// "JERARQUÍA DE DOCUMENTOS") prohíbe acceder a Supabase fuera de un servicio.

export interface CrearCategoriaInput {
  nombre: string
  descripcion?: string
}

const FALLBACK_ERROR = 'No fue posible completar la operación con la categoría.'

export const CategoriaProductoService = {
  async create(input: CrearCategoriaInput): Promise<ServiceResponse<CategoriaProducto>> {
    if (!input.nombre.trim()) return fail('El nombre de la categoría es obligatorio.')

    const { data, error } = await supabase
      .from('categorias_producto')
      .insert(input)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
    return ok(data)
  },

  async list(): Promise<ServiceResponse<CategoriaProducto[]>> {
    const { data, error } = await supabase
      .from('categorias_producto')
      .select()
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) return fail(friendlyMessage(error, 'No fue posible listar las categorías.'))
    return ok(data)
  },

  async desactivar(id: string): Promise<ServiceResponse<CategoriaProducto>> {
    const { data, error } = await supabase
      .from('categorias_producto')
      .update({ activo: false })
      .eq('id', id)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, 'No fue posible desactivar la categoría.'))
    return ok(data)
  },
}
