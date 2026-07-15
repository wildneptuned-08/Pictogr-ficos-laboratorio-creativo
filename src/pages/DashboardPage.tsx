import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  TrendingUp,
  AlertTriangle,
  Package,
  Users,
  Target,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { KpiCard } from '@/components/data/KpiCard'
import { VentasChart } from '@/components/data/VentasChart'
import { DashboardService } from '@/services/DashboardService'
import { FinanzasService } from '@/services/FinanzasService'
import { PedidoService } from '@/services/PedidoService'
import { ProductoService } from '@/services/ProductoService'
import { ClienteService } from '@/services/ClienteService'
import { formatCurrency } from '@/utils/formatCurrency'
import { rangoDelMesActual } from '@/utils/dateRanges'
import type { EstadoPedido } from '@/types/database'

const MESES_CORTOS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

const ESTADOS: EstadoPedido[] = ['Nuevo', 'Diseño', 'Producción', 'Listo', 'Entregado', 'Cancelado']

export function DashboardPage() {
  const { anio, mes, desde, hasta } = rangoDelMesActual()

  const { data: ventasDia = 0 } = useQuery({
    queryKey: ['dashboard-ventas-dia'],
    queryFn: async () => {
      const r = await DashboardService.ventasDelDia()
      if (!r.success) throw new Error(r.error?.message)
      return r.data ?? 0
    },
  })

  const { data: ventasMes = 0 } = useQuery({
    queryKey: ['dashboard-ventas-mes'],
    queryFn: async () => {
      const r = await DashboardService.ventasDelMes()
      if (!r.success) throw new Error(r.error?.message)
      return r.data ?? 0
    },
  })

  const { data: pedidosPendientes = [] } = useQuery({
    queryKey: ['dashboard-pedidos-pendientes'],
    queryFn: async () => {
      const r = await DashboardService.pedidosPendientes()
      if (!r.success) throw new Error(r.error?.message)
      return r.data ?? []
    },
  })

  const { data: utilidadMes = 0 } = useQuery({
    queryKey: ['utilidad-mes'],
    queryFn: async () => {
      const r = await DashboardService.utilidad(desde, hasta)
      if (!r.success) throw new Error(r.error?.message)
      return r.data ?? 0
    },
  })

  const cumplimientoQuery = useQuery({
    queryKey: ['dashboard-cumplimiento', anio, mes],
    queryFn: () => DashboardService.metas(anio, mes),
  })

  const { data: bolsillos = [] } = useQuery({
    queryKey: ['bolsillos-financieros'],
    queryFn: async () => {
      const r = await FinanzasService.consultarSaldos()
      if (!r.success) throw new Error(r.error?.message)
      return r.data ?? []
    },
  })

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos', 'todos'],
    queryFn: async () => {
      const r = await PedidoService.list()
      if (!r.success) throw new Error(r.error?.message)
      return r.data ?? []
    },
  })

  const { data: productos = [] } = useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const r = await ProductoService.list()
      if (!r.success) throw new Error(r.error?.message)
      return r.data ?? []
    },
  })

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const r = await ClienteService.list()
      if (!r.success) throw new Error(r.error?.message)
      return r.data ?? []
    },
  })

  const { data: productosMasVendidos = [] } = useQuery({
    queryKey: ['dashboard-productos-mas-vendidos'],
    queryFn: async () => {
      const r = await DashboardService.productosMasVendidos(5)
      if (!r.success) throw new Error(r.error?.message)
      return r.data ?? []
    },
  })

  const { data: clientesFrecuentes = [] } = useQuery({
    queryKey: ['dashboard-clientes-frecuentes'],
    queryFn: async () => {
      const r = await DashboardService.clientesFrecuentes(5)
      if (!r.success) throw new Error(r.error?.message)
      return r.data ?? []
    },
  })

  const { data: inventarioCritico = [] } = useQuery({
    queryKey: ['dashboard-inventario-critico'],
    queryFn: async () => {
      const r = await DashboardService.inventarioCritico()
      if (!r.success) throw new Error(r.error?.message)
      return r.data ?? []
    },
  })

  const { data: tendencias = [] } = useQuery({
    queryKey: ['dashboard-tendencias'],
    queryFn: async () => {
      const r = await DashboardService.tendencias(6)
      if (!r.success) throw new Error(r.error?.message)
      return r.data ?? []
    },
  })

  const nombreProducto = (id: string) => productos.find((p) => p.id === id)?.nombre ?? '—'
  const nombreCliente = (id: string) => clientes.find((c) => c.id === id)?.nombre ?? '—'

  const conteoPorEstado = ESTADOS.map((estado) => ({
    estado,
    cantidad: pedidos.filter((p) => p.estado === estado).length,
  }))

  const hoyISO = new Date().toISOString().slice(0, 10)
  const pedidosVencidos = pedidos.filter(
    (p) => p.fecha_entrega && p.fecha_entrega < hoyISO && !['Entregado', 'Cancelado'].includes(p.estado),
  )
  const pedidosUrgentesPendientes = pedidos.filter(
    (p) => p.prioridad === 'Urgente' && !['Entregado', 'Cancelado'].includes(p.estado),
  )
  const pedidosConPagoPendiente = pedidos.filter((p) => p.saldo_pendiente > 0 && p.estado !== 'Cancelado')
  const bolsillosNegativos = bolsillos.filter((b) => b.saldo_actual < 0)

  const cumplimiento = cumplimientoQuery.data?.success ? cumplimientoQuery.data.data : undefined
  const diasTranscurridos = new Date().getDate()
  const diasDelMes = new Date(anio, mes, 0).getDate()
  const ritmoEsperadoPorcentaje = (diasTranscurridos / diasDelMes) * 100
  const metaAtrasada =
    cumplimiento !== undefined && cumplimiento.cumplimientoPorcentaje < ritmoEsperadoPorcentaje - 10

  const alertas = [
    ...(inventarioCritico.length > 0
      ? [{ texto: `${inventarioCritico.length} insumo(s) con stock bajo.`, tono: 'warning' as const }]
      : []),
    ...(pedidosUrgentesPendientes.length > 0
      ? [{ texto: `${pedidosUrgentesPendientes.length} pedido(s) urgente(s) pendientes.`, tono: 'critical' as const }]
      : []),
    ...(pedidosVencidos.length > 0
      ? [{ texto: `${pedidosVencidos.length} pedido(s) con fecha de entrega vencida.`, tono: 'critical' as const }]
      : []),
    ...(pedidosConPagoPendiente.length > 0
      ? [{ texto: `${pedidosConPagoPendiente.length} pedido(s) con saldo pendiente de pago.`, tono: 'warning' as const }]
      : []),
    ...(bolsillosNegativos.length > 0
      ? [{ texto: `Saldo negativo en: ${bolsillosNegativos.map((b) => b.nombre).join(', ')}.`, tono: 'critical' as const }]
      : []),
    ...(metaAtrasada
      ? [{ texto: 'La meta del mes va atrasada respecto al ritmo esperado.', tono: 'warning' as const }]
      : []),
  ]

  const datosGrafico = tendencias.map((t) => ({
    mes: `${MESES_CORTOS[t.mes - 1]} ${String(t.anio).slice(2)}`,
    ventas: t.ventas,
  }))

  return (
    <>
      <PageHeader title="Dashboard" description="Indicadores generales del negocio." />

      {alertas.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
          <div className="mb-1 flex items-center gap-1.5 text-sm font-medium text-amber-800 dark:text-amber-300">
            <AlertTriangle className="size-4" aria-hidden="true" />
            Alertas
          </div>
          <ul className="flex flex-col gap-0.5 text-sm text-amber-800 dark:text-amber-300">
            {alertas.map((alerta) => (
              <li key={alerta.texto}>• {alerta.texto}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard icon={TrendingUp} title="Ventas del día" value={formatCurrency(ventasDia)} />
        <KpiCard icon={TrendingUp} title="Ventas del mes" value={formatCurrency(ventasMes)} />
        <KpiCard
          icon={ShoppingCart}
          title="Pedidos pendientes"
          value={String(pedidosPendientes.length)}
        />
        <KpiCard icon={Wallet} title="Utilidad del mes" value={formatCurrency(utilidadMes)} />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <h3 className="mb-3 flex items-center gap-1.5 font-medium">
            <LayoutDashboard className="size-4" aria-hidden="true" />
            Ventas mensuales
          </h3>
          <VentasChart data={datosGrafico} />
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 flex items-center gap-1.5 font-medium">
            <Target className="size-4" aria-hidden="true" />
            Cumplimiento del presupuesto
          </h3>
          {cumplimiento ? (
            <div className="flex flex-col gap-2 text-sm">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.min(cumplimiento.cumplimientoPorcentaje, 100)}%` }}
                />
              </div>
              <p>{cumplimiento.cumplimientoPorcentaje.toFixed(1)}% de la meta</p>
              <p className="text-muted-foreground">Meta: {formatCurrency(cumplimiento.meta)}</p>
              <p className="text-muted-foreground">
                Ventas actuales: {formatCurrency(cumplimiento.ventasActuales)}
              </p>
              <p className="text-muted-foreground">
                Falta: {formatCurrency(cumplimiento.valorPendiente)}
              </p>
              <p className="text-muted-foreground">
                Promedio diario requerido: {formatCurrency(cumplimiento.promedioDiarioRequerido)}
              </p>
              <p className="text-muted-foreground">
                Proyección de cierre: {formatCurrency(cumplimiento.proyeccionCierre)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay un presupuesto activo registrado para este mes.
            </p>
          )}
        </Card>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-4">
          <h3 className="mb-3 font-medium">Bolsillos financieros</h3>
          <div className="flex flex-col gap-2 text-sm">
            {bolsillos.map((bolsillo) => (
              <div key={bolsillo.id} className="flex justify-between">
                <span className="text-muted-foreground">{bolsillo.nombre}</span>
                <span className={bolsillo.saldo_actual < 0 ? 'text-red-600 dark:text-red-400' : ''}>
                  {formatCurrency(bolsillo.saldo_actual)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 font-medium">Pedidos por estado</h3>
          <div className="flex flex-col gap-2 text-sm">
            {conteoPorEstado.map(({ estado, cantidad }) => (
              <div key={estado} className="flex justify-between">
                <span className="text-muted-foreground">{estado}</span>
                <span>{cantidad}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 flex items-center gap-1.5 font-medium">
            <Package className="size-4" aria-hidden="true" />
            Inventario crítico
          </h3>
          {inventarioCritico.length > 0 ? (
            <ul className="flex flex-col gap-1 text-sm">
              {inventarioCritico.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.nombre}</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {item.stock_actual} / {item.stock_minimo}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Todo el inventario está en niveles normales.</p>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-3 flex items-center gap-1.5 font-medium">
            <ShoppingCart className="size-4" aria-hidden="true" />
            Productos más vendidos
          </h3>
          {productosMasVendidos.length > 0 ? (
            <ul className="flex flex-col gap-1 text-sm">
              {productosMasVendidos.map((item) => (
                <li key={item.productoId} className="flex justify-between">
                  <span>{nombreProducto(item.productoId)}</span>
                  <span className="text-muted-foreground">{item.cantidadVendida} unidades</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Todavía no hay ventas registradas.</p>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 flex items-center gap-1.5 font-medium">
            <Users className="size-4" aria-hidden="true" />
            Clientes frecuentes
          </h3>
          {clientesFrecuentes.length > 0 ? (
            <ul className="flex flex-col gap-1 text-sm">
              {clientesFrecuentes.map((item) => (
                <li key={item.clienteId} className="flex justify-between">
                  <span>{nombreCliente(item.clienteId)}</span>
                  <span className="text-muted-foreground">{item.cantidadPedidos} pedidos</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Todavía no hay pedidos registrados.</p>
          )}
        </Card>
      </div>
    </>
  )
}
