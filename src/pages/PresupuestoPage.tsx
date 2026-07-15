import { Target } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/data/EmptyState'

export function PresupuestoPage() {
  return (
    <>
      <PageHeader title="Presupuesto" description="Seguimiento de metas." />
      <EmptyState
        icon={Target}
        title="Presupuesto en construcción"
        description="Este módulo se implementará más adelante en el plan de desarrollo."
      />
    </>
  )
}
