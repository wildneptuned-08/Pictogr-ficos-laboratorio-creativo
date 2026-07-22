import { useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Copy, FileText, Trash2, Upload, Download, Pencil, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/data/StatusBadge'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { Card } from '@/components/ui/card'
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
import { PedidoService } from '@/services/PedidoService'
import { ClienteService } from '@/services/ClienteService'
import { ProductoService } from '@/services/ProductoService'
import { ArchivoService } from '@/services/ArchivoService'
import { formatCurrency } from '@/utils/formatCurrency'
import type { EstadoPedido, Pedido, PedidoDetalle, Producto } from '@/types/database'

const ESTADOS: EstadoPedido[] = ['Nuevo', 'Diseño', 'Producción', 'Listo', 'Entregado', 'Cancelado']
const CANALES = ['WhatsApp', 'Instagram', 'Facebook', 'Tienda', 'Otro'] as const
const PRIORIDADES = ['Baja', 'Media', 'Alta', 'Urgente'] as const
const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Nequi', 'Daviplata', 'Tarjeta', 'Otro'] as const

const editarPedidoSchema = z.object({
  canal_ingreso: z.enum(CANALES),
  prioridad: z.enum(PRIORIDADES),
  fecha_entrega: z.string().optional(),
  metodo_pago: z.enum(METODOS_PAGO).optional(),
  descuento: z.coerce.number().nonnegative().optional(),
  observaciones: z.string().optional(),
  detalle: z
    .array(
      z.object({
        producto_id: z.string().min(1, 'Selecciona un producto.'),
        cantidad: z.coerce.number().int().positive('Debe ser mayor que cero.'),
        precio_unitario: z.coerce.number().nonnegative(),
      }),
    )
    .min(1, 'Agrega al menos un producto.'),
})

type EditarPedidoInput = z.input<typeof editarPedidoSchema>
type EditarPedidoValues = z.output<typeof editarPedidoSchema>

function EditarPedidoDialog({
  open,
  onOpenChange,
  pedido,
  detalle,
  productos,
  onGuardado,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pedido: Pedido
  detalle: PedidoDetalle[]
  productos: Producto[]
  onGuardado: () => void
}) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditarPedidoInput, unknown, EditarPedidoValues>({
    resolver: zodResolver(editarPedidoSchema),
    values: {
      canal_ingreso: pedido.canal_ingreso,
      prioridad: pedido.prioridad,
      fecha_entrega: pedido.fecha_entrega ?? '',
      metodo_pago: pedido.metodo_pago ?? undefined,
      descuento: pedido.descuento,
      observaciones: pedido.observaciones ?? '',
      detalle:
        detalle.length > 0
          ? detalle.map((d) => ({
              producto_id: d.producto_id,
              cantidad: d.cantidad,
              precio_unitario: d.precio_unitario,
            }))
          : [{ producto_id: '', cantidad: 1, precio_unitario: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'detalle' })

  const lineas = useWatch({ control, name: 'detalle' })
  const canalActual = useWatch({ control, name: 'canal_ingreso' })
  const prioridadActual = useWatch({ control, name: 'prioridad' })
  const metodoActual = useWatch({ control, name: 'metodo_pago' })
  const descuentoActual = useWatch({ control, name: 'descuento' })
  const descuento = Number(descuentoActual) || 0
  const subtotal = (lineas ?? []).reduce(
    (total, l) => total + (Number(l.cantidad) || 0) * (Number(l.precio_unitario) || 0),
    0,
  )
  const valorTotal = subtotal - descuento
  const saldoResultante = valorTotal - pedido.anticipo

  async function onSubmit(values: EditarPedidoValues) {
    const resultado = await PedidoService.actualizarDetalle(pedido.id, values)
    if (!resultado.success) {
      toast.error(resultado.error?.message ?? 'No fue posible guardar los cambios.')
      return
    }
    toast.success('Pedido actualizado.')
    onGuardado()
    onOpenChange(false)
  }

  const campoAltura = 'h-11 data-[size=default]:h-11'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[960px]">
        <DialogHeader>
          <DialogTitle>Editar pedido {pedido.numero_pedido}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit_canal">Canal de ingreso</Label>
              <Select
                value={canalActual}
                onValueChange={(v) => setValue('canal_ingreso', v as (typeof CANALES)[number])}
              >
                <SelectTrigger id="edit_canal" className={cn('w-full', campoAltura)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CANALES.map((canal) => (
                    <SelectItem key={canal} value={canal}>
                      {canal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit_prioridad">Prioridad</Label>
              <Select
                value={prioridadActual}
                onValueChange={(v) => setValue('prioridad', v as (typeof PRIORIDADES)[number])}
              >
                <SelectTrigger id="edit_prioridad" className={cn('w-full', campoAltura)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORIDADES.map((prioridad) => (
                    <SelectItem key={prioridad} value={prioridad}>
                      {prioridad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
            <Label>Productos</Label>
            <div className="hidden gap-2 px-1 text-xs text-muted-foreground sm:grid sm:grid-cols-[1fr_120px_160px_2.25rem]">
              <span>Producto</span>
              <span>Cantidad</span>
              <span>Precio</span>
              <span aria-hidden="true" />
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 items-end gap-2 rounded-md border border-border/60 bg-muted/20 p-2 sm:grid-cols-[1fr_120px_160px_2.25rem] sm:border-0 sm:bg-transparent sm:p-0"
              >
                <Select
                  value={lineas?.[index]?.producto_id ?? ''}
                  onValueChange={(value) => {
                    setValue(`detalle.${index}.producto_id`, value, { shouldValidate: true })
                    const producto = productos.find((p) => p.id === value)
                    if (producto) {
                      setValue(`detalle.${index}.precio_unitario`, producto.precio_base)
                    }
                  }}
                >
                  <SelectTrigger className={cn('w-full', campoAltura)}>
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
                <Input
                  type="number"
                  className={campoAltura}
                  placeholder="Cantidad"
                  {...register(`detalle.${index}.cantidad`)}
                />
                <Input
                  type="number"
                  step="0.01"
                  className={campoAltura}
                  placeholder="Precio"
                  {...register(`detalle.${index}.precio_unitario`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="justify-self-start sm:justify-self-center"
                  aria-label="Quitar producto"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
            {errors.detalle?.root?.message && (
              <p className="text-sm text-destructive">{errors.detalle.root.message}</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => append({ producto_id: '', cantidad: 1, precio_unitario: 0 })}
            >
              <Plus className="size-4" aria-hidden="true" />
              Agregar producto
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit_descuento">Descuento</Label>
              <Input
                id="edit_descuento"
                type="number"
                step="0.01"
                className={campoAltura}
                {...register('descuento')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit_metodo">Método de pago</Label>
              <Select
                value={metodoActual ?? ''}
                onValueChange={(v) => setValue('metodo_pago', v as (typeof METODOS_PAGO)[number])}
              >
                <SelectTrigger id="edit_metodo" className={cn('w-full', campoAltura)}>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {METODOS_PAGO.map((metodo) => (
                    <SelectItem key={metodo} value={metodo}>
                      {metodo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit_fecha">Fecha de entrega</Label>
            <Input id="edit_fecha" type="date" className={campoAltura} {...register('fecha_entrega')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit_obs">Observaciones</Label>
            <Textarea id="edit_obs" {...register('observaciones')} />
          </div>

          <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/20 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span>{formatCurrency(valorTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ya pagado (anticipo)</span>
              <span>{formatCurrency(pedido.anticipo)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Saldo resultante</span>
              <span className={saldoResultante < 0 ? 'text-destructive' : ''}>
                {formatCurrency(saldoResultante)}
              </span>
            </div>
            {saldoResultante < 0 && (
              <p className="text-xs text-destructive">
                El total no puede quedar por debajo de lo ya pagado.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || saldoResultante < 0}>
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function PedidoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoPedido | ''>('')
  const [valorPago, setValorPago] = useState('')
  const [cancelarAbierto, setCancelarAbierto] = useState(false)
  const [editarAbierto, setEditarAbierto] = useState(false)
  const [confirmarListoAbierto, setConfirmarListoAbierto] = useState(false)

  const pedidoQuery = useQuery({
    queryKey: ['pedido', id],
    queryFn: async () => {
      const resultado = await PedidoService.findById(id!)
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data
    },
    enabled: !!id,
  })

  const detalleQuery = useQuery({
    queryKey: ['pedido-detalle', id],
    queryFn: async () => {
      const resultado = await PedidoService.obtenerDetalle(id!)
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
    enabled: !!id,
  })

  const historialQuery = useQuery({
    queryKey: ['pedido-historial', id],
    queryFn: async () => {
      const resultado = await PedidoService.obtenerHistorial(id!)
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
    enabled: !!id,
  })

  const archivosQuery = useQuery({
    queryKey: ['pedido-archivos', id],
    queryFn: async () => {
      const resultado = await ArchivoService.consultarArchivos(id!)
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
    enabled: !!id,
  })

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const resultado = await ClienteService.list()
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
  })

  const { data: productos = [] } = useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const resultado = await ProductoService.list()
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
  })

  function invalidarTodo() {
    queryClient.invalidateQueries({ queryKey: ['pedido', id] })
    queryClient.invalidateQueries({ queryKey: ['pedido-historial', id] })
    queryClient.invalidateQueries({ queryKey: ['pedidos'] })
  }

  const cambiarEstadoMutation = useMutation({
    mutationFn: (estado: EstadoPedido) => PedidoService.cambiarEstado(id!, estado),
    onSuccess: (resultado) => {
      if (!resultado.success) {
        toast.error(resultado.error?.message ?? 'No fue posible cambiar el estado.')
        return
      }
      toast.success('Estado actualizado.')
      setEstadoSeleccionado('')
      invalidarTodo()
    },
  })

  const registrarPagoMutation = useMutation({
    mutationFn: (valor: number) => PedidoService.registrarPago(id!, valor),
    onSuccess: (resultado) => {
      if (!resultado.success) {
        toast.error(resultado.error?.message ?? 'No fue posible registrar el pago.')
        return
      }
      toast.success('Pago registrado.')
      setValorPago('')
      invalidarTodo()
    },
  })

  const duplicarMutation = useMutation({
    mutationFn: () => PedidoService.duplicar(id!),
    onSuccess: (resultado) => {
      if (!resultado.success || !resultado.data) {
        toast.error(resultado.error?.message ?? 'No fue posible duplicar el pedido.')
        return
      }
      toast.success(`Pedido ${resultado.data.numero_pedido} creado a partir de este.`)
      navigate(`/pedidos/${resultado.data.id}`)
    },
  })

  const subirArchivoMutation = useMutation({
    mutationFn: (file: File) => ArchivoService.subir(id!, file),
    onSuccess: (resultado) => {
      if (!resultado.success) {
        toast.error(resultado.error?.message ?? 'No fue posible subir el archivo.')
        return
      }
      toast.success('Archivo subido.')
      queryClient.invalidateQueries({ queryKey: ['pedido-archivos', id] })
    },
  })

  const eliminarArchivoMutation = useMutation({
    mutationFn: (archivoId: string) => ArchivoService.eliminar(archivoId),
    onSuccess: (resultado) => {
      if (!resultado.success) {
        toast.error(resultado.error?.message ?? 'No fue posible eliminar el archivo.')
        return
      }
      queryClient.invalidateQueries({ queryKey: ['pedido-archivos', id] })
    },
  })

  async function descargarArchivo(archivoId: string) {
    const resultado = await ArchivoService.obtenerUrlPublica(archivoId)
    if (!resultado.success || !resultado.data) {
      toast.error(resultado.error?.message ?? 'No fue posible generar el enlace.')
      return
    }
    window.open(resultado.data, '_blank', 'noopener,noreferrer')
  }

  const pedido = pedidoQuery.data

  if (pedidoQuery.isLoading || !pedido) {
    return <p className="text-sm text-muted-foreground">Cargando pedido...</p>
  }

  const cliente = clientes.find((c) => c.id === pedido.cliente_id)
  const nombreProducto = (productoId: string) =>
    productos.find((p) => p.id === productoId)?.nombre ?? '—'

  // Reglas de estado según el saldo (10_MODULO_PEDIDOS.md, "Validaciones"):
  // "Entregado" se bloquea con saldo pendiente (la RPC también lo impide con
  // P0008); "Listo" solo advierte, para no frenar la operación del taller.
  const saldoPendiente = pedido.saldo_pendiente
  const tieneSaldo = saldoPendiente > 0
  const entregaBloqueada = tieneSaldo
  const listoConSaldo = estadoSeleccionado === 'Listo' && tieneSaldo

  function aplicarCambioEstado() {
    if (!estadoSeleccionado) return
    if (estadoSeleccionado === 'Entregado' && entregaBloqueada) {
      toast.error(
        `No se puede marcar como Entregado: quedan ${formatCurrency(saldoPendiente)} de saldo pendiente.`,
      )
      return
    }
    if (listoConSaldo) {
      setConfirmarListoAbierto(true)
      return
    }
    cambiarEstadoMutation.mutate(estadoSeleccionado)
  }

  return (
    <>
      <PageHeader
        title={pedido.numero_pedido}
        description={cliente?.nombre ?? 'Cliente no encontrado'}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge estado={pedido.estado} />
            {pedido.estado !== 'Entregado' && pedido.estado !== 'Cancelado' && (
              <Button variant="outline" size="sm" onClick={() => setEditarAbierto(true)}>
                <Pencil className="size-4" aria-hidden="true" />
                Editar
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => duplicarMutation.mutate()}>
              <Copy className="size-4" aria-hidden="true" />
              Duplicar
            </Button>
            {pedido.estado !== 'Cancelado' && (
              <Button variant="destructive" size="sm" onClick={() => setCancelarAbierto(true)}>
                Cancelar pedido
              </Button>
            )}
          </div>
        }
      />

      <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate('/pedidos')}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver a Pedidos
      </Button>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card className="p-4">
            <h3 className="mb-3 font-medium">Productos</h3>
            <div className="flex flex-col gap-2">
              {(detalleQuery.data ?? []).map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.cantidad} × {nombreProducto(item.producto_id)}
                  </span>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-1 border-t border-border pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(pedido.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descuento</span>
                <span>{formatCurrency(pedido.descuento)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(pedido.valor_total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Anticipo</span>
                <span>{formatCurrency(pedido.anticipo)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Saldo pendiente</span>
                <span>{formatCurrency(pedido.saldo_pendiente)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="mb-3 font-medium">Archivos</h3>
            <div className="flex flex-col gap-2">
              {(archivosQuery.data ?? []).map((archivo) => (
                <div key={archivo.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                    {archivo.nombre_archivo}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Descargar ${archivo.nombre_archivo}`}
                      onClick={() => descargarArchivo(archivo.id)}
                    >
                      <Download className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Eliminar ${archivo.nombre_archivo}`}
                      onClick={() => eliminarArchivoMutation.mutate(archivo.id)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ))}
              {(archivosQuery.data ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">Sin archivos todavía.</p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.svg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) subirArchivoMutation.mutate(file)
                e.target.value = ''
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => fileInputRef.current?.click()}
              disabled={subirArchivoMutation.isPending}
            >
              <Upload className="size-4" aria-hidden="true" />
              {subirArchivoMutation.isPending ? 'Subiendo...' : 'Subir archivo'}
            </Button>
          </Card>

          <Card className="p-4">
            <h3 className="mb-3 font-medium">Historial</h3>
            <ol className="flex flex-col gap-3">
              {(historialQuery.data ?? []).map((evento) => (
                <li key={evento.id} className="text-sm">
                  <p>
                    <span className="text-muted-foreground">
                      {new Date(evento.fecha).toLocaleString('es-CO')}
                    </span>
                  </p>
                  <p>
                    {evento.estado_anterior ?? 'Inicio'} → {evento.estado_nuevo}
                    {evento.comentario && ` — ${evento.comentario}`}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <h3 className="mb-3 font-medium">Cambiar estado</h3>
            <div className="flex flex-col gap-2">
              <Select value={estadoSeleccionado} onValueChange={(v) => setEstadoSeleccionado(v as EstadoPedido)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((estado) => (
                    <SelectItem
                      key={estado}
                      value={estado}
                      disabled={
                        estado === pedido.estado || (estado === 'Entregado' && entregaBloqueada)
                      }
                    >
                      {estado}
                      {estado === 'Entregado' && entregaBloqueada && ' (requiere saldo en cero)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {tieneSaldo && (
                <p
                  className={cn(
                    'rounded-md px-2 py-1.5 text-xs',
                    listoConSaldo
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      : 'text-muted-foreground',
                  )}
                >
                  {listoConSaldo
                    ? `Este pedido tiene ${formatCurrency(saldoPendiente)} de saldo pendiente. Puedes marcarlo como Listo, pero deberás cobrarlo antes de entregarlo.`
                    : `Saldo pendiente de ${formatCurrency(saldoPendiente)}: el estado Entregado permanece bloqueado hasta que se registre el pago completo.`}
                </p>
              )}

              <Button
                disabled={!estadoSeleccionado || cambiarEstadoMutation.isPending}
                onClick={aplicarCambioEstado}
              >
                {cambiarEstadoMutation.isPending ? 'Actualizando...' : 'Aplicar cambio'}
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="mb-3 font-medium">Registrar pago</h3>
            {pedido.saldo_pendiente === 0 ? (
              <p className="text-sm text-muted-foreground">Este pedido ya está totalmente pagado.</p>
            ) : (
              <div className="flex flex-col gap-2">
                <Label htmlFor="valor-pago">Valor</Label>
                <Input
                  id="valor-pago"
                  type="number"
                  step="0.01"
                  value={valorPago}
                  onChange={(e) => setValorPago(e.target.value)}
                />
                <Button
                  disabled={!valorPago || registrarPagoMutation.isPending}
                  onClick={() => registrarPagoMutation.mutate(Number(valorPago))}
                >
                  {registrarPagoMutation.isPending ? 'Registrando...' : 'Registrar pago'}
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-4 text-sm">
            <h3 className="mb-3 font-medium">Detalles</h3>
            <dl className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Canal</dt>
                <dd>{pedido.canal_ingreso}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Prioridad</dt>
                <dd>{pedido.prioridad}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Método de pago</dt>
                <dd>{pedido.metodo_pago ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Fecha de entrega</dt>
                <dd>{pedido.fecha_entrega ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Cliente</dt>
                <dd>
                  {cliente ? (
                    <Link to="/clientes" className="text-primary hover:underline">
                      {cliente.nombre}
                    </Link>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      <EditarPedidoDialog
        open={editarAbierto}
        onOpenChange={setEditarAbierto}
        pedido={pedido}
        detalle={detalleQuery.data ?? []}
        productos={productos}
        onGuardado={() => {
          invalidarTodo()
          queryClient.invalidateQueries({ queryKey: ['pedido-detalle', id] })
        }}
      />

      <ConfirmDialog
        open={confirmarListoAbierto}
        onOpenChange={setConfirmarListoAbierto}
        title="¿Marcar como Listo con saldo pendiente?"
        description={`Al cliente aún le faltan ${formatCurrency(saldoPendiente)} por pagar. El pedido puede quedar Listo, pero no podrás marcarlo como Entregado hasta registrar el pago completo.`}
        confirmLabel="Marcar como Listo"
        onConfirm={async () => {
          await cambiarEstadoMutation.mutateAsync('Listo')
        }}
      />

      <ConfirmDialog
        open={cancelarAbierto}
        onOpenChange={setCancelarAbierto}
        title="¿Cancelar este pedido?"
        description="El pedido pasará a estado Cancelado. Esta acción queda registrada en el historial."
        confirmLabel="Cancelar pedido"
        destructive
        onConfirm={async () => {
          await cambiarEstadoMutation.mutateAsync('Cancelado')
        }}
      />
    </>
  )
}
