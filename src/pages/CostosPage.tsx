import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Calculator, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/data/DataTable'
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
import { ProductoService } from '@/services/ProductoService'
import { CostoService } from '@/services/CostoService'
import { formatCurrency } from '@/utils/formatCurrency'
import type { CostoProducto, Producto } from '@/types/database'

const costoSchema = z.object({
  costo_material: z.coerce.number().nonnegative('No puede ser negativo.'),
  costo_impresion: z.coerce.number().nonnegative('No puede ser negativo.'),
  costo_empaque: z.coerce.number().nonnegative('No puede ser negativo.'),
  otros_costos: z.coerce.number().nonnegative('No puede ser negativo.'),
})

type CostoFormInput = z.input<typeof costoSchema>
type CostoFormValues = z.output<typeof costoSchema>

function CostoFormDialog({
  open,
  onOpenChange,
  producto,
  costoExistente,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto: Producto | null
  costoExistente: CostoProducto | null
}) {
  const queryClient = useQueryClient()
  const esEdicion = !!costoExistente

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CostoFormInput, unknown, CostoFormValues>({
    resolver: zodResolver(costoSchema),
    values: costoExistente
      ? {
          costo_material: costoExistente.costo_material,
          costo_impresion: costoExistente.costo_impresion,
          costo_empaque: costoExistente.costo_empaque,
          otros_costos: costoExistente.otros_costos,
        }
      : { costo_material: 0, costo_impresion: 0, costo_empaque: 0, otros_costos: 0 },
  })

  async function onSubmit(values: CostoFormValues) {
    const resultado = esEdicion
      ? await CostoService.actualizarCostos(producto!.id, values)
      : await CostoService.calcularCosto({ producto_id: producto!.id, ...values })

    if (!resultado.success) {
      toast.error(resultado.error?.message ?? 'No fue posible guardar los costos.')
      return
    }

    toast.success('Costos guardados correctamente.')
    queryClient.invalidateQueries({ queryKey: ['costos-producto'] })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Costos de {producto?.nombre}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="costo_material">Costo de material</Label>
            <Input
              id="costo_material"
              type="number"
              step="0.01"
              aria-invalid={!!errors.costo_material}
              {...register('costo_material')}
            />
            {errors.costo_material && (
              <p className="text-sm text-destructive">{errors.costo_material.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="costo_impresion">Costo de impresión</Label>
            <Input
              id="costo_impresion"
              type="number"
              step="0.01"
              aria-invalid={!!errors.costo_impresion}
              {...register('costo_impresion')}
            />
            {errors.costo_impresion && (
              <p className="text-sm text-destructive">{errors.costo_impresion.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="costo_empaque">Costo de empaque</Label>
            <Input
              id="costo_empaque"
              type="number"
              step="0.01"
              aria-invalid={!!errors.costo_empaque}
              {...register('costo_empaque')}
            />
            {errors.costo_empaque && (
              <p className="text-sm text-destructive">{errors.costo_empaque.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="otros_costos">Otros costos</Label>
            <Input
              id="otros_costos"
              type="number"
              step="0.01"
              aria-invalid={!!errors.otros_costos}
              {...register('otros_costos')}
            />
            {errors.otros_costos && (
              <p className="text-sm text-destructive">{errors.otros_costos.message}</p>
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

interface FilaCosto {
  producto: Producto
  costo: CostoProducto | null
}

export function CostosPage() {
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null)
  const [formAbierto, setFormAbierto] = useState(false)

  const { data: productos = [], isLoading: cargandoProductos } = useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const resultado = await ProductoService.list()
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
  })

  const { data: costos = [], isLoading: cargandoCostos } = useQuery({
    queryKey: ['costos-producto'],
    queryFn: async () => {
      const resultado = await CostoService.listarTodos()
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
  })

  const costoPorProducto = new Map(costos.map((c) => [c.producto_id, c]))
  const filas: FilaCosto[] = productos.map((producto) => ({
    producto,
    costo: costoPorProducto.get(producto.id) ?? null,
  }))

  const columnas: DataTableColumn<FilaCosto>[] = [
    { header: 'Producto', accessor: ({ producto }) => producto.nombre, sortValue: ({ producto }) => producto.nombre.toLowerCase() },
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
    {
      header: 'Margen',
      accessor: ({ producto, costo }) => {
        if (!costo || producto.precio_base <= 0) return '—'
        const margen = ((producto.precio_base - costo.costo_total) / producto.precio_base) * 100
        return `${margen.toFixed(1)}%`
      },
      className: 'text-right',
    },
    {
      header: 'Acciones',
      className: 'text-right',
      accessor: ({ producto }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Editar costos de ${producto.nombre}`}
          onClick={() => {
            setProductoEditando(producto)
            setFormAbierto(true)
          }}
        >
          <Pencil className="size-4" aria-hidden="true" />
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Costos" description="Cálculo automático de costos." />

      {cargandoProductos || cargandoCostos ? (
        <p className="text-sm text-muted-foreground">Cargando costos...</p>
      ) : (
        <DataTable
          columns={columnas}
          data={filas}
          keyExtractor={({ producto }) => producto.id}
          emptyIcon={Calculator}
          emptyTitle="Todavía no hay productos"
          emptyDescription="Crea productos en el módulo de Productos para registrar sus costos."
        />
      )}

      <CostoFormDialog
        open={formAbierto}
        onOpenChange={setFormAbierto}
        producto={productoEditando}
        costoExistente={productoEditando ? (costoPorProducto.get(productoEditando.id) ?? null) : null}
      />
    </>
  )
}
