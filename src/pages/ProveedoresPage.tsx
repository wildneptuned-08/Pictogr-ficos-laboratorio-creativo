import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Truck, Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/data/DataTable'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProveedorService } from '@/services/ProveedorService'
import type { Proveedor } from '@/types/database'

const proveedorSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  prefijo_id: z
    .string()
    .min(1, 'El prefijo es obligatorio.')
    .max(20, 'El prefijo es demasiado largo.'),
})

type ProveedorFormInput = z.input<typeof proveedorSchema>
type ProveedorFormValues = z.output<typeof proveedorSchema>

function ProveedorFormDialog({
  open,
  onOpenChange,
  proveedor,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  proveedor: Proveedor | null
}) {
  const queryClient = useQueryClient()
  const esEdicion = !!proveedor

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProveedorFormInput, unknown, ProveedorFormValues>({
    resolver: zodResolver(proveedorSchema),
    values: proveedor
      ? { nombre: proveedor.nombre, prefijo_id: proveedor.prefijo_id }
      : { nombre: '', prefijo_id: '' },
  })

  async function onSubmit(values: ProveedorFormValues) {
    const resultado = esEdicion
      ? await ProveedorService.update(proveedor!.id, values)
      : await ProveedorService.create(values)

    if (!resultado.success) {
      toast.error(resultado.error?.message ?? 'No fue posible guardar el proveedor.')
      return
    }

    toast.success(esEdicion ? 'Proveedor actualizado.' : 'Proveedor creado.')
    queryClient.invalidateQueries({ queryKey: ['proveedores'] })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? 'Editar proveedor' : 'Nuevo proveedor'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" aria-invalid={!!errors.nombre} {...register('nombre')} />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prefijo_id">Prefijo</Label>
            <Input
              id="prefijo_id"
              placeholder="Ej: PROV1"
              className="uppercase"
              aria-invalid={!!errors.prefijo_id}
              {...register('prefijo_id')}
            />
            <p className="text-xs text-muted-foreground">
              Se usa para generar los códigos de sus productos: PREFIJO-XXXX.
            </p>
            {errors.prefijo_id && (
              <p className="text-sm text-destructive">{errors.prefijo_id.message}</p>
            )}
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

export function ProveedoresPage() {
  const queryClient = useQueryClient()
  const [formAbierto, setFormAbierto] = useState(false)
  const [proveedorEditando, setProveedorEditando] = useState<Proveedor | null>(null)
  const [proveedorAEliminar, setProveedorAEliminar] = useState<Proveedor | null>(null)

  const { data: proveedores = [], isLoading } = useQuery({
    queryKey: ['proveedores'],
    queryFn: async () => {
      const resultado = await ProveedorService.list()
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
  })

  const eliminarMutation = useMutation({
    mutationFn: (id: string) => ProveedorService.eliminar(id),
    onSuccess: (resultado) => {
      if (!resultado.success) {
        toast.error(resultado.error?.message ?? 'No fue posible eliminar el proveedor.')
        return
      }
      toast.success('Proveedor eliminado.')
      queryClient.invalidateQueries({ queryKey: ['proveedores'] })
    },
  })

  const columnas: DataTableColumn<Proveedor>[] = [
    { header: 'Nombre', accessor: (p) => p.nombre, sortValue: (p) => p.nombre.toLowerCase() },
    {
      header: 'Prefijo',
      accessor: (p) => (
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{p.prefijo_id}</span>
      ),
      sortValue: (p) => p.prefijo_id,
    },
    {
      header: 'Acciones',
      className: 'text-right',
      accessor: (p) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Editar ${p.nombre}`}
            onClick={() => {
              setProveedorEditando(p)
              setFormAbierto(true)
            }}
          >
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Eliminar ${p.nombre}`}
            onClick={() => setProveedorAEliminar(p)}
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
        title="Proveedores"
        description="Gestión de proveedores y sus prefijos de código."
        actions={
          <Button
            onClick={() => {
              setProveedorEditando(null)
              setFormAbierto(true)
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
            Nuevo Proveedor
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando proveedores...</p>
      ) : (
        <DataTable
          columns={columnas}
          data={proveedores}
          keyExtractor={(p) => p.id}
          emptyIcon={Truck}
          emptyTitle="Todavía no hay proveedores"
          emptyDescription="Registra el primero con el botón 'Nuevo Proveedor'."
        />
      )}

      <ProveedorFormDialog
        open={formAbierto}
        onOpenChange={setFormAbierto}
        proveedor={proveedorEditando}
      />

      <ConfirmDialog
        open={!!proveedorAEliminar}
        onOpenChange={(open) => !open && setProveedorAEliminar(null)}
        title="¿Eliminar este proveedor?"
        description={`${proveedorAEliminar?.nombre ?? ''} se eliminará. Los productos e insumos asociados conservarán su código pero quedarán sin proveedor.`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={async () => {
          if (proveedorAEliminar) await eliminarMutation.mutateAsync(proveedorAEliminar.id)
        }}
      />
    </>
  )
}
