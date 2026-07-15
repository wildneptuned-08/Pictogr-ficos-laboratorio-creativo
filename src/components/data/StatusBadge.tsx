import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { EstadoPedido } from '@/types/database'

// Colores funcionales de Docs/08_DESIGN_SYSTEM.md: éxito=verde,
// advertencia=amarillo, error=rojo, información=azul.
const ESTILOS_ESTADO: Record<EstadoPedido, string> = {
  Nuevo: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Diseño: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Producción: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Listo: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  Entregado: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  Cancelado: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
}

export function StatusBadge({ estado }: { estado: EstadoPedido }) {
  return (
    <Badge variant="outline" className={cn('border-transparent', ESTILOS_ESTADO[estado])}>
      {estado}
    </Badge>
  )
}
