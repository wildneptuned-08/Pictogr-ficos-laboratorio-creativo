import { LayoutDashboard } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/data/EmptyState'

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Indicadores generales del negocio."
      />
      <EmptyState
        icon={LayoutDashboard}
        title="Dashboard en construcción"
        description="Este módulo se implementará en la Etapa 10 del plan de desarrollo."
      />
    </>
  )
}
