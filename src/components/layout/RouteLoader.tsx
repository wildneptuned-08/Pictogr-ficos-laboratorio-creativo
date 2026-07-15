import { Loader2 } from 'lucide-react'

export function RouteLoader() {
  return (
    <div className="flex h-svh w-full items-center justify-center bg-background" role="status">
      <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
      <span className="sr-only">Cargando...</span>
    </div>
  )
}
