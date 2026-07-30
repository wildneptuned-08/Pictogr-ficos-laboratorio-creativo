import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Package, Plus, Pencil, PackageX, Search, Tag } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/data/DataTable'
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
import { ProductoService } from '@/services/ProductoService'
import { CategoriaProductoService } from '@/services/CategoriaProductoService'
import { ProveedorService } from '@/services/ProveedorService'
import { InventarioService, insumosUnicosPorIdentidad } from '@/services/InventarioService'
import { formatCurrency } from '@/utils/formatCurrency'
import type { Producto } from '@/types/database'

// Radix Select no admite un item con value="", así que se usa un centinela
// para representar "sin proveedor" / "sin insumo vinculado".
const SIN_PROVEEDOR = '__sin_proveedor__'
const SIN_INSUMO = '__sin_insumo__'

const productoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  categoria_id: z.string().min(1, 'La categoría es obligatoria.'),
  precio_base: z.coerce.number().positive('El precio base debe ser mayor que cero.'),
  descripcion: z.string().optional(),
  proveedor_id: z.string().optional(),
  insumo_id: z.string().optional(),
})

type ProductoFormInput = z.input<typeof productoSchema>
type ProductoFormValues = z.output<typeof productoSchema>

function CategoriasDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [nombre, setNombre] = useState('')

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias-producto'],
    queryFn: async () => {
      const resultado = await CategoriaProductoService.list()
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
  })

  const crearMutation = useMutation({
    mutationFn: () => CategoriaProductoService.create({ nombre }),
    onSuccess: (resultado) => {
      if (!resultado.success) {
        toast.error(resultado.error?.message ?? 'No fue posible crear la categoría.')
        return
      }
      setNombre('')
      queryClient.invalidateQueries({ queryKey: ['categorias-producto'] })
    },
  })

  const desactivarMutation = useMutation({
    mutationFn: (id: string) => CategoriaProductoService.desactivar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categorias-producto'] }),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Categorías de producto</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <ul className="flex flex-col gap-1">
            {categorias.map((categoria) => (
              <li
                key={categoria.id}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted"
              >
                {categoria.nombre}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => desactivarMutation.mutate(categoria.id)}
                >
                  Quitar
                </Button>
              </li>
            ))}
            {categorias.length === 0 && (
              <li className="text-sm text-muted-foreground">Todavía no hay categorías.</li>
            )}
          </ul>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (nombre.trim()) crearMutation.mutate()
            }}
          >
            <Input
              placeholder="Nueva categoría..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <Button type="submit" disabled={crearMutation.isPending}>
              Agregar
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ProductoFormDialog({
  open,
  onOpenChange,
  producto,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto: Producto | null
}) {
  const queryClient = useQueryClient()
  const esEdicion = !!producto

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias-producto'],
    queryFn: async () => {
      const resultado = await CategoriaProductoService.list()
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

  const { data: insumos = [] } = useQuery({
    queryKey: ['inventario'],
    queryFn: async () => {
      const resultado = await InventarioService.listarInsumos()
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
  })
  const opcionesInsumo = insumosUnicosPorIdentidad(insumos)

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductoFormInput, unknown, ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    values: producto
      ? {
          nombre: producto.nombre,
          categoria_id: producto.categoria_id,
          precio_base: producto.precio_base,
          descripcion: producto.descripcion ?? '',
          proveedor_id: producto.proveedor_id ?? SIN_PROVEEDOR,
          insumo_id: producto.insumo_id ?? SIN_INSUMO,
        }
      : undefined,
  })
  const categoriaId = useWatch({ control, name: 'categoria_id' })
  const proveedorId = useWatch({ control, name: 'proveedor_id' })
  const insumoId = useWatch({ control, name: 'insumo_id' })

  async function onSubmit(values: ProductoFormValues) {
    const payload = {
      ...values,
      proveedor_id:
        !values.proveedor_id || values.proveedor_id === SIN_PROVEEDOR
          ? null
          : values.proveedor_id,
      insumo_id:
        !values.insumo_id || values.insumo_id === SIN_INSUMO ? null : values.insumo_id,
    }
    const resultado = esEdicion
      ? await ProductoService.update(producto!.id, payload)
      : await ProductoService.create(payload)

    if (!resultado.success) {
      toast.error(resultado.error?.message ?? 'No fue posible guardar el producto.')
      return
    }

    toast.success(esEdicion ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.')
    queryClient.invalidateQueries({ queryKey: ['productos'] })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" aria-invalid={!!errors.nombre} {...register('nombre')} />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="categoria_id">Categoría</Label>
            <Select
              value={categoriaId}
              onValueChange={(value) => setValue('categoria_id', value, { shouldValidate: true })}
            >
              <SelectTrigger id="categoria_id" className="w-full">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoria_id && (
              <p className="text-sm text-destructive">{errors.categoria_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="proveedor_id">Proveedor</Label>
            <Select
              value={proveedorId ?? SIN_PROVEEDOR}
              onValueChange={(value) => setValue('proveedor_id', value)}
            >
              <SelectTrigger id="proveedor_id" className="w-full">
                <SelectValue placeholder="Sin proveedor" />
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
            {esEdicion && (
              <p className="text-xs text-muted-foreground">
                El código ya asignado no cambia al editar el proveedor.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="insumo_id">Insumo en Inventario</Label>
            <Select
              value={insumoId ?? SIN_INSUMO}
              onValueChange={(value) => setValue('insumo_id', value)}
            >
              <SelectTrigger id="insumo_id" className="w-full">
                <SelectValue placeholder="Sin insumo vinculado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SIN_INSUMO}>Sin insumo vinculado</SelectItem>
                {opcionesInsumo.map((insumo) => (
                  <SelectItem key={insumo.id} value={insumo.id}>
                    {insumo.categoria ? `${insumo.categoria} — ` : ''}
                    {insumo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Al marcar un pedido con este producto como &quot;Producción&quot;, se descuenta de
              este insumo la misma cantidad pedida (del lote más antiguo al más reciente).
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="precio_base">Precio base</Label>
            <Input
              id="precio_base"
              type="number"
              step="0.01"
              aria-invalid={!!errors.precio_base}
              {...register('precio_base')}
            />
            {errors.precio_base && (
              <p className="text-sm text-destructive">{errors.precio_base.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" {...register('descripcion')} />
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

export function ProductosPage() {
  const queryClient = useQueryClient()
  const [busqueda, setBusqueda] = useState('')
  const [formAbierto, setFormAbierto] = useState(false)
  const [categoriasAbierto, setCategoriasAbierto] = useState(false)
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null)
  const [productoADesactivar, setProductoADesactivar] = useState<Producto | null>(null)

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['productos', busqueda],
    queryFn: async () => {
      const resultado = busqueda
        ? await ProductoService.search(busqueda)
        : await ProductoService.list()
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
  })

  const desactivarMutation = useMutation({
    mutationFn: (id: string) => ProductoService.desactivar(id),
    onSuccess: (resultado) => {
      if (!resultado.success) {
        toast.error(resultado.error?.message ?? 'No fue posible desactivar el producto.')
        return
      }
      toast.success('Producto desactivado.')
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })

  const columnas: DataTableColumn<Producto>[] = [
    {
      header: 'Nombre',
      accessor: (p) => (
        <div className="flex items-center gap-2">
          <span>{p.nombre}</span>
          {p.codigo && (
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              {p.codigo}
            </span>
          )}
        </div>
      ),
      sortValue: (p) => p.nombre.toLowerCase(),
    },
    {
      header: 'Precio base',
      accessor: (p) => formatCurrency(p.precio_base),
      sortValue: (p) => p.precio_base,
      className: 'text-right',
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
              setProductoEditando(p)
              setFormAbierto(true)
            }}
          >
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Desactivar ${p.nombre}`}
            onClick={() => setProductoADesactivar(p)}
          >
            <PackageX className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Productos"
        description="Catálogo de productos y servicios."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCategoriasAbierto(true)}>
              <Tag className="size-4" aria-hidden="true" />
              Categorías
            </Button>
            <Button
              onClick={() => {
                setProductoEditando(null)
                setFormAbierto(true)
              }}
            >
              <Plus className="size-4" aria-hidden="true" />
              Nuevo Producto
            </Button>
          </div>
        }
        filters={
          <div className="relative w-full max-w-xs">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              placeholder="Buscar producto..."
              className="pl-8"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando productos...</p>
      ) : (
        <DataTable
          columns={columnas}
          data={productos}
          keyExtractor={(p) => p.id}
          emptyIcon={Package}
          emptyTitle="Todavía no hay productos"
          emptyDescription="Registra el primero con el botón 'Nuevo Producto'."
        />
      )}

      <ProductoFormDialog
        open={formAbierto}
        onOpenChange={setFormAbierto}
        producto={productoEditando}
      />

      <CategoriasDialog open={categoriasAbierto} onOpenChange={setCategoriasAbierto} />

      <ConfirmDialog
        open={!!productoADesactivar}
        onOpenChange={(open) => !open && setProductoADesactivar(null)}
        title="¿Desactivar este producto?"
        description={`${productoADesactivar?.nombre ?? ''} dejará de aparecer en el catálogo.`}
        confirmLabel="Desactivar"
        destructive
        onConfirm={async () => {
          if (productoADesactivar) await desactivarMutation.mutateAsync(productoADesactivar.id)
        }}
      />
    </>
  )
}
