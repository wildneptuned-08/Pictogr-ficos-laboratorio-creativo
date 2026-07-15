import { ShoppingCart } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/data/EmptyState'

export function PedidosPage() {
  return (
    <>
      <PageHeader
        title="Pedidos"
        description="Gestión completa del ciclo de vida del pedido."
      />
      <EmptyState
        icon={ShoppingCart}
        title="Pedidos en construcción"
        description="Este módulo se implementará en la Etapa 6 del plan de desarrollo."
      />
    </>
  )
}
