import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  icon: LucideIcon
  title: string
  value: string
  description?: string
  tone?: 'default' | 'success' | 'warning' | 'critical'
}

const TONOS: Record<NonNullable<KpiCardProps['tone']>, string> = {
  default: '',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  critical: 'text-red-600 dark:text-red-400',
}

export function KpiCard({ icon: Icon, title, value, description, tone = 'default' }: KpiCardProps) {
  return (
    <Card className="p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" aria-hidden="true" />
        {title}
      </div>
      <p className={cn('text-lg font-semibold', TONOS[tone])}>{value}</p>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </Card>
  )
}
