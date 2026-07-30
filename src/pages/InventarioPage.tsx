import { useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Package, Plus, Pencil, Trash2, Upload, AlertTriangle, ArrowUpDown } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/data/DataTable'
import { KpiCard } from '@/components/data/KpiCard'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  InventarioService,
  claveIdentidadInsumo,
  stockTotalPorInsumo,
} from '@/services/InventarioService'
import { ProveedorService } from '@/services/ProveedorService'
import { formatCurrency } from '@/utils/formatCurrency'
import { leerInventarioExcel, type FilaInventarioExcel } from '@/utils/importarInventarioExcel'
import type { Inventario, Proveedor } from '@/types/database'

// Radix Select no admite un item con value="", necesita un centinela.
const SIN_PROVEEDOR = '__sin_proveedor__'
const TODAS_LAS_CATEGORIAS = '__todas__'

const insumoSchema = z.object({
  categoria: z.string().optional(),
  nombre: z.string().min(1, 'El producto es obligatorio.'),
  proveedor_id: z.string().optional(),
  stock_actual: z.coerce.number().nonnegative('No puede ser negativo.'),
  costo_unitario: z.coerce.number().nonnegative('No puede ser negativo.'),
  stock_minimo: z.coerce.number().nonnegative('No puede ser negativo.'),
  observaciones: z.string().optional(),
  fecha_ingreso: z.string().optional(),
})

type InsumoFormInput = z.input<typeof insumoSchema>
type InsumoFormValues = z.output<typeof insumoSchema>

// "Por debajo del mínimo" es estricto: un insumo que está justo en su mínimo
// todavía alcanza. Con <= el 62% del inventario real quedaba en alerta.
// Compara la SUMA de todas las filas/lotes del insumo (misma identidad, ver
// claveIdentidadInsumo) contra el mínimo, no el stock de una sola fila: un
// insumo repartido en dos lotes pequeños no debe salir "crítico" si la suma
// alcanza.
function bajoMinimo(insumo: Inventario, totales: Map<string, number>): boolean {
  const total = totales.get(claveIdentidadInsumo(insumo)) ?? insumo.stock_actual
  return total < insumo.stock_minimo
}

