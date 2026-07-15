import { ClienteService } from '@/services/ClienteService'
import { CostoService } from '@/services/CostoService'
import { DashboardService } from '@/services/DashboardService'
import { FinanzasService } from '@/services/FinanzasService'
import { InventarioService } from '@/services/InventarioService'
import { PedidoService } from '@/services/PedidoService'
import { ok, fail } from '@/services/utils/serviceResponse'
import type { ServiceResponse } from '@/types/service'
import { rangoDelMesActual } from '@/utils/dateRanges'

const EXPORTACION_NO_DISPONIBLE_V1 =
  'Las exportaciones (Excel, PDF, CSV) están planificadas para la versión 2 del sistema.'

export const ReporteService = {
  async ventas(desde?: string, hasta?: string) {
    const pedidos = await PedidoService.list()
    if (!pedidos.success || !pedidos.data) return pedidos

    const filtrados = pedidos.data.filter((pedido) => {
      if (pedido.estado === 'Cancelado') return false
      if (desde && pedido.fecha_pedido < desde) return false
      if (hasta && pedido.fecha_pedido > hasta) return false
      return true
    })

    return ok(filtrados)
  },

  async utilidad(desde: string, hasta: string) {
    return FinanzasService.obtenerUtilidad(desde, hasta)
  },

  async inventario() {
    return InventarioService.listarInsumos()
  },

  async clientes() {
    return ClienteService.list()
  },

  async finanzas(desde?: string, hasta?: string) {
    return FinanzasService.consultarMovimientos({ desde, hasta })
  },

  async pedidos(estado?: Parameters<typeof PedidoService.list>[0]) {
    return PedidoService.list(estado)
  },

  async costos() {
    return CostoService.listarConProductos()
  },

  // "Dashboard" en Docs/54_PLAN_DESARROLLO.md (Etapa 11): resumen ejecutivo
  // de indicadores del mes, reutilizando DashboardService.
  async resumenEjecutivo() {
    const { anio, mes, desde, hasta } = rangoDelMesActual()
    const [ventasMes, utilidadMes, pedidosPendientes, metas] = await Promise.all([
      DashboardService.ventasDelMes(),
      DashboardService.utilidad(desde, hasta),
      DashboardService.pedidosPendientes(),
      DashboardService.metas(anio, mes),
    ])

    if (!ventasMes.success) return ventasMes
    if (!utilidadMes.success) return utilidadMes
    if (!pedidosPendientes.success) return pedidosPendientes

    return ok({
      ventasMes: ventasMes.data ?? 0,
      utilidadMes: utilidadMes.data ?? 0,
      pedidosPendientes: pedidosPendientes.data?.length ?? 0,
      cumplimientoPresupuesto: metas.success ? metas.data : undefined,
    })
  },

  // Exportaciones explícitamente fuera de alcance de la V1
  // (Docs/55_ROADMAP_PRODUCTO.md y 53_API_CONTRACT.md las marcan "(V2)").
  async exportarExcel(): Promise<ServiceResponse<never>> {
    return fail(EXPORTACION_NO_DISPONIBLE_V1)
  },

  async exportarPDF(): Promise<ServiceResponse<never>> {
    return fail(EXPORTACION_NO_DISPONIBLE_V1)
  },

  async exportarCSV(): Promise<ServiceResponse<never>> {
    return fail(EXPORTACION_NO_DISPONIBLE_V1)
  },
}
