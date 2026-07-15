import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ShoppingCart, Plus, Trash2, Eye } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
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
import { formatCurrency } from '@/utils/formatCurrency'
import type { EstadoPedido, Pedido } from '@/types/database'

const CANALES = ['WhatsApp', 'Instagram', 'Facebook', 'Tienda', 'Otro'] as const
const PRIORIDADES = ['Baja', 'Media', 'Alta', 'Urgente'] as const
const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Nequi', 'Daviplata', 'Tarjeta', 'Otro'] as const
const ESTADOS: EstadoPedido[] = ['Nuevo', 'Diseño', 'Producción', 'Listo', 'Entregado', 'Cancelado']

const pedidoSchema = z.object({
  cliente_id: z.string().min(1, 'El cliente es obligatorio.'),
  canal_ingreso: z.enum(CANALES),
  prioridad: z.enum(PRIORIDADES).optional(),
  fecha_entrega: z.string().optional(),
  metodo_pago: z.enum(METODOS_PAGO).optional(),
  descuento: z.coerce.number().nonnegative().optional(),
  anticipo: z.coerce.number().nonnegative().optional(),
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

type PedidoFormInput = z.input<typeof pedidoSchema>
type PedidoFormValues = z.output<typeof pedidoSchema>

function NuevoPedidoDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

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

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PedidoFormInput, unknown, PedidoFormValues>({
    resolver: zodResolver(pedidoSchema),
    defaultValues: { detalle: [{ producto_id: '', cantidad: 1, precio_unitario: 0 }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'detalle' })

  async function onSubmit(values: PedidoFormValues) {
    const resultado = await PedidoService.crear(values)
    if (!resultado.success) {
      toast.error(resultado.error?.message ?? 'No fue posible crear el pedido.')
      return
    }

    toast.success(`Pedido ${resultado.data!.numero_pedido} creado correctamente.`)
    queryClient.invalidateQueries({ queryKey: ['pedidos'] })
    reset({ detalle: [{ producto_id: '', cantidad: 1, precio_unitario: 0 }] })
    onOpenChange(false)
    navigate(`/pedidos/${resultado.data!.id}`)
  }

  const campoAltura = 'h-11 data-[size=default]:h-11'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[960px]">
        <DialogHeader>
          <DialogTitle>Nuevo pedido</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cliente_id">Cliente</Label>
            <Select onValueChange={(value) => setValue('cliente_id', value, { shouldValidate: true })}>
              <SelectTrigger id="cliente_id" className={cn('w-full', campoAltura)}>
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cliente_id && (
              <p className="text-sm text-destructive">{errors.cliente_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="canal_ingreso">Canal de ingreso</Label>
              <Select onValueChange={(value) => setValue('canal_ingreso', value as (typeof CANALES)[number], { shouldValidate: true })}>
                <SelectTrigger id="canal_ingreso" className={cn('w-full', campoAltura)}>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {CANALES.map((canal) => (
                    <SelectItem key={canal} value={canal}>
                      {canal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.canal_ingreso && (
                <p className="text-sm text-destructive">{errors.canal_ingreso.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="prioridad">Prioridad</Label>
              <Select onValueChange={(value) => setValue('prioridad', value as (typeof PRIORIDADES)[number])}>
                <SelectTrigger id="prioridad" className={cn('w-full', campoAltura)}>
                  <SelectValue placeholder="Media" />
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
              <Label htmlFor="descuento">Descuento</Label>
              <Input id="descuento" type="number" step="0.01" className={campoAltura} {...register('descuento')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="anticipo">Anticipo</Label>
              <Input id="anticipo" type="number" step="0.01" className={campoAltura} {...register('anticipo')} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fecha_entrega">Fecha de entrega</Label>
            <Input id="fecha_entrega" type="date" className={campoAltura} {...register('fecha_entrega')} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="sm:w-auto">
              {isSubmitting ? 'Creando...' : 'Crear pedido'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function PedidosPage() {
  const navigate = useNavigate()
  const [formAbierto, setFormAbierto] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | 'todos'>('todos')

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['pedidos', filtroEstado],
    queryFn: async () => {
      const resultado = await PedidoService.list(
        filtroEstado === 'todos' ? {} : { estado: filtroEstado },
      )
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
  })

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const resultado = await ClienteService.list()
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
  })
  const nombreCliente = (clienteId: string) =>
    clientes.find((c) => c.id === clienteId)?.nombre ?? '—'

  const columnas: DataTableColumn<Pedido>[] = [
    {
      header: 'Número',
      accessor: (p) => p.numero_pedido,
      sortValue: (p) => p.numero_pedido,
    },
    { header: 'Cliente', accessor: (p) => nombreCliente(p.cliente_id) },
    { header: 'Estado', accessor: (p) => <StatusBadge estado={p.estado} /> },
    {
      header: 'Valor total',
      accessor: (p) => formatCurrency(p.valor_total),
      sortValue: (p) => p.valor_total,
      className: 'text-right',
    },
    {
      header: 'Saldo pendiente',
      accessor: (p) => formatCurrency(p.saldo_pendiente),
      sortValue: (p) => p.saldo_pendiente,
      className: 'text-right',
    },
    {
      header: 'Fecha',
      accessor: (p) => new Date(p.fecha_pedido).toLocaleDateString('es-CO'),
      sortValue: (p) => p.fecha_pedido,
    },
    {
      header: '',
      className: 'text-right',
      accessor: (p) => (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Ver pedido ${p.numero_pedido}`}
          onClick={() => navigate(`/pedidos/${p.id}`)}
        >
          <Eye className="size-4" aria-hidden="true" />
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Pedidos"
        description="Gestión completa del ciclo de vida del pedido."
        actions={
          <Button onClick={() => setFormAbierto(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Nuevo Pedido
          </Button>
        }
        filters={
          <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v as typeof filtroEstado)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              {ESTADOS.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando pedidos...</p>
      ) : (
        <DataTable
          columns={columnas}
          data={pedidos}
          keyExtractor={(p) => p.id}
          emptyIcon={ShoppingCart}
          emptyTitle="Todavía no hay pedidos"
          emptyDescription="Registra el primero con el botón 'Nuevo Pedido'."
        />
      )}

      <NuevoPedidoDialog open={formAbierto} onOpenChange={setFormAbierto} />
    </>
  )
}
