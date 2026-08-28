import { supabase } from '@/config/supabaseClient'
import { ok, fail, friendlyMessage } from '@/services/utils/serviceResponse'
import { CostoService } from '@/services/CostoService'
import { FinanzasService } from '@/services/FinanzasService'
import type { ServiceResponse } from '@/types/service'
import type { Json } from '@/types/supabase'
import type {
  CanalIngresoPedido,
  Cliente,
  EstadoPedido,
  HistorialPedido,
  MetodoPago,
  Pedido,
  PedidoDetalle,
  PrioridadPedido,
} from '@/types/database'

// Pedido con el cliente relacionado embebido (nombre + teléfono): lo usa la
// vista de Pedidos para el botón de WhatsApp sin disparar una consulta por
// fila (evita N+1). `cliente_id` es NOT NULL en la base, así que en la
// práctica siempre viene un cliente; se tipa como nullable solo porque
// PostgREST no lo garantiza a nivel de tipos.
export interface PedidoConCliente extends Pedido {
  cliente: Pick<Cliente, 'nombre' | 'telefono'> | null
}

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

export interface ActualizarDetalleInput {
  detalle: DetalleInput[]
  descuento?: number
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

  // Edita las líneas del pedido (productos/cantidades/precios) y su descuento,
  // recalculando totales y saldo de forma atómica vía RPC.
  async actualizarDetalle(
    id: string,
    input: ActualizarDetalleInput,
  ): Promise<ServiceResponse<Pedido>> {
    if (input.detalle.length === 0) {
      return fail('El pedido debe tener al menos un producto.')
    }

    const { data, error } = await supabase.rpc('actualizar_pedido_detalle', {
      p_pedido_id: id,
      p_detalle: input.detalle as unknown as Json,
      p_descuento: input.descuento,
      p_fecha_entrega: input.fecha_entrega || undefined,
      p_prioridad: input.prioridad,
      p_canal_ingreso: input.canal_ingreso,
      p_observaciones: input.observaciones || undefined,
      p_metodo_pago: input.metodo_pago,
    })

    if (error) {
      if (error.code === 'P0002') return fail('El pedido debe tener al menos un producto.')
      if (error.code === 'P0003') return fail('El total del pedido debe ser mayor que cero.')
      if (error.code === 'P0004') return fail('No fue posible encontrar el pedido.')
      if (error.code === 'P0010') {
        return fail('El nuevo total no puede ser menor que lo que el cliente ya pagó.')
      }
      if (error.code === 'P0011') {
        return fail('No se puede editar un pedido entregado o cancelado.')
      }
      return fail(friendlyMessage(error, FALLBACK_ERROR))
    }
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

  // Misma consulta que list(), pero trae el nombre y teléfono del cliente
  // en el mismo viaje (join embebido de PostgREST), para el botón de
  // WhatsApp de la vista de Pedidos. Método aparte de list() para no
  // cambiarle la forma del resultado a sus otros consumidores
  // (DashboardPage, ReporteService).
  async listConCliente(
    filtros: ListarPedidosFiltros = {},
  ): Promise<ServiceResponse<PedidoConCliente[]>> {
    let query = supabase.from('pedidos').select('*, cliente:clientes(nombre, telefono)')

    if (filtros.clienteId) query = query.eq('cliente_id', filtros.clienteId)
    if (filtros.estado) query = query.eq('estado', filtros.estado)

    const { data, error } = await query.order('fecha_pedido', { ascending: false })

    if (error) return fail(friendlyMessage(error, 'No fue posible listar los pedidos.'))
    // PostgREST devuelve el embed como objeto único (cliente_id es un FK
    // simple, no una relación muchos-a-muchos); el generador de tipos de
    // Supabase no puede confirmar la cardinalidad sin una unique constraint
    // en cliente_id, así que lo tipa de forma conservadora. Se castea aquí
    // una sola vez en vez de pelear con el inferido en cada consumidor.
    return ok(data as unknown as PedidoConCliente[])
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
        return fail(
          'No se puede marcar como Entregado un pedido con saldo pendiente. Registra el pago completo primero.',
        )
      }
      if (error.code === 'P0012') {
        return fail(
          'Un pedido ya entregado no puede marcarse como venta con pérdida: su utilidad ya se distribuyó.',
        )
      }
      if (error.code === 'P0013') {
        return fail(
          'Venta con pérdida es un estado final. Para corregirlo, registra un ajuste en Finanzas.',
        )
      }
      if (error.code === 'P0014') {
        const insumo = error.message.split(':')[1]?.trim()
        return fail(
          insumo
            ? `No hay stock suficiente de "${insumo}" para pasar este pedido a Producción.`
            : 'No hay stock suficiente de un insumo para pasar este pedido a Producción.',
        )
      }
      return fail(friendlyMessage(error, FALLBACK_ERROR))
    }

    // Automatización documentada en 43_ANALISIS_FINANZAS.md: al entregar un
    // pedido totalmente pagado, se distribuye automáticamente la utilidad.
    if (nuevoEstado === 'Entregado' && data.saldo_pendiente === 0) {
      await this.distribuirUtilidadSiCorresponde(data)
    }

    // Contraparte: el pedido perdido no genera venta, pero el costo de
    // producción ya se gastó, así que se resta de la utilidad.
    if (nuevoEstado === 'Venta con pérdida') {
      await this.registrarPerdidaSiCorresponde(data)
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

  // A diferencia de cancelar(), borra el pedido de forma definitiva junto
  // con su detalle, historial y archivos, y con el rastro financiero y de
  // inventario que haya generado (revirtiendo antes su efecto en los
  // saldos de bolsillos y en el stock, vía la función eliminar_pedido).
  async eliminar(pedidoId: string): Promise<ServiceResponse<void>> {
    const { error } = await supabase.rpc('eliminar_pedido', { p_pedido_id: pedidoId })

    if (error) {
      if (error.code === 'P0004') return fail('No fue posible encontrar el pedido.')
      return fail(friendlyMessage(error, 'No fue posible eliminar el pedido.'))
    }
    return ok(undefined)
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
  async calcularCostoProduccion(pedidoId: string): Promise<number | null> {
    const detalle = await this.obtenerDetalle(pedidoId)
    if (!detalle.success || !detalle.data) return null

    const costos = await Promise.all(
      detalle.data.map((item) => CostoService.consultarCostos(item.producto_id)),
    )

    return detalle.data.reduce((total, item, index) => {
      const costoProducto = costos[index]
      const costoUnitario = costoProducto.success ? (costoProducto.data?.costo_total ?? 0) : 0
      return total + costoUnitario * item.cantidad
    }, 0)
  },

  async distribuirUtilidadSiCorresponde(pedido: Pedido): Promise<void> {
    const costoTotalPedido = await this.calcularCostoProduccion(pedido.id)
    if (costoTotalPedido === null) return

    const utilidadBruta = pedido.valor_total - costoTotalPedido
    if (utilidadBruta > 0) {
      await FinanzasService.distribuirUtilidad(utilidadBruta, pedido.id)
    }
  },

  // La pérdida es el costo de producción ya incurrido: los insumos se
  // gastaron y el pedido no se pudo entregar, así que no hay ingreso que lo
  // compense. Si el producto no tiene costos cargados, no hay nada que restar.
  async registrarPerdidaSiCorresponde(pedido: Pedido): Promise<void> {
    const costoTotalPedido = await this.calcularCostoProduccion(pedido.id)
    if (costoTotalPedido === null || costoTotalPedido <= 0) return

    await FinanzasService.registrarPerdida(costoTotalPedido, pedido.id)
  },
}
