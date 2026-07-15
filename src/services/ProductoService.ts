import { supabase } from '@/config/supabaseClient'
import { ok, fail, friendlyMessage } from '@/services/utils/serviceResponse'
import { CostoService, type Rentabilidad } from '@/services/CostoService'
import type { ServiceResponse } from '@/types/service'
import type { CostoProducto, Producto } from '@/types/database'

export interface CrearProductoInput {
  categoria_id: string
  nombre: string
  descripcion?: string
  precio_base: number
}

export type ActualizarProductoInput = Partial<CrearProductoInput>

const FALLBACK_ERROR = 'No fue posible completar la operación con el producto.'

export const ProductoService = {
  async create(input: CrearProductoInput): Promise<ServiceResponse<Producto>> {
    if (!input.nombre.trim()) {
      return fail('El nombre del producto es obligatorio.')
    }
    if (input.precio_base <= 0) {
      return fail('El precio base debe ser mayor que cero.')
    }

    const { data, error } = await supabase
      .from('productos')
      .insert(input)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
    return ok(data)
  },

  async update(
    id: string,
    input: ActualizarProductoInput,
  ): Promise<ServiceResponse<Producto>> {
    if (input.nombre !== undefined && !input.nombre.trim()) {
      return fail('El nombre del producto es obligatorio.')
    }
    if (input.precio_base !== undefined && input.precio_base <= 0) {
      return fail('El precio base debe ser mayor que cero.')
    }

    const { data, error } = await supabase
      .from('productos')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
    return ok(data)
  },

  async findById(id: string): Promise<ServiceResponse<Producto>> {
    const { data, error } = await supabase
      .from('productos')
      .select()
      .eq('id', id)
      .single()

    if (error) return fail(friendlyMessage(error, 'No fue posible encontrar el producto.'))
    return ok(data)
  },

  async list(): Promise<ServiceResponse<Producto[]>> {
    const { data, error } = await supabase
      .from('productos')
      .select()
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) return fail(friendlyMessage(error, 'No fue posible listar los productos.'))
    return ok(data)
  },

  async search(query: string): Promise<ServiceResponse<Producto[]>> {
    const { data, error } = await supabase
      .from('productos')
      .select()
      .eq('activo', true)
      .ilike('nombre', `%${query}%`)
      .order('nombre', { ascending: true })

    if (error) return fail(friendlyMessage(error, 'No fue posible buscar productos.'))
    return ok(data)
  },

  async desactivar(id: string): Promise<ServiceResponse<Producto>> {
    const { data, error } = await supabase
      .from('productos')
      .update({ activo: false })
      .eq('id', id)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, 'No fue posible desactivar el producto.'))
    return ok(data)
  },

  async obtenerCostos(productoId: string): Promise<ServiceResponse<CostoProducto>> {
    return CostoService.consultarCostos(productoId)
  },

  async obtenerRentabilidad(productoId: string): Promise<ServiceResponse<Rentabilidad>> {
    return CostoService.obtenerRentabilidad(productoId)
  },
}
