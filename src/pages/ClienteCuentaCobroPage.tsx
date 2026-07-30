import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, FileDown, Plus, Trash2, Receipt } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ClienteService } from '@/services/ClienteService'
import { PedidoService } from '@/services/PedidoService'
import { ProductoService } from '@/services/ProductoService'
import { ConfiguracionService } from '@/services/ConfiguracionService'
import { formatCurrency } from '@/utils/formatCurrency'
import { exportarCSV, exportarExcel, type ColumnaExport } from '@/utils/exportar'
import { generarCuentaCobroPDF } from '@/utils/facturaPdf'
import type { Pedido } from '@/types/database'

interface LineaCuentaCobroForm {
  producto_id: string
  cantidad: number
  precio_unitario: number
}

// Los pedidos que no generan cobro real: uno cancelado no se factura, y una
// venta con pérdida es un castigo que el negocio absorbe, no algo que se le
// cobra al cliente. Mismo criterio que ReporteService.ventas().
const ESTADOS_SIN_COBRO: Pedido['estado'][] = ['Cancelado', 'Venta con pérdida']

export function ClienteCuentaCobroPage() {
  const { id } = useParams<{ id: string }>()
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [exportando, setExportando] = useState<'Excel' | 'PDF' | 'CSV' | null>(null)

  const clienteQuery = useQuery({
    queryKey: ['cliente', id],
    queryFn: async () => {
      const resultado = await ClienteService.findById(id!)
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data
    },
    enabled: !!id,
  })

  const pedidosQuery = useQuery({
    queryKey: ['cliente-pedidos', id],
    queryFn: async () => {
      const resultado = await ClienteService.obtenerHistorialPedidos(id!)
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
    enabled: !!id,
  })

  const { data: productos = [] } = useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const resultado = await ProductoService.list()
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
  })
  const nombreProducto = (productoId: string) =>
    productos.find((p) => p.id === productoId)?.nombre ?? '—'

  const { data: configuracion } = useQuery({
    queryKey: ['configuracion'],
    queryFn: async () => {
      const resultado = await ConfiguracionService.obtenerConfiguracion()
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data
    },
  })

  const pedidosEnRango = useMemo(() => {
    const todos = pedidosQuery.data ?? []
    return todos.filter((pedido) => {
      if (ESTADOS_SIN_COBRO.includes(pedido.estado)) return false
      if (desde && pedido.fecha_pedido < desde) return false
      if (hasta && pedido.fecha_pedido > `${hasta}T23:59:59`) return false
      return true
    })
  }, [pedidosQuery.data, desde, hasta])

  const detalleQuery = useQuery({
    queryKey: ['cliente-cuenta-cobro-detalle', pedidosEnRango.map((p) => p.id)],
    queryFn: async () => {
      const resultados = await Promise.all(
        pedidosEnRango.map((pedido) => PedidoService.obtenerDetalle(pedido.id)),
      )
      const detalle = resultados.flatMap((r) => (r.success ? (r.data ?? []) : []))
      return detalle
    },
    enabled: pedidosEnRango.length > 0,
  })

  // Agrega por producto todas las líneas de todos los pedidos del rango:
  // esto es lo que arma el punto de partida editable de la cuenta de cobro.
  const lineasAgregadas = useMemo(() => {
    const porProducto = new Map<string, { cantidad: number; subtotal: number }>()
    for (const linea of detalleQuery.data ?? []) {
      const actual = porProducto.get(linea.producto_id) ?? { cantidad: 0, subtotal: 0 }
      actual.cantidad += linea.cantidad
      actual.subtotal += linea.subtotal
      porProducto.set(linea.producto_id, actual)
    }
    return Array.from(porProducto.entries()).map(([producto_id, { cantidad, subtotal }]) => ({
      producto_id,
      cantidad,
      precio_unitario: cantidad > 0 ? Math.round((subtotal / cantidad) * 100) / 100 : 0,
    }))
  }, [detalleQuery.data])

  const { control, register, setValue } = useForm<{ lineas: LineaCuentaCobroForm[] }>({
    defaultValues: { lineas: [] },
  })

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'lineas' })
  const lineas = useWatch({ control, name: 'lineas' })

  // Repuebla el formulario editable cuando cambian los pedidos agregados
  // (rango de fechas distinto), sin pisar ediciones manuales a mitad de una
  // misma consulta.
  useEffect(() => {
    replace(lineasAgregadas)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detalleQuery.dataUpdatedAt])

  const totalLineas = (lineas ?? []).reduce(
    (total, linea) => total + (Number(linea?.cantidad) || 0) * (Number(linea?.precio_unitario) || 0),
    0,
  )

  const totalFacturado = pedidosEnRango.reduce((total, p) => total + p.valor_total, 0)
  const totalPagado = pedidosEnRango.reduce((total, p) => total + p.anticipo, 0)
  const saldoPendiente = pedidosEnRango.reduce((total, p) => total + p.saldo_pendiente, 0)

  interface LineaCuentaCobro {
    producto: string
    cantidad: number
    precio_unitario: number
    subtotal: number
  }

  async function generar(formato: 'Excel' | 'PDF' | 'CSV') {
    const filas: LineaCuentaCobro[] = (lineas ?? [])
      .filter((linea) => linea?.producto_id)
      .map((linea) => ({
        producto: nombreProducto(linea!.producto_id),
        cantidad: Number(linea!.cantidad) || 0,
        precio_unitario: Number(linea!.precio_unitario) || 0,
        subtotal: (Number(linea!.cantidad) || 0) * (Number(linea!.precio_unitario) || 0),
      }))

    if (filas.length === 0) {
      toast.error('Agrega al menos un producto antes de generar la cuenta de cobro.')
      return
    }

    const columnas: ColumnaExport<LineaCuentaCobro>[] = [
      { header: 'Producto', value: (f) => f.producto },
      { header: 'Cantidad', value: (f) => f.cantidad },
      { header: 'Precio unitario', value: (f) => f.precio_unitario },
      { header: 'Subtotal', value: (f) => f.subtotal },
    ]

    const nombreBase = `cuenta_cobro_${(cliente?.nombre ?? 'cliente').replace(/\s+/g, '_').toLowerCase()}`

    setExportando(formato)
    try {
      if (formato === 'CSV') exportarCSV(columnas, filas, nombreBase)
      else if (formato === 'Excel') await exportarExcel(columnas, filas, nombreBase, 'Cuenta de cobro')
      else {
        await generarCuentaCobroPDF({
          nombreArchivoBase: nombreBase,
          cliente: {
            nombre: cliente?.nombre ?? '',
            correo: cliente?.correo ?? null,
            telefono: cliente?.telefono ?? '',
            direccion: cliente?.direccion ?? null,
            ciudad: cliente?.ciudad ?? null,
          },
          empresa: {
            nombre: configuracion?.nombre_empresa || 'Pictográficos',
            correo: configuracion?.correo_contacto ?? null,
            telefono: configuracion?.telefono_contacto ?? null,
          },
          periodo: { desde, hasta },
          lineas: filas.map((f) => ({
            producto: f.producto,
            cantidad: f.cantidad,
            precioUnitario: f.precio_unitario,
          })),
          resumen: {
            cantidadPedidos: pedidosEnRango.length,
            totalPagado,
            saldoPendiente,
          },
        })
      }
      toast.success(`Cuenta de cobro exportada a ${formato}.`)
    } catch {
      toast.error(`No fue posible generar el archivo ${formato}.`)
    } finally {
      setExportando(null)
    }
  }

  const cliente = clienteQuery.data

  if (clienteQuery.isLoading || !cliente) {
    return <p className="text-sm text-muted-foreground">Cargando cliente...</p>
  }

  return (
    <>
      <PageHeader
        title={`Cuenta de cobro — ${cliente.nombre}`}
        description="Acumula los pedidos del cliente en un rango de fechas para generar un documento de cobro."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/clientes">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Volver
              </Link>
            </Button>
          </div>
        }
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <Input type="date" className="w-40" value={desde} onChange={(e) => setDesde(e.target.value)} />
            <Input type="date" className="w-40" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Pedidos incluidos</p>
          <p className="text-lg font-semibold">{pedidosEnRango.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total facturado</p>
          <p className="text-lg font-semibold">{formatCurrency(totalFacturado)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total pagado</p>
          <p className="text-lg font-semibold">{formatCurrency(totalPagado)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Saldo pendiente</p>
          <p className={cn('text-lg font-semibold', saldoPendiente > 0 && 'text-amber-600 dark:text-amber-400')}>
            {formatCurrency(saldoPendiente)}
          </p>
        </Card>
      </div>

      <Card className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <Label>Productos de la cuenta de cobro</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ producto_id: '', cantidad: 1, precio_unitario: 0 })}
          >
            <Plus className="size-4" aria-hidden="true" />
            Agregar producto
          </Button>
        </div>

        {detalleQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando pedidos del rango...</p>
        ) : fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay productos todavía. Ajusta el rango de fechas o agrega uno manualmente.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="hidden gap-2 px-1 text-xs text-muted-foreground sm:grid sm:grid-cols-[1fr_100px_140px_120px_2.25rem]">
              <span>Producto</span>
              <span>Cantidad</span>
              <span>Precio unitario</span>
              <span>Subtotal</span>
              <span aria-hidden="true" />
            </div>
            {fields.map((field, index) => {
              const linea = lineas?.[index]
              const subtotal = (Number(linea?.cantidad) || 0) * (Number(linea?.precio_unitario) || 0)
              return (
                <div
                  key={field.id}
                  className="grid grid-cols-1 items-end gap-2 rounded-md border border-border/60 bg-muted/20 p-2 sm:grid-cols-[1fr_100px_140px_120px_2.25rem] sm:border-0 sm:bg-transparent sm:p-0"
                >
                  <Select
                    value={linea?.producto_id ?? ''}
                    onValueChange={(value) =>
                      setValue(`lineas.${index}.producto_id`, value, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos.map((producto) => (
                        <SelectItem key={producto.id} value={producto.id}>
                          {producto.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="number" step="1" {...register(`lineas.${index}.cantidad`)} />
                  <Input type="number" step="0.01" {...register(`lineas.${index}.precio_unitario`)} />
                  <p className="flex h-9 items-center text-sm">{formatCurrency(subtotal)}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Quitar producto"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex justify-end border-t border-border pt-3">
          <p className="text-sm font-medium">Total: {formatCurrency(totalLineas)}</p>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm" disabled={exportando !== null} onClick={() => void generar('Excel')}>
            <FileDown className="size-4" aria-hidden="true" />
            {exportando === 'Excel' ? 'Generando...' : 'Excel'}
          </Button>
          <Button variant="outline" size="sm" disabled={exportando !== null} onClick={() => void generar('PDF')}>
            <FileDown className="size-4" aria-hidden="true" />
            {exportando === 'PDF' ? 'Generando...' : 'PDF'}
          </Button>
          <Button variant="outline" size="sm" disabled={exportando !== null} onClick={() => void generar('CSV')}>
            <FileDown className="size-4" aria-hidden="true" />
            {exportando === 'CSV' ? 'Generando...' : 'CSV'}
          </Button>
          <Button size="sm" disabled={exportando !== null} onClick={() => void generar('PDF')}>
            <Receipt className="size-4" aria-hidden="true" />
            Generar cuenta de cobro
          </Button>
        </div>
      </Card>
    </>
  )
}
