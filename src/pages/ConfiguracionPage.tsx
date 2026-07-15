import { Settings } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/data/EmptyState'

export function ConfiguracionPage() {
  return (
    <>
      <PageHeader
        title="Configuración"
        description="Ajustes generales del sistema."
      />
      <EmptyState
        icon={Settings}
        title="Configuración en construcción"
        description="Este módulo se implementará en la Etapa 5 del plan de desarrollo."
      />
    </>
  )
}
