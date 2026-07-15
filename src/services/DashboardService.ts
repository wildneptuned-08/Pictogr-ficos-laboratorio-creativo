import { supabase } from '@/config/supabaseClient'
import { ok, fail, friendlyMessage } from '@/services/utils/serviceResponse'
import { FinanzasService } from '@/services/FinanzasService'
import { PresupuestoService } from '@/services/PresupuestoService'
import { InventarioService } from '@/services/InventarioService'
import type { ServiceResponse } from '@/types/service'
import type { Inventario, Pedido } from '@/types/database'

export interface ProductoMasVendido {
  productoId: string
  cantidadVendida: number
}

export interface ClienteFrecuente {
  clienteId: string
  cantidadPedidos: number
}

export interface TendenciaMensual {
  anio: number
  mes: number
  ventas: number
}

function rangoDelDia(fecha: Date) {
  const iso = fecha.toISOString().slice(0, 10)
  return { desde: `${iso}T00:00:00`, hasta: `${iso}T23:59:59` }
}

function rangoDelMes(fecha: Date) {
  const anio = fecha.getFullYear()
  const mes = fecha.getMonth() + 1
  const ultimoDia = new Date(anio, mes, 0).getDate()
  return {
    desde: `${anio}-${String(mes).padStart(2, '0')}-01`,
    hasta: `${anio}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`,
  }
}

async function sumarVentas(desde: string, hasta: string): Promise<ServiceResponse<number>> {
  const { data, error } = await supabase
    .from('pedidos')
    .select('valor_total')
    .neq('estado', 'Cancelado')
    .gte('fecha_pedido', desde)
    .lte('fecha_pedido', hasta)

  if (error) return fail(friendlyMessage(error, 'No fue posible calcular las ventas.'))
  return ok(data.reduce((total, p) => total + p.valor_total, 0))
}

export const DashboardService = {
  async ventasDelMes(fecha: Date = new Date()): Promise<ServiceResponse<number>> {
    const { desde, hasta } = rangoDelMes(fecha)
    return sumarVentas(desde, hasta)
  },

  async ventasDelDia(fecha: Date = new Date()): Promise<ServiceResponse<number>> {
    const { desde, hasta } = rangoDelDia(fecha)
    return sumarVentas(desde, hasta)
  },

  async pedidosPendientes(): Promise<ServiceResponse<Pedido[]>> {
    const { data, error } = await supabase
      .from('pedidos')
      .select()
      .not('estado', 'in', '(Entregado,Cancelado)')
      .order('fecha_pedido', { ascending: true })

    if (error) return fail(friendlyMessage(error, 'No fue posible consultar los pedidos pendientes.'))
    return ok(data)
  },

  async utilidad(desde: string, hasta: string): Promise<ServiceResponse<number>> {
    return FinanzasService.obtenerUtilidad(desde, hasta)
  },

  async metas(anio: number, mes: number) {
    return PresupuestoService.calcularCumplimiento(anio, mes)
  },

  async productosMasVendidos(limite = 5): Promise<ServiceResponse<ProductoMasVendido[]>> {
    const { data, error } = await supabase.from('pedido_detalle').select('producto_id, cantidad')

    if (error) return fail(friendlyMessage(error, 'No fue posible calcular los productos más vendidos.'))

    const totales = new Map<string, number>()
    for (const item of data) {
      totales.set(item.producto_id, (totales.get(item.producto_id) ?? 0) + item.cantidad)
    }

    const resultado = Array.from(totales.entries())
      .map(([productoId, cantidadVendida]) => ({ productoId, cantidadVendida }))
      .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
      .slice(0, limite)

    return ok(resultado)
  },

  async inventarioCritico(): Promise<ServiceResponse<Inventario[]>> {
    return InventarioService.obtenerStockCritico()
  },

  async clientesFrecuentes(limite = 5): Promise<ServiceResponse<ClienteFrecuente[]>> {
    const { data, error } = await supabase
      .from('pedidos')
      .select('cliente_id')
      .neq('estado', 'Cancelado')

    if (error) return fail(friendlyMessage(error, 'No fue posible calcular los clientes frecuentes.'))

    const totales = new Map<string, number>()
    for (const item of data) {
      totales.set(item.cliente_id, (totales.get(item.cliente_id) ?? 0) + 1)
    }

    const resultado = Array.from(totales.entries())
      .map(([clienteId, cantidadPedidos]) => ({ clienteId, cantidadPedidos }))
      .sort((a, b) => b.cantidadPedidos - a.cantidadPedidos)
      .slice(0, limite)

    return ok(resultado)
  },

  async tendencias(mesesAtras = 6): Promise<ServiceResponse<TendenciaMensual[]>> {
    const hoy = new Date()
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - (mesesAtras - 1), 1)
    const { desde } = rangoDelMes(inicio)
    const { hasta } = rangoDelMes(hoy)

    const { data, error } = await supabase
      .from('pedidos')
      .select('fecha_pedido, valor_total')
      .neq('estado', 'Cancelado')
      .gte('fecha_pedido', desde)
      .lte('fecha_pedido', hasta)

    if (error) return fail(friendlyMessage(error, 'No fue posible calcular las tendencias.'))

    const totales = new Map<string, number>()
    for (const pedido of data) {
      const fecha = new Date(pedido.fecha_pedido)
      const clave = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`
      totales.set(clave, (totales.get(clave) ?? 0) + pedido.valor_total)
    }

    const resultado: TendenciaMensual[] = Array.from(totales.entries()).map(([clave, ventas]) => {
      const [anio, mes] = clave.split('-').map(Number)
      return { anio, mes, ventas }
    })

    resultado.sort((a, b) => a.anio - b.anio || a.mes - b.mes)
    return ok(resultado)
  },
}
