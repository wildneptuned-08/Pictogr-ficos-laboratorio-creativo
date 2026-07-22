import { supabase } from '@/config/supabaseClient'
import { ok, fail, friendlyMessage } from '@/services/utils/serviceResponse'
import type { ServiceResponse } from '@/types/service'
import type { Proveedor } from '@/types/database'

export interface CrearProveedorInput {
  nombre: string
  prefijo_id: string
}

export type ActualizarProveedorInput = Partial<CrearProveedorInput>

const FALLBACK_ERROR = 'No fue posible completar la operación con el proveedor.'

// El prefijo forma parte de los códigos (PREFIJO-XXXX), así que se normaliza a
// mayúsculas sin espacios para que coincida con lo que genera la base de datos.
function normalizarPrefijo(prefijo: string): string {
  return prefijo.trim().toUpperCase().replace(/\s+/g, '')
}

export const ProveedorService = {
  async create(input: CrearProveedorInput): Promise<ServiceResponse<Proveedor>> {
    if (!input.nombre.trim()) {
      return fail('El nombre del proveedor es obligatorio.')
    }
    const prefijo = normalizarPrefijo(input.prefijo_id)
    if (!prefijo) {
      return fail('El prefijo del proveedor es obligatorio.')
    }

    const { data: existente } = await supabase
      .from('proveedores')
      .select('id')
      .eq('prefijo_id', prefijo)
      .maybeSingle()

    if (existente) {
      return fail('Ya existe un proveedor con ese prefijo.')
    }

    const { data, error } = await supabase
      .from('proveedores')
      .insert({ nombre: input.nombre.trim(), prefijo_id: prefijo })
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
    return ok(data)
  },

  async update(
    id: string,
    input: ActualizarProveedorInput,
  ): Promise<ServiceResponse<Proveedor>> {
    if (input.nombre !== undefined && !input.nombre.trim()) {
      return fail('El nombre del proveedor es obligatorio.')
    }

    const cambios: ActualizarProveedorInput = {}
    if (input.nombre !== undefined) cambios.nombre = input.nombre.trim()
    if (input.prefijo_id !== undefined) {
      const prefijo = normalizarPrefijo(input.prefijo_id)
      if (!prefijo) return fail('El prefijo del proveedor es obligatorio.')
      cambios.prefijo_id = prefijo
    }

    const { data, error } = await supabase
      .from('proveedores')
      .update(cambios)
      .eq('id', id)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
    return ok(data)
  },

  async findById(id: string): Promise<ServiceResponse<Proveedor>> {
    const { data, error } = await supabase
      .from('proveedores')
      .select()
      .eq('id', id)
      .single()

    if (error) return fail(friendlyMessage(error, 'No fue posible encontrar el proveedor.'))
    return ok(data)
  },

  async list(): Promise<ServiceResponse<Proveedor[]>> {
    const { data, error } = await supabase
      .from('proveedores')
      .select()
      .order('nombre', { ascending: true })

    if (error) return fail(friendlyMessage(error, 'No fue posible listar los proveedores.'))
    return ok(data)
  },

  async eliminar(id: string): Promise<ServiceResponse<Proveedor>> {
    const { data, error } = await supabase
      .from('proveedores')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, 'No fue posible eliminar el proveedor.'))
    return ok(data)
  },
}
