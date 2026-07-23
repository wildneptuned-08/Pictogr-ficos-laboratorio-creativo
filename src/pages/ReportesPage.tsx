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
import { ProveedorService } from '@/services/ProveedorService'
import { formatCurrency } from '@/utils/formatCurrency'
import {
  completarColumnas,
  exportarCSV,
  exportarExcel,
  exportarPDF,
  type ColumnaExport,
} from '@/utils/exportar'
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

interface ResumenEjecutivo {
  ventasMes: number
  utilidadMes: number
  pedidosPendientes: number
  cumplimientoPresupuesto?: {
    meta: number
    ventasActuales: number
    valorPendiente: number
    cumplimientoPorcentaje: number
    promedioDiarioRequerido: number
    proyeccionCierre: number
  }
}

type ValorResumen = string | number

// El resumen ejecutivo no es una tabla de registros sino un conjunto de
// indicadores, así que se exporta como pares indicador/valor.
function filasResumen(
  resumen: ResumenEjecutivo | undefined,
): { indicador: string; valor: ValorResumen }[] {
  if (!resumen) return []

  const filas = [
    { indicador: 'Ventas del mes', valor: resumen.ventasMes },
    { indicador: 'Utilidad del mes', valor: resumen.utilidadMes },
    { indicador: 'Pedidos pendientes', valor: resumen.pedidosPendientes },
  ]

  const meta = resumen.cumplimientoPresupuesto
  if (!meta) {
    return [...filas, { indicador: 'Presupuesto del mes', valor: 'Sin meta activa' }]
  }

  return [
    ...filas,
    { indicador: 'Meta del mes', valor: meta.meta },
    { indicador: 'Ventas acumuladas', valor: meta.ventasActuales },
    { indicador: 'Falta para la meta', valor: meta.valorPendiente },
    { indicador: 'Cumplimiento (%)', valor: meta.cumplimientoPorcentaje },
    { indicador: 'Promedio diario requerido', valor: meta.promedioDiarioRequerido },
    { indicador: 'Proyección de cierre', valor: meta.proyeccionCierre },
  ]
}

