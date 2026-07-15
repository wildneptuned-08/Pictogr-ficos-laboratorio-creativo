import { FileBarChart } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/data/EmptyState'

export function ReportesPage() {
  return (
    <>
      <PageHeader title="Reportes" description="Generación de informes." />
      <EmptyState
        icon={FileBarChart}
        title="Reportes en construcción"
        description="Este módulo se implementará en la Etapa 11 del plan de desarrollo."
      />
    </>
  )
}
