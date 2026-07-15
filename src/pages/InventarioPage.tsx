import { Package } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/data/EmptyState'

export function InventarioPage() {
  return (
    <>
      <PageHeader title="Inventario" description="Control de insumos." />
      <EmptyState
        icon={Package}
        title="Inventario en construcción"
        description="Este módulo se implementará en la Etapa 7 del plan de desarrollo, una vez completado 46_ANALISIS_INVENTARIO.md."
      />
    </>
  )
}