function InsumoFormDialog({
  open,
  onOpenChange,
  insumo,
  proveedores,
  categorias,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  insumo: Inventario | null
  proveedores: Proveedor[]
  categorias: string[]
}) {
  const queryClient = useQueryClient()
  const esEdicion = !!insumo

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InsumoFormInput, unknown, InsumoFormValues>({
    resolver: zodResolver(insumoSchema),
    values: insumo
      ? {
          categoria: insumo.categoria ?? '',
          nombre: insumo.nombre,
          proveedor_id: insumo.proveedor_id ?? SIN_PROVEEDOR,
          stock_actual: insumo.stock_actual,
          costo_unitario: insumo.costo_unitario,
          stock_minimo: insumo.stock_minimo,
          observaciones: insumo.observaciones ?? '',
          fecha_ingreso: insumo.fecha_ingreso ?? '',
        }
      : {
          categoria: '',
          nombre: '',
          proveedor_id: SIN_PROVEEDOR,
          stock_actual: 0,
          costo_unitario: 0,
          stock_minimo: 0,
          observaciones: '',
          fecha_ingreso: '',
        },
  })

  const proveedorId = useWatch({ control, name: 'proveedor_id' })
  const cantidadActual = useWatch({ control, name: 'stock_actual' })
  const costoActual = useWatch({ control, name: 'costo_unitario' })
  const cantidad = Number(cantidadActual) || 0
  const costoUnitario = Number(costoActual) || 0

  async function onSubmit(values: InsumoFormValues) {
    const proveedor =
      !values.proveedor_id || values.proveedor_id === SIN_PROVEEDOR ? null : values.proveedor_id

    // Al editar no se toca stock_actual: se corrige desde "Ajustar stock"
    // para que el movimiento quede en el historial.
    const resultado = esEdicion
      ? await InventarioService.actualizar(insumo!.id, {
          categoria: values.categoria,
          nombre: values.nombre,
          proveedor_id: proveedor,
          costo_unitario: values.costo_unitario,
          stock_minimo: values.stock_minimo,
          observaciones: values.observaciones,
          fecha_ingreso: values.fecha_ingreso || null,
        })
      : await InventarioService.crear({
          ...values,
          proveedor_id: proveedor,
          fecha_ingreso: values.fecha_ingreso || null,
        })

    if (!resultado.success) {
      toast.error(resultado.error?.message ?? 'No fue posible guardar el insumo.')
      return
    }

    toast.success(esEdicion ? 'Insumo actualizado.' : 'Insumo creado.')
    queryClient.invalidateQueries({ queryKey: ['inventario'] })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {esEdicion ? 'Editar insumo' : 'Nuevo insumo'}
            {insumo?.codigo && (
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                {insumo.codigo}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="categoria">Categoría</Label>
            <Input id="categoria" list="categorias-inventario" {...register('categoria')} />
            <datalist id="categorias-inventario">
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria} />
              ))}
            </datalist>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nombre">Producto</Label>
            <Input id="nombre" aria-invalid={!!errors.nombre} {...register('nombre')} />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Proveedor</Label>
            <Select
              value={proveedorId || SIN_PROVEEDOR}
              onValueChange={(v) => setValue('proveedor_id', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SIN_PROVEEDOR}>Sin proveedor</SelectItem>
                {proveedores.map((proveedor) => (
                  <SelectItem key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre} ({proveedor.prefijo_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stock_actual">Cantidad</Label>
              <Input
                id="stock_actual"
                type="number"
                step="0.01"
                disabled={esEdicion}
                aria-invalid={!!errors.stock_actual}
                {...register('stock_actual')}
              />
              {esEdicion && (
                <p className="text-xs text-muted-foreground">
                  Se corrige desde &quot;Ajustar stock&quot; para dejar rastro en el historial.
                </p>
              )}
              {errors.stock_actual && (
                <p className="text-sm text-destructive">{errors.stock_actual.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="costo_unitario">Costo unitario</Label>
              <Input
                id="costo_unitario"
                type="number"
                step="0.01"
                aria-invalid={!!errors.costo_unitario}
                {...register('costo_unitario')}
              />
              {errors.costo_unitario && (
                <p className="text-sm text-destructive">{errors.costo_unitario.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Costo total</Label>
              <p className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm">
                {formatCurrency(cantidad * costoUnitario)}
              </p>
              <p className="text-xs text-muted-foreground">Cantidad x costo unitario.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stock_minimo">Stock mínimo</Label>
              <Input
                id="stock_minimo"
                type="number"
                step="0.01"
                aria-invalid={!!errors.stock_minimo}
                {...register('stock_minimo')}
              />
              <p className="text-xs text-muted-foreground">
                Debajo de este valor se genera la alerta.
              </p>
              {errors.stock_minimo && (
                <p className="text-sm text-destructive">{errors.stock_minimo.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fecha_ingreso">Fecha de ingreso</Label>
            <Input id="fecha_ingreso" type="date" {...register('fecha_ingreso')} />
            <p className="text-xs text-muted-foreground">
              Fecha de la factura de compra al proveedor (no la de este registro). Ordena el
              consumo FIFO al pasar un pedido a Producción.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea id="observaciones" rows={2} {...register('observaciones')} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AjustarStockDialog({
  insumo,
  onOpenChange,
}: {
  insumo: Inventario | null
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [tipo, setTipo] = useState<'Entrada' | 'Salida' | 'Ajuste'>('Entrada')
  const [cantidad, setCantidad] = useState('')
  const [motivo, setMotivo] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      if (!insumo) return null
      const valor = Number(cantidad)
      if (tipo === 'Entrada') {
        return InventarioService.registrarEntrada({
          inventario_id: insumo.id,
          cantidad: valor,
          motivo: motivo || undefined,
        })
      }
      if (tipo === 'Salida') {
        return InventarioService.registrarSalida({
          inventario_id: insumo.id,
          cantidad: valor,
          motivo: motivo || undefined,
        })
      }
      return InventarioService.actualizarStock(insumo.id, valor, motivo || undefined)
    },
    onSuccess: (resultado) => {
      if (!resultado) return
      if (!resultado.success) {
        toast.error(resultado.error?.message ?? 'No fue posible ajustar el stock.')
        return
      }
      toast.success('Stock actualizado.')
      queryClient.invalidateQueries({ queryKey: ['inventario'] })
      setCantidad('')
      setMotivo('')
      onOpenChange(false)
    },
  })

  const valor = Number(cantidad)
  const stockActual = insumo?.stock_actual ?? 0
  const stockResultante =
    tipo === 'Entrada' ? stockActual + valor : tipo === 'Salida' ? stockActual - valor : valor

  return (
    <Dialog open={!!insumo} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar stock — {insumo?.nombre}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Tipo de movimiento</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as 'Entrada' | 'Salida' | 'Ajuste')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Entrada">Entrada (suma al stock)</SelectItem>
                <SelectItem value="Salida">Salida (resta del stock)</SelectItem>
                <SelectItem value="Ajuste">Ajuste (fija el stock exacto)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cantidad-ajuste">
              {tipo === 'Ajuste' ? 'Stock real contado' : 'Cantidad'}
            </Label>
            <Input
              id="cantidad-ajuste"
              type="number"
              step="0.01"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="motivo-ajuste">Motivo (opcional)</Label>
            <Input
              id="motivo-ajuste"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: compra a proveedor, conteo físico"
            />
          </div>

          {cantidad !== '' && Number.isFinite(valor) && (
            <p
              className={cn(
                'rounded-md px-2 py-1.5 text-xs',
                stockResultante < 0
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {stockResultante < 0
                ? `Esta salida dejaría el stock en ${stockResultante}. No hay existencias suficientes.`
                : `Stock actual ${stockActual} → quedará en ${stockResultante}.`}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            disabled={!cantidad || valor <= 0 || stockResultante < 0 || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Aplicando...' : 'Aplicar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ImportarExcelDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [filas, setFilas] = useState<FilaInventarioExcel[]>([])
  const [errores, setErrores] = useState<string[]>([])
  const [nombreArchivo, setNombreArchivo] = useState('')
  const [leyendo, setLeyendo] = useState(false)

  function reiniciar() {
    setFilas([])
    setErrores([])
    setNombreArchivo('')
    if (inputRef.current) inputRef.current.value = ''
  }

  async function alSeleccionarArchivo(archivo: File) {
    setLeyendo(true)
    setNombreArchivo(archivo.name)
    try {
      const resultado = await leerInventarioExcel(archivo)
      setFilas(resultado.filas)
      setErrores(resultado.errores)
    } catch {
      setFilas([])
      setErrores(['No fue posible leer el archivo. Verifica que sea un .xlsx válido.'])
    } finally {
      setLeyendo(false)
    }
  }

  const importarMutation = useMutation({
    mutationFn: () => InventarioService.importar(filas),
    onSuccess: (resultado) => {
      if (!resultado.success || !resultado.data) {
        toast.error(resultado.error?.message ?? 'No fue posible importar el inventario.')
        return
      }
      const { creados, actualizados, proveedoresCreados } = resultado.data
      toast.success(`Importación lista: ${creados} creados, ${actualizados} actualizados.`)
      if (proveedoresCreados.length > 0) {
        toast.info(`Proveedores creados: ${proveedoresCreados.join(', ')}`)
      }
      queryClient.invalidateQueries({ queryKey: ['inventario'] })
      queryClient.invalidateQueries({ queryKey: ['proveedores'] })
      reiniciar()
      onOpenChange(false)
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(abierto) => {
        if (!abierto) reiniciar()
        onOpenChange(abierto)
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar inventario desde Excel</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-dashed p-4 text-sm">
            <p className="mb-2 text-muted-foreground">
              El archivo debe tener una pestaña <strong>Inventario</strong> con las columnas:
              CATEGORIA, PRODUCTO, PROVEEDOR, CANTIDAD, COSTO UNITARIO, COSTO TOTAL, STOCK MÍNIMO,
              OBSERVACIONES y FECHA INGRESO (fecha de la factura de compra al proveedor, formato
              dd/mm/aaaa; puede ir vacía).
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => {
                const archivo = e.target.files?.[0]
                if (archivo) void alSeleccionarArchivo(archivo)
              }}
            />
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              <Upload className="size-4" aria-hidden="true" />
              {nombreArchivo || 'Seleccionar archivo .xlsx'}
            </Button>
          </div>

          {leyendo && <p className="text-sm text-muted-foreground">Leyendo el archivo...</p>}

          {errores.length > 0 && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <p className="mb-1 font-medium">
                {filas.length > 0 ? 'Filas omitidas' : 'No se pudo leer el archivo'}
              </p>
              <ul className="flex flex-col gap-0.5">
                {errores.slice(0, 8).map((error) => (
                  <li key={error}>• {error}</li>
                ))}
                {errores.length > 8 && <li>• y {errores.length - 8} más...</li>}
              </ul>
            </div>
          )}

          {filas.length > 0 && (
            <>
              <p className="text-sm">
                Se importarán <strong>{filas.length}</strong> filas. Los insumos que ya existan
                (misma categoría, producto, observaciones y fecha de ingreso) se actualizarán; una
                fecha distinta crea un lote nuevo. Los proveedores que no existan se crearán
                automáticamente.
              </p>

              <div className="max-h-64 overflow-auto rounded-lg border">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="p-2">Categoría</th>
                      <th className="p-2">Producto</th>
                      <th className="p-2">Proveedor</th>
                      <th className="p-2 text-right">Cant.</th>
                      <th className="p-2 text-right">C. unit.</th>
                      <th className="p-2 text-right">Mín.</th>
                      <th className="p-2">Observaciones</th>
                      <th className="p-2">Fecha ingreso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filas.map((fila) => (
                      <tr key={fila.fila} className="border-t">
                        <td className="p-2">{fila.categoria}</td>
                        <td className="p-2">{fila.nombre}</td>
                        <td className="p-2">{fila.proveedor}</td>
                        <td className="p-2 text-right">{fila.cantidad}</td>
                        <td className="p-2 text-right">{formatCurrency(fila.costo_unitario)}</td>
                        <td className="p-2 text-right">{fila.stock_minimo}</td>
                        <td className="p-2 text-muted-foreground">{fila.observaciones}</td>
                        <td className="p-2 text-muted-foreground">{fila.fecha_ingreso ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            disabled={filas.length === 0 || importarMutation.isPending}
            onClick={() => importarMutation.mutate()}
          >
            {importarMutation.isPending ? 'Importando...' : `Importar ${filas.length} filas`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function InventarioPage() {
  const queryClient = useQueryClient()
  const [formAbierto, setFormAbierto] = useState(false)
  const [importarAbierto, setImportarAbierto] = useState(false)
  const [insumoEditando, setInsumoEditando] = useState<Inventario | null>(null)
  const [insumoAjustando, setInsumoAjustando] = useState<Inventario | null>(null)
  const [insumoAEliminar, setInsumoAEliminar] = useState<Inventario | null>(null)
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>(TODAS_LAS_CATEGORIAS)
  const [soloBajoMinimo, setSoloBajoMinimo] = useState(false)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const { data: insumos = [], isLoading } = useQuery({
    queryKey: ['inventario'],
    queryFn: async () => {
      const resultado = await InventarioService.listarInsumos()
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
  })

  const { data: proveedores = [] } = useQuery({
    queryKey: ['proveedores'],
    queryFn: async () => {
      const resultado = await ProveedorService.list()
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
  })

  const eliminarMutation = useMutation({
    mutationFn: (id: string) => InventarioService.eliminar(id),
    onSuccess: (resultado) => {
      if (!resultado.success) {
        toast.error(resultado.error?.message ?? 'No fue posible eliminar el insumo.')
        return
      }
      toast.success('Insumo eliminado.')
      queryClient.invalidateQueries({ queryKey: ['inventario'] })
    },
  })

  const nombreProveedor = (id: string | null) => proveedores.find((p) => p.id === id)?.nombre ?? '—'

  const categorias = useMemo(
    () =>
      Array.from(new Set(insumos.map((i) => i.categoria).filter((c): c is string => !!c))).sort(),
    [insumos],
  )

  const totalesPorInsumo = useMemo(() => stockTotalPorInsumo(insumos), [insumos])

  // Un insumo con varios lotes cuenta una sola vez en la alerta y el KPI,
  // aunque tenga varias filas — el criterio es la identidad, no la fila.
  const criticos = useMemo(() => {
    const vistos = new Set<string>()
    const resultado: Inventario[] = []
    for (const insumo of insumos) {
      const clave = claveIdentidadInsumo(insumo)
      if (vistos.has(clave)) continue
      const total = totalesPorInsumo.get(clave) ?? insumo.stock_actual
      if (total < insumo.stock_minimo) {
        vistos.add(clave)
        resultado.push({ ...insumo, stock_actual: total })
      }
    }
    return resultado
  }, [insumos, totalesPorInsumo])

  const valorInventario = insumos.reduce((total, i) => total + i.stock_actual * i.costo_unitario, 0)

  const filtrados = useMemo(
    () =>
      insumos.filter((insumo) => {
        if (categoriaFiltro !== TODAS_LAS_CATEGORIAS && insumo.categoria !== categoriaFiltro) {
          return false
        }
        if (soloBajoMinimo && !bajoMinimo(insumo, totalesPorInsumo)) return false
        if (desde || hasta) {
          if (!insumo.fecha_ingreso) return false
          if (desde && insumo.fecha_ingreso < desde) return false
          if (hasta && insumo.fecha_ingreso > hasta) return false
        }
        return true
      }),
    [insumos, categoriaFiltro, soloBajoMinimo, totalesPorInsumo, desde, hasta],
  )

  // Mismo orden de columnas que la pestaña "Inventario" del Excel del negocio.
  const columnas: DataTableColumn<Inventario>[] = [
    {
      header: 'Categoría',
      accessor: (i) => i.categoria ?? '—',
      sortValue: (i) => (i.categoria ?? '').toLowerCase(),
    },
    {
      header: 'Producto',
      accessor: (i) => (
        <div className="flex items-center gap-2">
          {bajoMinimo(i, totalesPorInsumo) && (
            <AlertTriangle
              className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
              aria-label="Stock en o bajo el mínimo"
            />
          )}
          <div className="min-w-0">
            <p className="truncate">{i.nombre}</p>
            <span className="font-mono text-xs text-muted-foreground">{i.codigo}</span>
          </div>
        </div>
      ),
      sortValue: (i) => i.nombre.toLowerCase(),
    },
    {
      header: 'Proveedor',
      accessor: (i) => nombreProveedor(i.proveedor_id),
      sortValue: (i) => nombreProveedor(i.proveedor_id).toLowerCase(),
    },
    {
      header: 'Cantidad',
      className: 'text-right',
      accessor: (i) => (
        <span
          className={cn(bajoMinimo(i, totalesPorInsumo) && 'font-medium text-amber-600 dark:text-amber-400')}
        >
          {i.stock_actual}
        </span>
      ),
      sortValue: (i) => i.stock_actual,
    },
    {
      header: 'Fecha de ingreso',
      accessor: (i) =>
        i.fecha_ingreso ? new Date(`${i.fecha_ingreso}T00:00:00`).toLocaleDateString('es-CO') : '—',
      sortValue: (i) => i.fecha_ingreso ?? '',
    },
    {
      header: 'Costo unitario',
      className: 'text-right',
      accessor: (i) => formatCurrency(i.costo_unitario),
      sortValue: (i) => i.costo_unitario,
    },
    {
      header: 'Costo total',
      className: 'text-right',
      accessor: (i) => formatCurrency(i.stock_actual * i.costo_unitario),
      sortValue: (i) => i.stock_actual * i.costo_unitario,
    },
    {
      header: 'Stock mínimo',
      className: 'text-right',
      accessor: (i) => i.stock_minimo,
      sortValue: (i) => i.stock_minimo,
    },
    {
      header: 'Observaciones',
      accessor: (i) => <span className="text-muted-foreground">{i.observaciones ?? '—'}</span>,
      sortValue: (i) => (i.observaciones ?? '').toLowerCase(),
    },
    {
      header: 'Acciones',
      className: 'text-right',
      accessor: (i) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Ajustar stock de ${i.nombre}`}
            onClick={() => setInsumoAjustando(i)}
          >
            <ArrowUpDown className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Editar ${i.nombre}`}
            onClick={() => {
              setInsumoEditando(i)
              setFormAbierto(true)
            }}
          >
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Eliminar ${i.nombre}`}
            onClick={() => setInsumoAEliminar(i)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Inventario"
        description="Control de insumos, costos y alertas de stock."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setImportarAbierto(true)}>
              <Upload className="size-4" aria-hidden="true" />
              Importar Excel
            </Button>
            <Button
              onClick={() => {
                setInsumoEditando(null)
                setFormAbierto(true)
              }}
            >
              <Plus className="size-4" aria-hidden="true" />
              Nuevo insumo
            </Button>
          </div>
        }
        filters={
          <>
            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODAS_LAS_CATEGORIAS}>Todas las categorías</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={soloBajoMinimo ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSoloBajoMinimo((activo) => !activo)}
            >
              <AlertTriangle className="size-4" aria-hidden="true" />
              Solo bajo mínimo ({criticos.length})
            </Button>
            <Input
              type="date"
              className="w-40"
              aria-label="Fecha de ingreso desde"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
            <Input
              type="date"
              className="w-40"
              aria-label="Fecha de ingreso hasta"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </>
        }
      />

      {criticos.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
          <div className="mb-1 flex items-center gap-1.5 text-sm font-medium text-amber-800 dark:text-amber-300">
            <AlertTriangle className="size-4" aria-hidden="true" />
            {criticos.length} insumo(s) en o por debajo del stock mínimo
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {criticos
              .slice(0, 5)
              .map((i) => `${i.nombre} (${i.stock_actual}/${i.stock_minimo})`)
              .join(', ')}
            {criticos.length > 5 && ` y ${criticos.length - 5} más.`}
          </p>
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiCard icon={Package} title="Insumos" value={String(insumos.length)} />
        <KpiCard icon={AlertTriangle} title="Bajo mínimo" value={String(criticos.length)} />
        <KpiCard
          icon={Package}
          title="Valor del inventario"
          value={formatCurrency(valorInventario)}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando inventario...</p>
      ) : (
        <DataTable
          columns={columnas}
          data={filtrados}
          keyExtractor={(i) => i.id}
          emptyIcon={Package}
          emptyTitle="Todavía no hay insumos"
          emptyDescription="Crea el primero con 'Nuevo insumo' o carga tu Excel con 'Importar Excel'."
          pageSize={20}
        />
      )}

      <InsumoFormDialog
        open={formAbierto}
        onOpenChange={setFormAbierto}
        insumo={insumoEditando}
        proveedores={proveedores}
        categorias={categorias}
      />

      <ImportarExcelDialog open={importarAbierto} onOpenChange={setImportarAbierto} />

      <AjustarStockDialog
        insumo={insumoAjustando}
        onOpenChange={(abierto) => !abierto && setInsumoAjustando(null)}
      />

      <ConfirmDialog
        open={!!insumoAEliminar}
        onOpenChange={(abierto) => !abierto && setInsumoAEliminar(null)}
        title="¿Eliminar este insumo?"
        description={`${insumoAEliminar?.nombre ?? ''} dejará de aparecer en el inventario. Su historial de entradas y salidas se conserva.`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={async () => {
          if (insumoAEliminar) await eliminarMutation.mutateAsync(insumoAEliminar.id)
        }}
      />
    </>
  )
}
