import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/data/DataTable'
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
import { FinanzasService } from '@/services/FinanzasService'
import { formatCurrency } from '@/utils/formatCurrency'
import { rangoDelMesActual } from '@/utils/dateRanges'
import type { MovimientoFinanciero } from '@/types/database'

const movimientoSchema = z.object({
  bolsillo_id: z.string().min(1, 'El bolsillo es obligatorio.'),
  valor: z.coerce.number().positive('El valor debe ser mayor que cero.'),
  categoria: z.string().optional(),
  descripcion: z.string().optional(),
  fecha: z.string().optional(),
})

type MovimientoFormInput = z.input<typeof movimientoSchema>
type MovimientoFormValues = z.output<typeof movimientoSchema>

function MovimientoFormDialog({
  open,
  onOpenChange,
  tipo,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipo: 'Ingreso' | 'Gasto'
}) {
  const queryClient = useQueryClient()

  const { data: bolsillos = [] } = useQuery({
    queryKey: ['bolsillos-financieros'],
    queryFn: async () => {
      const resultado = await FinanzasService.consultarSaldos()
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MovimientoFormInput, unknown, MovimientoFormValues>({
    resolver: zodResolver(movimientoSchema),
  })

  async function onSubmit(values: MovimientoFormValues) {
    const resultado =
      tipo === 'Ingreso'
        ? await FinanzasService.registrarIngreso(values)
        : await FinanzasService.registrarGasto(values)

    if (!resultado.success) {
      toast.error(resultado.error?.message ?? 'No fue posible registrar el movimiento.')
      return
    }

    toast.success(tipo === 'Ingreso' ? 'Ingreso registrado.' : 'Gasto registrado.')
    queryClient.invalidateQueries({ queryKey: ['bolsillos-financieros'] })
    queryClient.invalidateQueries({ queryKey: ['movimientos-financieros'] })
    queryClient.invalidateQueries({ queryKey: ['utilidad-mes'] })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tipo === 'Ingreso' ? 'Registrar ingreso' : 'Registrar gasto'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bolsillo_id">Bolsillo</Label>
            <Select onValueChange={(value) => setValue('bolsillo_id', value, { shouldValidate: true })}>
              <SelectTrigger id="bolsillo_id" className="w-full">
                <SelectValue placeholder="Selecciona un bolsillo" />
              </SelectTrigger>
              <SelectContent>
                {bolsillos.map((bolsillo) => (
                  <SelectItem key={bolsillo.id} value={bolsillo.id}>
                    {bolsillo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bolsillo_id && (
              <p className="text-sm text-destructive">{errors.bolsillo_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="valor">Valor</Label>
            <Input id="valor" type="number" step="0.01" aria-invalid={!!errors.valor} {...register('valor')} />
            {errors.valor && <p className="text-sm text-destructive">{errors.valor.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="categoria">Categoría</Label>
            <Input id="categoria" {...register('categoria')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input id="descripcion" {...register('descripcion')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fecha">Fecha</Label>
            <Input id="fecha" type="date" {...register('fecha')} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function FinanzasPage() {
  const [ingresoAbierto, setIngresoAbierto] = useState(false)
  const [gastoAbierto, setGastoAbierto] = useState(false)
  const [filtroBolsillo, setFiltroBolsillo] = useState('todos')
  const [filtroDesde, setFiltroDesde] = useState('')
  const [filtroHasta, setFiltroHasta] = useState('')

  const { data: bolsillos = [] } = useQuery({
    queryKey: ['bolsillos-financieros'],
    queryFn: async () => {
      const resultado = await FinanzasService.consultarSaldos()
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
  })
  const nombreBolsillo = (id: string) => bolsillos.find((b) => b.id === id)?.nombre ?? '—'

  const { data: utilidadMes = 0 } = useQuery({
    queryKey: ['utilidad-mes'],
    queryFn: async () => {
      const { desde, hasta } = rangoDelMesActual()
      const resultado = await FinanzasService.obtenerUtilidad(desde, hasta)
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? 0
    },
  })

  const { data: movimientos = [], isLoading } = useQuery({
    queryKey: ['movimientos-financieros', filtroBolsillo, filtroDesde, filtroHasta],
    queryFn: async () => {
      const resultado = await FinanzasService.consultarMovimientos({
        bolsilloId: filtroBolsillo === 'todos' ? undefined : filtroBolsillo,
        desde: filtroDesde || undefined,
        hasta: filtroHasta || undefined,
      })
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
  })

  const { data: flujoCaja = [] } = useQuery({
    queryKey: ['flujo-caja'],
    queryFn: async () => {
      const hoy = new Date()
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1)
      const desde = `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, '0')}-01`
      const resultado = await FinanzasService.consultarMovimientos({ desde })
      if (!resultado.success) throw new Error(resultado.error?.message)

      const porMes = new Map<string, { ingresos: number; gastos: number }>()
      for (const mov of resultado.data ?? []) {
        const fecha = new Date(mov.fecha)
        const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
        const actual = porMes.get(clave) ?? { ingresos: 0, gastos: 0 }
        if (mov.tipo === 'Ingreso') actual.ingresos += mov.valor
        if (mov.tipo === 'Gasto') actual.gastos += mov.valor
        porMes.set(clave, actual)
      }

      return Array.from(porMes.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([mes, valores]) => ({ mes, ...valores, neto: valores.ingresos - valores.gastos }))
    },
  })

  const columnas: DataTableColumn<MovimientoFinanciero>[] = [
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

  return (
    <>
      <PageHeader
        title="Finanzas"
        description="Administración de ingresos, gastos y bolsillos financieros."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIngresoAbierto(true)}>
              <ArrowUpCircle className="size-4" aria-hidden="true" />
              Registrar Ingreso
            </Button>
            <Button variant="outline" onClick={() => setGastoAbierto(true)}>
              <ArrowDownCircle className="size-4" aria-hidden="true" />
              Registrar Gasto
            </Button>
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {bolsillos.map((bolsillo) => (
          <div key={bolsillo.id} className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">{bolsillo.nombre}</p>
            <p className="text-lg font-semibold">{formatCurrency(bolsillo.saldo_actual)}</p>
          </div>
        ))}
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Utilidad del mes</p>
          <p className="text-lg font-semibold">{formatCurrency(utilidadMes)}</p>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-border p-4">
        <h3 className="mb-3 font-medium">Flujo de caja (últimos 6 meses)</h3>
        <div className="flex flex-col gap-1 text-sm">
          <div className="grid grid-cols-4 gap-2 font-medium text-muted-foreground">
            <span>Mes</span>
            <span className="text-right">Ingresos</span>
            <span className="text-right">Gastos</span>
            <span className="text-right">Neto</span>
          </div>
          {flujoCaja.map((fila) => (
            <div key={fila.mes} className="grid grid-cols-4 gap-2">
              <span>{fila.mes}</span>
              <span className="text-right">{formatCurrency(fila.ingresos)}</span>
              <span className="text-right">{formatCurrency(fila.gastos)}</span>
              <span className="text-right">{formatCurrency(fila.neto)}</span>
            </div>
          ))}
          {flujoCaja.length === 0 && (
            <p className="text-muted-foreground">Sin movimientos en los últimos 6 meses.</p>
          )}
        </div>
      </div>

      <PageHeader
        title="Movimientos"
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filtroBolsillo} onValueChange={setFiltroBolsillo}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los bolsillos</SelectItem>
                {bolsillos.map((bolsillo) => (
                  <SelectItem key={bolsillo.id} value={bolsillo.id}>
                    {bolsillo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="w-40"
              value={filtroDesde}
              onChange={(e) => setFiltroDesde(e.target.value)}
            />
            <Input
              type="date"
              className="w-40"
              value={filtroHasta}
              onChange={(e) => setFiltroHasta(e.target.value)}
            />
          </div>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando movimientos...</p>
      ) : (
        <DataTable
          columns={columnas}
          data={movimientos}
          keyExtractor={(m) => m.id}
          emptyIcon={Wallet}
          emptyTitle="Todavía no hay movimientos"
          emptyDescription="Registra un ingreso o un gasto con los botones de arriba."
        />
      )}

      <MovimientoFormDialog open={ingresoAbierto} onOpenChange={setIngresoAbierto} tipo="Ingreso" />
      <MovimientoFormDialog open={gastoAbierto} onOpenChange={setGastoAbierto} tipo="Gasto" />
    </>
  )
}
