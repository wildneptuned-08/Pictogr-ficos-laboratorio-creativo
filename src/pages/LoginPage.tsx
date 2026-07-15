import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/config/supabaseClient'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CursorTrail } from '@/components/layout/CursorTrail'
import logo from '@/assets/LogoPicto.jpeg'

const loginSchema = z.object({
  email: z.string().min(1, 'Ingresa tu correo.').email('Correo inválido.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LocationState {
  from?: { pathname: string }
}

export function LoginPage() {
  const { session, loading: sessionLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  if (!sessionLoading && session) {
    const state = location.state as LocationState | null
    return <Navigate to={state?.from?.pathname ?? '/dashboard'} replace />
  }

  async function onSubmit(values: LoginFormValues) {
    setAuthError(null)
    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) {
      setAuthError('Correo o contraseña incorrectos.')
      return
    }
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center bg-background p-4">
      <CursorTrail />
      <div className="glow-card relative w-full max-w-sm rounded-xl p-6">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <img src={logo} alt="PictoGráficos" className="size-16 rounded-full" />
          <h1 className="text-lg font-semibold">PictoGráficos</h1>
          <p className="text-sm text-muted-foreground">
            Inicia sesión para continuar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {authError && (
            <p role="alert" className="text-sm text-destructive">
              {authError}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
