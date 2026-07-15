import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  filters?: ReactNode
}

export function PageHeader({
  title,
  description,
  actions,
  filters,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {filters && (
        <div className="flex flex-wrap items-center gap-2">{filters}</div>
      )}
    </div>
  )
}
