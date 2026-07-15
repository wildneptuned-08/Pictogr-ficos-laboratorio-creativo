import { useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Copy, FileText, Trash2, Upload, Download } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/data/StatusBadge'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
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
import { PedidoService } from '@/services/PedidoService'
import { ClienteService } from '@/services/ClienteService'
import { ProductoService } from '@/services/ProductoService'
import { ArchivoService } from '@/services/ArchivoService'
import { formatCurrency } from '@/utils/formatCurrency'
import type { EstadoPedido } from '@/types/database'

const ESTADOS: EstadoPedido[] = ['Nuevo', 'Diseño', 'Producción', 'Listo', 'Entregado', 'Cancelado']

export function PedidoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoPedido | ''>('')
  const [valorPago, setValorPago] = useState('')
  const [cancelarAbierto, setCancelarAbierto] = useState(false)

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

  return (
    <>
      <PageHeader
        title={pedido.numero_pedido}
        description={cliente?.nombre ?? 'Cliente no encontrado'}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge estado={pedido.estado} />
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
                    <SelectItem key={estado} value={estado} disabled={estado === pedido.estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                disabled={!estadoSeleccionado || cambiarEstadoMutation.isPending}
                onClick={() => estadoSeleccionado && cambiarEstadoMutation.mutate(estadoSeleccionado)}
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
