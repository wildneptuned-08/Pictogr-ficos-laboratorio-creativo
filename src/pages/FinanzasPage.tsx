import { Wallet } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/data/EmptyState'

export function FinanzasPage() {
  return (
    <>
      <PageHeader
        title="Finanzas"
        description="Administración de ingresos, gastos y bolsillos financieros."
      />
      <EmptyState
        icon={Wallet}
        title="Finanzas en construcción"
        description="Este módulo se implementará en la Etapa 9 del plan de desarrollo."
      />
    </>
  )
}