export function ReportesPage() {
  const [tipo, setTipo] = useState<TipoReporte>('ventas')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [exportando, setExportando] = useState<'Excel' | 'PDF' | 'CSV' | null>(null)

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

  const { data: proveedores = [] } = useQuery({
    queryKey: ['proveedores'],
    queryFn: async () => {
      const r = await ProveedorService.list()
      if (!r.success) throw new Error(r.error?.message)
      return r.data ?? []
    },
  })
  const nombreProveedor = (id: string | null) =>
    proveedores.find((p) => p.id === id)?.nombre ?? ''

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

  // Columnas de exportación: incluyen TODOS los campos del dato original, a
  // diferencia de las columnas de pantalla, que son un resumen legible. Las
  // fechas van en ISO y los importes como número (sin símbolo) para que en
  // Excel se puedan ordenar y sumar.
  const soloFecha = (valor: string | null) => (valor ? valor.slice(0, 10) : null)

  // Los productos de multiplicar arrastran ruido binario (11 x 1496.08 da
  // 16456.879999999997), que en Excel se ve bien pero en CSV y PDF no.
  const aDosDecimales = (valor: number) => Math.round(valor * 100) / 100

  const exportPedidos: ColumnaExport<Pedido>[] = [
    { header: 'Número', value: (p) => p.numero_pedido },
    { header: 'Cliente', value: (p) => nombreCliente(p.cliente_id) },
    { header: 'Estado', value: (p) => p.estado },
    { header: 'Prioridad', value: (p) => p.prioridad },
    { header: 'Canal de ingreso', value: (p) => p.canal_ingreso },
    { header: 'Fecha del pedido', value: (p) => soloFecha(p.fecha_pedido) },
    { header: 'Fecha de entrega', value: (p) => soloFecha(p.fecha_entrega) },
    { header: 'Subtotal', value: (p) => p.subtotal },
    { header: 'Descuento', value: (p) => p.descuento },
    { header: 'Valor total', value: (p) => p.valor_total },
    { header: 'Anticipo', value: (p) => p.anticipo },
    { header: 'Saldo pendiente', value: (p) => p.saldo_pendiente },
    { header: 'Método de pago', value: (p) => p.metodo_pago },
    { header: 'Observaciones', value: (p) => p.observaciones },
    { header: 'Creado', value: (p) => p.created_at },
    { header: 'Actualizado', value: (p) => p.updated_at },
    { header: 'ID', value: (p) => p.id },
    { header: 'ID del cliente', value: (p) => p.cliente_id },
  ]
  const clavesPedidos = [
    'numero_pedido', 'cliente_id', 'estado', 'prioridad', 'canal_ingreso',
    'fecha_pedido', 'fecha_entrega', 'subtotal', 'descuento', 'valor_total',
    'anticipo', 'saldo_pendiente', 'metodo_pago', 'observaciones',
    'created_at', 'updated_at', 'id',
  ]

  const exportInventario: ColumnaExport<Inventario>[] = [
    { header: 'Categoría', value: (i) => i.categoria },
    { header: 'Producto', value: (i) => i.nombre },
    { header: 'Código', value: (i) => i.codigo },
    { header: 'Proveedor', value: (i) => nombreProveedor(i.proveedor_id) || i.proveedor },
    { header: 'Cantidad', value: (i) => i.stock_actual },
    { header: 'Costo unitario', value: (i) => i.costo_unitario },
    { header: 'Costo total', value: (i) => aDosDecimales(i.stock_actual * i.costo_unitario) },
    { header: 'Stock mínimo', value: (i) => i.stock_minimo },
    { header: 'Bajo mínimo', value: (i) => i.stock_actual < i.stock_minimo },
    { header: 'Unidad de medida', value: (i) => i.unidad_medida },
    { header: 'Observaciones', value: (i) => i.observaciones },
    { header: 'Activo', value: (i) => i.activo },
    { header: 'Creado', value: (i) => i.created_at },
    { header: 'Actualizado', value: (i) => i.updated_at },
    { header: 'ID', value: (i) => i.id },
    { header: 'ID del proveedor', value: (i) => i.proveedor_id },
  ]
  const clavesInventario = [
    'categoria', 'nombre', 'codigo', 'proveedor', 'proveedor_id', 'stock_actual',
    'costo_unitario', 'stock_minimo', 'unidad_medida', 'observaciones', 'activo',
    'created_at', 'updated_at', 'id',
  ]

  const exportClientes: ColumnaExport<Cliente>[] = [
    { header: 'Nombre', value: (c) => c.nombre },
    { header: 'Teléfono', value: (c) => c.telefono },
    { header: 'Correo', value: (c) => c.correo },
    { header: 'Dirección', value: (c) => c.direccion },
    { header: 'Ciudad', value: (c) => c.ciudad },
    { header: 'Observaciones', value: (c) => c.observaciones },
    { header: 'Activo', value: (c) => c.activo },
    { header: 'Creado', value: (c) => c.created_at },
    { header: 'Actualizado', value: (c) => c.updated_at },
    { header: 'ID', value: (c) => c.id },
  ]
  const clavesClientes = [
    'nombre', 'telefono', 'correo', 'direccion', 'ciudad', 'observaciones',
    'activo', 'created_at', 'updated_at', 'id',
  ]

  const exportFinanzas: ColumnaExport<MovimientoFinanciero>[] = [
    { header: 'Fecha', value: (m) => m.fecha },
    { header: 'Tipo', value: (m) => m.tipo },
    { header: 'Bolsillo', value: (m) => nombreBolsillo(m.bolsillo_id) },
    { header: 'Categoría', value: (m) => m.categoria },
    { header: 'Valor', value: (m) => m.valor },
    { header: 'Descripción', value: (m) => m.descripcion },
    { header: 'Creado', value: (m) => m.created_at },
    { header: 'Actualizado', value: (m) => m.updated_at },
    { header: 'ID', value: (m) => m.id },
    { header: 'ID del bolsillo', value: (m) => m.bolsillo_id },
    { header: 'ID del pedido', value: (m) => m.pedido_id },
  ]
  const clavesFinanzas = [
    'fecha', 'tipo', 'bolsillo_id', 'categoria', 'valor', 'descripcion',
    'created_at', 'updated_at', 'id', 'pedido_id',
  ]

  // CostoConProducto anida {producto, costo}, así que aquí se enumeran a mano
  // todos los campos de ambos y no se usa completarColumnas(), que serializaría
  // los objetos anidados como JSON.
  const exportCostos: ColumnaExport<CostoConProducto>[] = [
    { header: 'Producto', value: ({ producto }) => producto.nombre },
    { header: 'Código', value: ({ producto }) => producto.codigo },
    { header: 'Descripción', value: ({ producto }) => producto.descripcion },
    { header: 'Proveedor', value: ({ producto }) => nombreProveedor(producto.proveedor_id) },
    { header: 'Precio base', value: ({ producto }) => producto.precio_base },
    { header: 'Costo material', value: ({ costo }) => costo?.costo_material ?? null },
    { header: 'Costo impresión', value: ({ costo }) => costo?.costo_impresion ?? null },
    { header: 'Costo empaque', value: ({ costo }) => costo?.costo_empaque ?? null },
    { header: 'Otros costos', value: ({ costo }) => costo?.otros_costos ?? null },
    { header: 'Costo total', value: ({ costo }) => costo?.costo_total ?? null },
    {
      header: 'Utilidad',
      value: ({ producto, costo }) =>
        costo ? aDosDecimales(producto.precio_base - costo.costo_total) : null,
    },
    {
      header: 'Margen %',
      value: ({ producto, costo }) =>
        costo && producto.precio_base > 0
          ? aDosDecimales(
              ((producto.precio_base - costo.costo_total) / producto.precio_base) * 100,
            )
          : null,
    },
    { header: 'Activo', value: ({ producto }) => producto.activo },
    { header: 'Producto creado', value: ({ producto }) => producto.created_at },
    { header: 'Producto actualizado', value: ({ producto }) => producto.updated_at },
    { header: 'Costo creado', value: ({ costo }) => costo?.created_at ?? null },
    { header: 'Costo actualizado', value: ({ costo }) => costo?.updated_at ?? null },
    { header: 'ID del producto', value: ({ producto }) => producto.id },
    { header: 'ID de la categoría', value: ({ producto }) => producto.categoria_id },
    { header: 'ID del proveedor', value: ({ producto }) => producto.proveedor_id },
    { header: 'ID del costo', value: ({ costo }) => costo?.id ?? null },
  ]

  const exportResumen: ColumnaExport<{ indicador: string; valor: ValorResumen }>[] = [
    { header: 'Indicador', value: (f) => f.indicador },
    { header: 'Valor', value: (f) => f.valor },
  ]

  async function exportar(formato: 'Excel' | 'PDF' | 'CSV') {
    if (!reporteQuery.data?.success) {
      toast.error('Genera el reporte antes de exportarlo.')
      return
    }

    const etiqueta = TIPOS_REPORTE.find((t) => t.value === tipo)?.label ?? 'Reporte'
    const nombreBase = `reporte_${tipo}`

    // Cada rama fija el tipo de fila junto con sus columnas; por eso se
    // resuelve aquí y no con un genérico.
    const ejecutar = async <T extends object>(columnas: ColumnaExport<T>[], filas: T[]) => {
      if (filas.length === 0) {
        toast.error('No hay datos para exportar en este reporte.')
        return
      }
      if (formato === 'CSV') exportarCSV(columnas, filas, nombreBase)
      else if (formato === 'Excel') await exportarExcel(columnas, filas, nombreBase, etiqueta)
      else await exportarPDF(columnas, filas, nombreBase, `Reporte de ${etiqueta}`)
      toast.success(`Reporte de ${etiqueta} exportado a ${formato}.`)
    }

    setExportando(formato)
    try {
      const datos = reporteQuery.data.data
      switch (tipo) {
        case 'ventas':
        case 'pedidos': {
          const filas = (datos ?? []) as Pedido[]
          await ejecutar(completarColumnas(exportPedidos, filas, clavesPedidos), filas)
          break
        }
        case 'inventario': {
          const filas = (datos ?? []) as Inventario[]
          await ejecutar(completarColumnas(exportInventario, filas, clavesInventario), filas)
          break
        }
        case 'clientes': {
          const filas = (datos ?? []) as Cliente[]
          await ejecutar(completarColumnas(exportClientes, filas, clavesClientes), filas)
          break
        }
        case 'finanzas': {
          const filas = (datos ?? []) as MovimientoFinanciero[]
          await ejecutar(completarColumnas(exportFinanzas, filas, clavesFinanzas), filas)
          break
        }
        case 'costos': {
          const filas = (datos ?? []) as CostoConProducto[]
          await ejecutar(exportCostos, filas)
          break
        }
        case 'resumen': {
          await ejecutar(exportResumen, filasResumen(datos as ResumenEjecutivo | undefined))
          break
        }
      }
    } catch {
      toast.error(`No fue posible generar el archivo ${formato}.`)
    } finally {
      setExportando(null)
    }
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
            <Button
              variant="outline"
              size="sm"
              disabled={exportando !== null}
              onClick={() => void exportar('Excel')}
            >
              <FileDown className="size-4" aria-hidden="true" />
              {exportando === 'Excel' ? 'Generando...' : 'Excel'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={exportando !== null}
              onClick={() => void exportar('PDF')}
            >
              <FileDown className="size-4" aria-hidden="true" />
              {exportando === 'PDF' ? 'Generando...' : 'PDF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={exportando !== null}
              onClick={() => void exportar('CSV')}
            >
              <FileDown className="size-4" aria-hidden="true" />
              {exportando === 'CSV' ? 'Generando...' : 'CSV'}
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
          const resumen = reporteQuery.data.data as ResumenEjecutivo | undefined
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
