import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/layouts/AppShell'
import { RequireAuth } from '@/routes/RequireAuth'
import { RouteLoader } from '@/components/layout/RouteLoader'

const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const PedidosPage = lazy(() =>
  import('@/pages/PedidosPage').then((m) => ({ default: m.PedidosPage })),
)
const PedidoDetallePage = lazy(() =>
  import('@/pages/PedidoDetallePage').then((m) => ({ default: m.PedidoDetallePage })),
)
const ClientesPage = lazy(() =>
  import('@/pages/ClientesPage').then((m) => ({ default: m.ClientesPage })),
)
const ProductosPage = lazy(() =>
  import('@/pages/ProductosPage').then((m) => ({ default: m.ProductosPage })),
)
const FinanzasPage = lazy(() =>
  import('@/pages/FinanzasPage').then((m) => ({ default: m.FinanzasPage })),
)
const PresupuestoPage = lazy(() =>
  import('@/pages/PresupuestoPage').then((m) => ({ default: m.PresupuestoPage })),
)
const InventarioPage = lazy(() =>
  import('@/pages/InventarioPage').then((m) => ({ default: m.InventarioPage })),
)
const CostosPage = lazy(() =>
  import('@/pages/CostosPage').then((m) => ({ default: m.CostosPage })),
)
const ReportesPage = lazy(() =>
  import('@/pages/ReportesPage').then((m) => ({ default: m.ReportesPage })),
)
const ConfiguracionPage = lazy(() =>
  import('@/pages/ConfiguracionPage').then((m) => ({ default: m.ConfiguracionPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="pedidos" element={<PedidosPage />} />
              <Route path="pedidos/:id" element={<PedidoDetallePage />} />
              <Route path="clientes" element={<ClientesPage />} />
              <Route path="productos" element={<ProductosPage />} />
              <Route path="finanzas" element={<FinanzasPage />} />
              <Route path="presupuesto" element={<PresupuestoPage />} />
              <Route path="inventario" element={<InventarioPage />} />
              <Route path="costos" element={<CostosPage />} />
              <Route path="reportes" element={<ReportesPage />} />
              <Route path="configuracion" element={<ConfiguracionPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
