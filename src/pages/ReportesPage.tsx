import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { FileBarChart, FileDown } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { KpiCard } from '@/components/data/KpiCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ReporteService } from '@/services/ReporteService'
import { ClienteService } from '@/services/ClienteService'
import { FinanzasService } from '@/services/FinanzasService'
import { formatCurrency } from '@/utils/formatCurrency'
import type { Cliente, Inventario, MovimientoFinanciero, Pedido } from '@/types/database'
import type { CostoConProducto } from '@/services/CostoService'

const TIPOS_REPORTE = [
  { value: 'ventas', label: 'Ventas' },
  { value: 'pedidos', label: 'Pedidos' },
  { value: 'inventario', label: 'Inventario' },
  { value: 'clientes', label: 'Clientes' },
  { value: 'finanzas', label: 'Finanzas' },
  { value: 'costos', label: 'Costos' },
  { value: 'resumen', label: 'Resumen Ejecutivo' },
] as const

type TipoReporte = (typeof TIPOS_REPORTE)[number]['value']

const TIPOS_CON_FECHA: TipoReporte[] = ['ventas', 'finanzas']

export function ReportesPage() {
  const [tipo, setTipo] = useState<TipoReporte>('ventas')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const r = await ClienteService.list()
      if (!r.success) throw new Error(r.error?.message)
      return r.data ?? []
    },
  })
  const nombreCliente = (id: string) => clientes.find((c) => c.id === id)?.nombre ?? '—'

  const { data: bolsillos = [] } = useQuery({
    queryKey: ['bolsillos-financieros'],
    queryFn: async () => {
      const r = await FinanzasService.consultarSaldos()
      if (!r.success) throw new Error(r.error?.message)
      return r.data ?? []
    },
  })
  const nombreBolsillo = (id: string) => bolsillos.find((b) => b.id === id)?.nombre ?? '—'

  const reporteQuery = useQuery({
    queryKey: ['reporte', tipo, desde, hasta],
    queryFn: async () => {
      switch (tipo) {
        case 'ventas':
          return ReporteService.ventas(desde || undefined, hasta || undefined)
        case 'pedidos':
          return ReporteService.pedidos()
        case 'inventario':
          return ReporteService.inventario()
        case 'clientes':
          return ReporteService.clientes()
        case 'finanzas':
          return ReporteService.finanzas(desde || undefined, hasta || undefined)
        case 'costos':
          return ReporteService.costos()
        case 'resumen':
          return ReporteService.resumenEjecutivo()
      }
    },
  })

  const errorMensaje = !reporteQuery.data?.success
    ? reporteQuery.data?.error?.message
    : undefined

  useEffect(() => {
    if (errorMensaje) toast.error(errorMensaje)
  }, [errorMensaje])

  async function exportar(formato: 'Excel' | 'PDF' | 'CSV') {
    const metodo =
      formato === 'Excel'
        ? ReporteService.exportarExcel
        : formato === 'PDF'
          ? ReporteService.exportarPDF
          : ReporteService.exportarCSV
    const resultado = await metodo()
    toast.info(resultado.error?.message ?? `Exportación a ${formato} no disponible.`)
  }

  const columnasVentasPedidos: DataTableColumn<Pedido>[] = [
    { header: 'Número', accessor: (p) => p.numero_pedido },
    { header: 'Cliente', accessor: (p) => nombreCliente(p.cliente_id) },
    { header: 'Estado', accessor: (p) => <StatusBadge estado={p.estado} /> },
    {
      header: 'Fecha',
      accessor: (p) => new Date(p.fecha_pedido).toLocaleDateString('es-CO'),
      sortValue: (p) => p.fecha_pedido,
    },
    {
      header: 'Valor total',
      accessor: (p) => formatCurrency(p.valor_total),
      sortValue: (p) => p.valor_total,
      className: 'text-right',
    },
  ]

  const columnasInventario: DataTableColumn<Inventario>[] = [
    { header: 'Código', accessor: (i) => i.codigo },
    { header: 'Nombre', accessor: (i) => i.nombre },
    { header: 'Stock actual', accessor: (i) => i.stock_actual, className: 'text-right' },
    { header: 'Stock mínimo', accessor: (i) => i.stock_minimo, className: 'text-right' },
    {
      header: 'Costo unitario',
      accessor: (i) => formatCurrency(i.costo_unitario),
      className: 'text-right',
    },
  ]

  const columnasClientes: DataTableColumn<Cliente>[] = [
    { header: 'Nombre', accessor: (c) => c.nombre },
    { header: 'Teléfono', accessor: (c) => c.telefono },
    { header: 'Correo', accessor: (c) => c.correo ?? '—' },
    { header: 'Ciudad', accessor: (c) => c.ciudad ?? '—' },
  ]

  const columnasFinanzas: DataTableColumn<MovimientoFinanciero>[] = [
    {
      header: 'Fecha',
      accessor: (m) => new Date(m.fecha).toLocaleDateString('es-CO'),
      sortValue: (m) => m.fecha,
    },
    { header: 'Tipo', accessor: (m) => m.tipo },
    { header: 'Bolsillo', accessor: (m) => nombreBolsillo(m.bolsillo_id) },
    { header: 'Categoría', accessor: (m) => m.categoria ?? '—' },
    {
      header: 'Valor',
      accessor: (m) => formatCurrency(m.valor),
      sortValue: (m) => m.valor,
      className: 'text-right',
    },
  ]

  const columnasCostos: DataTableColumn<CostoConProducto>[] = [
    { header: 'Producto', accessor: ({ producto }) => producto.nombre },
    {
      header: 'Precio base',
      accessor: ({ producto }) => formatCurrency(producto.precio_base),
      className: 'text-right',
    },
    {
      header: 'Costo total',
      accessor: ({ costo }) => (costo ? formatCurrency(costo.costo_total) : '—'),
      className: 'text-right',
    },
    {
      header: 'Utilidad',
      accessor: ({ producto, costo }) =>
        costo ? formatCurrency(producto.precio_base - costo.costo_total) : '—',
      className: 'text-right',
    },
  ]

  return (
    <>
      <PageHeader
        title="Reportes"
        description="Generación de informes."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportar('Excel')}>
              <FileDown className="size-4" aria-hidden="true" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportar('PDF')}>
              <FileDown className="size-4" aria-hidden="true" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportar('CSV')}>
              <FileDown className="size-4" aria-hidden="true" />
              CSV
            </Button>
          </div>
        }
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoReporte)}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_REPORTE.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {TIPOS_CON_FECHA.includes(tipo) && (
              <>
                <Input
                  type="date"
                  className="w-40"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                />
                <Input
                  type="date"
                  className="w-40"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                />
              </>
            )}
          </div>
        }
      />

      {reporteQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Generando reporte...</p>
      ) : !reporteQuery.data?.success ? (
        <p className="text-sm text-muted-foreground">
          No fue posible generar este reporte todavía.
        </p>
      ) : tipo === 'resumen' ? (
        (() => {
          const resumen = reporteQuery.data.data as
            | {
                ventasMes: number
                utilidadMes: number
                pedidosPendientes: number
                cumplimientoPresupuesto?: { cumplimientoPorcentaje: number }
              }
            | undefined
          if (!resumen) return null
          return (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KpiCard
                icon={FileBarChart}
                title="Ventas del mes"
                value={formatCurrency(resumen.ventasMes)}
              />
              <KpiCard
                icon={FileBarChart}
                title="Utilidad del mes"
                value={formatCurrency(resumen.utilidadMes)}
              />
              <KpiCard
                icon={FileBarChart}
                title="Pedidos pendientes"
                value={String(resumen.pedidosPendientes)}
              />
              <KpiCard
                icon={FileBarChart}
                title="Cumplimiento de meta"
                value={
                  resumen.cumplimientoPresupuesto
                    ? `${resumen.cumplimientoPresupuesto.cumplimientoPorcentaje.toFixed(1)}%`
                    : 'Sin meta activa'
                }
              />
            </div>
          )
        })()
      ) : tipo === 'ventas' || tipo === 'pedidos' ? (
        <DataTable
          columns={columnasVentasPedidos}
          data={reporteQuery.data.data as Pedido[]}
          keyExtractor={(p) => p.id}
          emptyIcon={FileBarChart}
          emptyTitle="Sin resultados"
          emptyDescription="No hay pedidos para este reporte."
        />
      ) : tipo === 'inventario' ? (
        <DataTable
          columns={columnasInventario}
          data={reporteQuery.data.data as Inventario[]}
          keyExtractor={(i) => i.id}
          emptyIcon={FileBarChart}
          emptyTitle="Sin resultados"
          emptyDescription="No hay insumos registrados."
        />
      ) : tipo === 'clientes' ? (
        <DataTable
          columns={columnasClientes}
          data={reporteQuery.data.data as Cliente[]}
          keyExtractor={(c) => c.id}
          emptyIcon={FileBarChart}
          emptyTitle="Sin resultados"
          emptyDescription="No hay clientes registrados."
        />
      ) : tipo === 'finanzas' ? (
        <DataTable
          columns={columnasFinanzas}
          data={reporteQuery.data.data as MovimientoFinanciero[]}
          keyExtractor={(m) => m.id}
          emptyIcon={FileBarChart}
          emptyTitle="Sin resultados"
          emptyDescription="No hay movimientos financieros para este reporte."
        />
      ) : (
        <DataTable
          columns={columnasCostos}
          data={reporteQuery.data.data as CostoConProducto[]}
          keyExtractor={({ producto }) => producto.id}
          emptyIcon={FileBarChart}
          emptyTitle="Sin resultados"
          emptyDescription="No hay productos registrados."
        />
      )}
    </>
  )
}
