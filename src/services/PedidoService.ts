import { supabase } from '@/config/supabaseClient'
import { ok, fail, friendlyMessage } from '@/services/utils/serviceResponse'
import { CostoService } from '@/services/CostoService'
import { FinanzasService } from '@/services/FinanzasService'
import type { ServiceResponse } from '@/types/service'
import type { Json } from '@/types/supabase'
import type {
  CanalIngresoPedido,
  EstadoPedido,
  HistorialPedido,
  MetodoPago,
  Pedido,
  PedidoDetalle,
  PrioridadPedido,
} from '@/types/database'

export interface DetalleInput {
  producto_id: string
  cantidad: number
  precio_unitario: number
  observaciones?: string
}

export interface CrearPedidoInput {
  cliente_id: string
  canal_ingreso: CanalIngresoPedido
  detalle: DetalleInput[]
  fecha_entrega?: string
  prioridad?: PrioridadPedido
  observaciones?: string
  descuento?: number
  anticipo?: number
  metodo_pago?: MetodoPago
}

export interface ActualizarPedidoInput {
  fecha_entrega?: string
  prioridad?: PrioridadPedido
  canal_ingreso?: CanalIngresoPedido
  observaciones?: string
  metodo_pago?: MetodoPago
}

export interface ListarPedidosFiltros {
  clienteId?: string
  estado?: EstadoPedido
}

const FALLBACK_ERROR = 'No fue posible completar la operación con el pedido.'

function mapCrearPedidoError(code: string | undefined): string | null {
  if (code === 'P0002') return 'El pedido debe tener al menos un producto.'
  if (code === 'P0003') return 'El total del pedido debe ser mayor que cero.'
  return null
}

