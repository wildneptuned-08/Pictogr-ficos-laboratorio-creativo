import { supabase } from '@/config/supabaseClient'
import { ok, fail, friendlyMessage } from '@/services/utils/serviceResponse'
import type { ServiceResponse } from '@/types/service'
import type { Cliente, Pedido } from '@/types/database'

export interface CrearClienteInput {
  nombre: string
  telefono: string
  correo?: string
  direccion?: string
  ciudad?: string
  observaciones?: string
}

export type ActualizarClienteInput = Partial<CrearClienteInput>

const FALLBACK_ERROR = 'No fue posible completar la operación con el cliente.'

export const ClienteService = {
  async create(input: CrearClienteInput): Promise<ServiceResponse<Cliente>> {
    if (!input.nombre.trim()) {
      return fail('El nombre del cliente es obligatorio.')
    }
    if (!input.telefono.trim()) {
      return fail('El teléfono del cliente es obligatorio.')
    }

    const { data: existente } = await supabase
      .from('clientes')
      .select('id')
      .eq('telefono', input.telefono)
      .maybeSingle()

    if (existente) {
      return fail('Ya existe un cliente registrado con ese teléfono.')
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert(input)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
    return ok(data)
  },

  async update(
    id: string,
    input: ActualizarClienteInput,
  ): Promise<ServiceResponse<Cliente>> {
    if (input.nombre !== undefined && !input.nombre.trim()) {
      return fail('El nombre del cliente es obligatorio.')
    }

    const { data, error } = await supabase
      .from('clientes')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
    return ok(data)
  },

  async findById(id: string): Promise<ServiceResponse<Cliente>> {
    const { data, error } = await supabase
      .from('clientes')
      .select()
      .eq('id', id)
      .single()

    if (error) return fail(friendlyMessage(error, 'No fue posible encontrar el cliente.'))
    return ok(data)
  },

  async list(): Promise<ServiceResponse<Cliente[]>> {
    const { data, error } = await supabase
      .from('clientes')
      .select()
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) return fail(friendlyMessage(error, 'No fue posible listar los clientes.'))
    return ok(data)
  },

  async search(query: string): Promise<ServiceResponse<Cliente[]>> {
    const { data, error } = await supabase
      .from('clientes')
      .select()
      .eq('activo', true)
      .or(`nombre.ilike.%${query}%,telefono.ilike.%${query}%`)
      .order('nombre', { ascending: true })

    if (error) return fail(friendlyMessage(error, 'No fue posible buscar clientes.'))
    return ok(data)
  },

  async desactivar(id: string): Promise<ServiceResponse<Cliente>> {
    const { data, error } = await supabase
      .from('clientes')
      .update({ activo: false })
      .eq('id', id)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, 'No fue posible desactivar el cliente.'))
    return ok(data)
  },

  async obtenerHistorialPedidos(clienteId: string): Promise<ServiceResponse<Pedido[]>> {
    const { data, error } = await supabase
      .from('pedidos')
      .select()
      .eq('cliente_id', clienteId)
      .order('fecha_pedido', { ascending: false })

    if (error) {
      return fail(friendlyMessage(error, 'No fue posible obtener el historial del cliente.'))
    }
    return ok(data)
  },
}
