import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfiguracionService } from '@/services/ConfiguracionService'
import { FinanzasService } from '@/services/FinanzasService'

const empresaSchema = z.object({
  nombre_empresa: z.string().optional(),
  correo_contacto: z.string().email('Correo inválido.').optional().or(z.literal('')),
  telefono_contacto: z.string().optional(),
})

type EmpresaFormValues = z.infer<typeof empresaSchema>

const preferenciasSchema = z.object({
  dias_habiles_mes: z.coerce.number().int().positive('Debe ser mayor que cero.'),
})

type PreferenciasFormInput = z.input<typeof preferenciasSchema>
type PreferenciasFormValues = z.output<typeof preferenciasSchema>

function SeccionEmpresa() {
  const queryClient = useQueryClient()
  const { data: configuracion } = useQuery({
    queryKey: ['configuracion'],
    queryFn: async () => {
      const resultado = await ConfiguracionService.obtenerConfiguracion()
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmpresaFormValues>({ resolver: zodResolver(empresaSchema) })

  useEffect(() => {
    if (configuracion) {
      reset({
        nombre_empresa: configuracion.nombre_empresa ?? '',
        correo_contacto: configuracion.correo_contacto ?? '',
        telefono_contacto: configuracion.telefono_contacto ?? '',
      })
    }
  }, [configuracion, reset])

  async function onSubmit(values: EmpresaFormValues) {
    const resultado = await ConfiguracionService.actualizarEmpresa({
      ...values,
      correo_contacto: values.correo_contacto || undefined,
    })
    if (!resultado.success) {
      toast.error(resultado.error?.message ?? 'No fue posible guardar los datos de la empresa.')
      return
    }
    toast.success('Datos de la empresa actualizados.')
    queryClient.invalidateQueries({ queryKey: ['configuracion'] })
  }

  return (
    <Card className="p-4">
      <h3 className="mb-3 font-medium">Datos de la empresa</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nombre_empresa">Nombre de la empresa</Label>
          <Input id="nombre_empresa" {...register('nombre_empresa')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="correo_contacto">Correo de contacto</Label>
          <Input id="correo_contacto" type="email" aria-invalid={!!errors.correo_contacto} {...register('correo_contacto')} />
          {errors.correo_contacto && (
            <p className="text-sm text-destructive">{errors.correo_contacto.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="telefono_contacto">Teléfono de contacto</Label>
          <Input id="telefono_contacto" {...register('telefono_contacto')} />
        </div>
        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </form>
    </Card>
  )
}

function SeccionPreferencias() {
  const queryClient = useQueryClient()
  const { data: configuracion } = useQuery({
    queryKey: ['configuracion'],
    queryFn: async () => {
      const resultado = await ConfiguracionService.obtenerConfiguracion()
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PreferenciasFormInput, unknown, PreferenciasFormValues>({
    resolver: zodResolver(preferenciasSchema),
  })

  useEffect(() => {
    if (configuracion?.dias_habiles_mes) {
      reset({ dias_habiles_mes: configuracion.dias_habiles_mes })
    }
  }, [configuracion, reset])

  async function onSubmit(values: PreferenciasFormValues) {
    const resultado = await ConfiguracionService.actualizarPreferencias(values)
    if (!resultado.success) {
      toast.error(resultado.error?.message ?? 'No fue posible guardar las preferencias.')
      return
    }
    toast.success('Preferencias actualizadas.')
    queryClient.invalidateQueries({ queryKey: ['configuracion'] })
  }

  return (
    <Card className="p-4">
      <h3 className="mb-1 font-medium">Preferencias</h3>
      <p className="mb-3 text-sm text-muted-foreground">
        Los días hábiles del mes se usan para calcular la meta diaria del Presupuesto.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dias_habiles_mes">Días hábiles del mes</Label>
          <Input
            id="dias_habiles_mes"
            type="number"
            className="max-w-32"
            aria-invalid={!!errors.dias_habiles_mes}
            {...register('dias_habiles_mes')}
          />
          {errors.dias_habiles_mes && (
            <p className="text-sm text-destructive">{errors.dias_habiles_mes.message}</p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </form>
    </Card>
  )
}

function SeccionBolsillos() {
  const queryClient = useQueryClient()
  const { data: bolsillos = [] } = useQuery({
    queryKey: ['bolsillos-financieros'],
    queryFn: async () => {
      const resultado = await FinanzasService.consultarSaldos()
      if (!resultado.success) throw new Error(resultado.error?.message)
      return resultado.data ?? []
    },
  })

  // Solo guarda las ediciones del usuario; el valor mostrado parte del
  // porcentaje ya guardado hasta que el usuario lo cambie (evita derivar
  // estado de props dentro de un efecto).
  const [overrides, setOverrides] = useState<Record<string, number>>({})

  function valorDe(bolsilloId: string, porcentajeGuardado: number) {
    return overrides[bolsilloId] ?? porcentajeGuardado
  }

  const suma = bolsillos.reduce((total, b) => total + valorDe(b.id, b.porcentaje), 0)
  const sumaValida = Math.round(suma * 100) / 100 === 100

  const mutation = useMutation({
    mutationFn: () =>
      ConfiguracionService.actualizarPorcentajes(
        bolsillos.map((b) => ({ bolsilloId: b.id, porcentaje: valorDe(b.id, b.porcentaje) })),
      ),
    onSuccess: (resultado) => {
      if (!resultado.success) {
        toast.error(resultado.error?.message ?? 'No fue posible actualizar los porcentajes.')
        return
      }
      toast.success('Porcentajes de bolsillos actualizados.')
      queryClient.invalidateQueries({ queryKey: ['bolsillos-financieros'] })
    },
  })

  return (
    <Card className="p-4">
      <h3 className="mb-1 font-medium">Porcentajes de bolsillos financieros</h3>
      <p className="mb-3 text-sm text-muted-foreground">
        Cada venta se distribuye automáticamente entre estos bolsillos según su porcentaje.
      </p>

      <div className="flex flex-col gap-2">
        {bolsillos.map((bolsillo) => (
          <div key={bolsillo.id} className="flex items-center gap-3">
            <Label htmlFor={`porcentaje-${bolsillo.id}`} className="w-40 shrink-0">
              {bolsillo.nombre}
            </Label>
            <Input
              id={`porcentaje-${bolsillo.id}`}
              type="number"
              step="0.01"
              className="max-w-28"
              value={valorDe(bolsillo.id, bolsillo.porcentaje)}
              onChange={(e) =>
                setOverrides((actual) => ({ ...actual, [bolsillo.id]: Number(e.target.value) }))
              }
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        ))}
      </div>

      <p className={`mt-3 text-sm ${sumaValida ? 'text-muted-foreground' : 'text-destructive'}`}>
        Suma actual: {suma.toFixed(2)}% {!sumaValida && '(debe sumar 100%)'}
      </p>

      <Button
        className="mt-2"
        disabled={!sumaValida || mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? 'Guardando...' : 'Guardar porcentajes'}
      </Button>
    </Card>
  )
}

export function ConfiguracionPage() {
  return (
    <>
      <PageHeader title="Configuración" description="Ajustes generales del sistema." />
      <div className="flex flex-col gap-4">
        <SeccionEmpresa />
        <SeccionPreferencias />
        <SeccionBolsillos />
      </div>
    </>
  )
}
