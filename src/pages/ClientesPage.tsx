import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Users, Plus, Pencil, UserX, Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/data/DataTable'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ClienteService, type CrearClienteInput } from '@/services/ClienteService'
import type { Cliente } from '@/types/database'

const clienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  telefono: z.string().min(1, 'El teléfono es obligatorio.'),
  correo: z.string().email('Correo inválido.').optional().or(z.literal('')),
  ciudad: z.string().optional(),
  direccion: z.string().optional(),
  observaciones: z.string().optional(),
})

type ClienteFormValues = z.infer<typeof clienteSchema>

function ClienteFormDialog({
  open,
  onOpenChange,
  cliente,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente: Cliente | null
}) {
  const queryClient = useQueryClient()
  const esEdicion = !!cliente

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    values: cliente
      ? {
          nombre: cliente.nombre,
          telefono: cliente.telefono,
          correo: cliente.correo ?? '',
          ciudad: cliente.ciudad ?? '',
          direccion: cliente.direccion ?? '',
          observaciones: cliente.observaciones ?? '',
        }
      : undefined,
  })

  async function onSubmit(values: ClienteFormValues) {
    const input: CrearClienteInput = {
      ...values,
      correo: values.correo || undefined,
    }

    const resultado = esEdicion
      ? await ClienteService.update(cliente!.id, input)
      : await ClienteService.create(input)

    if (!resultado.success) {
      toast.error(resultado.error?.message ?? 'No fue posible guardar el cliente.')
      return
    }

    toast.success(esEdicion ? 'Cliente actualizado correctamente.' : 'Cliente registrado correctamente.')
    queryClient.invalidateQueries({ queryKey: ['clientes'] })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" aria-invalid={!!errors.nombre} {...register('nombre')} />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" aria-invalid={!!errors.telefono} {...register('telefono')} />
            {errors.telefono && <p className="text-sm text-destructive">{errors.telefono.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="correo">Correo</Label>
            <Input id="correo" type="email" aria-invalid={!!errors.correo} {...register('correo')} />
            {errors.correo && <p className="text-sm text-destructive">{errors.correo.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input id="ciudad" {...register('ciudad')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" {...register('direccion')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea id="observaciones" {...register('observaciones')} />
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

export function ClientesPage() {
  const queryClient = useQueryClient()
  const [busqueda, setBusqueda] = useState('')
  const [formAbierto, setFormAbierto] = useState(false)
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)
  const [clienteADesactivar, setClienteADesactivar] = useState<Cliente | null>(null)

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes', busqueda],
    queryFn: async () => {
      const resultado = busqueda
        ? await ClienteService.search(busqueda)
        : await ClienteService.list()
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
  })

  const desactivarMutation = useMutation({
    mutationFn: (id: string) => ClienteService.desactivar(id),
    onSuccess: (resultado) => {
      if (!resultado.success) {
        toast.error(resultado.error?.message ?? 'No fue posible desactivar el cliente.')
        return
      }
      toast.success('Cliente desactivado.')
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
    },
  })

  const columnas: DataTableColumn<Cliente>[] = [
    { header: 'Nombre', accessor: (c) => c.nombre, sortValue: (c) => c.nombre.toLowerCase() },
    { header: 'Teléfono', accessor: (c) => c.telefono },
    { header: 'Correo', accessor: (c) => c.correo ?? '—' },
    { header: 'Ciudad', accessor: (c) => c.ciudad ?? '—' },
    {
      header: 'Acciones',
      className: 'text-right',
      accessor: (c) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Editar ${c.nombre}`}
            onClick={() => {
              setClienteEditando(c)
              setFormAbierto(true)
            }}
          >
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Desactivar ${c.nombre}`}
            onClick={() => setClienteADesactivar(c)}
          >
            <UserX className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Administración de clientes."
        actions={
          <Button
            onClick={() => {
              setClienteEditando(null)
              setFormAbierto(true)
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
            Nuevo Cliente
          </Button>
        }
        filters={
          <div className="relative w-full max-w-xs">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              placeholder="Buscar por nombre o teléfono..."
              className="pl-8"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando clientes...</p>
      ) : (
        <DataTable
          columns={columnas}
          data={clientes}
          keyExtractor={(c) => c.id}
          emptyIcon={Users}
          emptyTitle="Todavía no hay clientes"
          emptyDescription="Registra el primero con el botón 'Nuevo Cliente'."
        />
      )}

      <ClienteFormDialog
        open={formAbierto}
        onOpenChange={setFormAbierto}
        cliente={clienteEditando}
      />

      <ConfirmDialog
        open={!!clienteADesactivar}
        onOpenChange={(open) => !open && setClienteADesactivar(null)}
        title="¿Desactivar este cliente?"
        description={`${clienteADesactivar?.nombre ?? ''} dejará de aparecer en el listado, pero su historial de pedidos se conserva.`}
        confirmLabel="Desactivar"
        destructive
        onConfirm={async () => {
          if (clienteADesactivar) await desactivarMutation.mutateAsync(clienteADesactivar.id)
        }}
      />
    </>
  )
}
