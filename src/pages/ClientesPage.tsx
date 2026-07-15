import { Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/data/EmptyState'

export function ClientesPage() {
  return (
    <>
      <PageHeader title="Clientes" description="Administración de clientes." />
      <EmptyState
        icon={Users}
        title="Clientes en construcción"
        description="Este módulo se implementará en la Etapa 5 del plan de desarrollo."
      />
    </>
  )
}
