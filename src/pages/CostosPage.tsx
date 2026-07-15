import { Calculator } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/data/EmptyState'

export function CostosPage() {
  return (
    <>
      <PageHeader
        title="Costos"
        description="Cálculo automático de costos."
      />
      <EmptyState
        icon={Calculator}
        title="Costos en construcción"
        description="Este módulo se implementará en la Etapa 8 del plan de desarrollo."
      />
    </>
  )
}