export const PedidoService = {
  async crear(input: CrearPedidoInput): Promise<ServiceResponse<Pedido>> {
    if (!input.cliente_id) return fail('El cliente es obligatorio.')
    if (input.detalle.length === 0) {
      return fail('El pedido debe tener al menos un producto.')
    }

    const { data, error } = await supabase.rpc('crear_pedido', {
      p_cliente_id: input.cliente_id,
      p_canal_ingreso: input.canal_ingreso,
      p_detalle: input.detalle as unknown as Json,
      p_fecha_entrega: input.fecha_entrega || undefined,
      p_prioridad: input.prioridad,
      p_observaciones: input.observaciones || undefined,
      p_descuento: input.descuento,
      p_anticipo: input.anticipo,
      p_metodo_pago: input.metodo_pago,
    })

    if (error) {
      return fail(mapCrearPedidoError(error.code) ?? friendlyMessage(error, FALLBACK_ERROR))
    }
    return ok(data)
  },

  async update(
    id: string,
    input: ActualizarPedidoInput,
  ): Promise<ServiceResponse<Pedido>> {
    const { data, error } = await supabase
      .from('pedidos')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
    return ok(data)
  },

  async findById(id: string): Promise<ServiceResponse<Pedido>> {
    const { data, error } = await supabase
      .from('pedidos')
      .select()
      .eq('id', id)
      .single()

    if (error) return fail(friendlyMessage(error, 'No fue posible encontrar el pedido.'))
    return ok(data)
  },

  async list(filtros: ListarPedidosFiltros = {}): Promise<ServiceResponse<Pedido[]>> {
    let query = supabase.from('pedidos').select()

    if (filtros.clienteId) query = query.eq('cliente_id', filtros.clienteId)
    if (filtros.estado) query = query.eq('estado', filtros.estado)

    const { data, error } = await query.order('fecha_pedido', { ascending: false })

    if (error) return fail(friendlyMessage(error, 'No fue posible listar los pedidos.'))
    return ok(data)
  },

  async obtenerDetalle(pedidoId: string): Promise<ServiceResponse<PedidoDetalle[]>> {
    const { data, error } = await supabase
      .from('pedido_detalle')
      .select()
      .eq('pedido_id', pedidoId)

    if (error) return fail(friendlyMessage(error, 'No fue posible consultar el detalle del pedido.'))
    return ok(data)
  },

  async cambiarEstado(
    pedidoId: string,
    nuevoEstado: EstadoPedido,
    comentario?: string,
  ): Promise<ServiceResponse<Pedido>> {
    const { data, error } = await supabase.rpc('cambiar_estado_pedido', {
      p_pedido_id: pedidoId,
      p_nuevo_estado: nuevoEstado,
      p_comentario: comentario,
    })

    if (error) {
      if (error.code === 'P0004') return fail('No fue posible encontrar el pedido.')
      if (error.code === 'P0007') return fail('Un pedido entregado no puede volver a estado Nuevo.')
      if (error.code === 'P0008') {
        return fail('No se puede marcar como Entregado un pedido con saldo pendiente.')
      }
      return fail(friendlyMessage(error, FALLBACK_ERROR))
    }

    // Automatización documentada en 43_ANALISIS_FINANZAS.md: al entregar un
    // pedido totalmente pagado, se distribuye automáticamente la utilidad.
    if (nuevoEstado === 'Entregado' && data.saldo_pendiente === 0) {
      await this.distribuirUtilidadSiCorresponde(data)
    }

    return ok(data)
  },

  async registrarPago(pedidoId: string, valor: number): Promise<ServiceResponse<Pedido>> {
    const { data, error } = await supabase.rpc('registrar_pago_pedido', {
      p_pedido_id: pedidoId,
      p_valor: valor,
    })

    if (error) {
      if (error.code === 'P0005') return fail('El valor del pago debe ser mayor que cero.')
      if (error.code === 'P0006') return fail('El pago supera el saldo pendiente del pedido.')
      return fail(friendlyMessage(error, FALLBACK_ERROR))
    }
    return ok(data)
  },

  async cancelar(pedidoId: string, motivo?: string): Promise<ServiceResponse<Pedido>> {
    return this.cambiarEstado(pedidoId, 'Cancelado', motivo)
  },

  async finalizar(pedidoId: string): Promise<ServiceResponse<Pedido>> {
    return this.cambiarEstado(pedidoId, 'Entregado')
  },

  async obtenerHistorial(pedidoId: string): Promise<ServiceResponse<HistorialPedido[]>> {
    const { data, error } = await supabase
      .from('historial_pedidos')
      .select()
      .eq('pedido_id', pedidoId)
      .order('fecha', { ascending: false })

    if (error) return fail(friendlyMessage(error, 'No fue posible obtener el historial del pedido.'))
    return ok(data)
  },

  async duplicar(pedidoId: string): Promise<ServiceResponse<Pedido>> {
    const original = await this.findById(pedidoId)
    if (!original.success || !original.data) {
      return fail('No fue posible encontrar el pedido a duplicar.')
    }

    const detalle = await this.obtenerDetalle(pedidoId)
    if (!detalle.success || !detalle.data) {
      return fail('No fue posible obtener el detalle del pedido a duplicar.')
    }

    return this.crear({
      cliente_id: original.data.cliente_id,
      canal_ingreso: original.data.canal_ingreso,
      detalle: detalle.data.map((item) => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        observaciones: item.observaciones ?? undefined,
      })),
      prioridad: original.data.prioridad,
      observaciones: original.data.observaciones ?? undefined,
      metodo_pago: original.data.metodo_pago ?? undefined,
    })
  },

  // No forma parte del contrato público del servicio: soporta cambiarEstado().
  async distribuirUtilidadSiCorresponde(pedido: Pedido): Promise<void> {
    const detalle = await this.obtenerDetalle(pedido.id)
    if (!detalle.success || !detalle.data) return

    const costos = await Promise.all(
      detalle.data.map((item) => CostoService.consultarCostos(item.producto_id)),
    )

    const costoTotalPedido = detalle.data.reduce((total, item, index) => {
      const costoProducto = costos[index]
      const costoUnitario = costoProducto.success ? (costoProducto.data?.costo_total ?? 0) : 0
      return total + costoUnitario * item.cantidad
    }, 0)

    const utilidadBruta = pedido.valor_total - costoTotalPedido
    if (utilidadBruta > 0) {
      await FinanzasService.distribuirUtilidad(utilidadBruta, pedido.id)
    }
  },
}
