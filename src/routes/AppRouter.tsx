import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/layouts/AppShell'
import { RequireAuth } from '@/routes/RequireAuth'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PedidosPage } from '@/pages/PedidosPage'
import { PedidoDetallePage } from '@/pages/PedidoDetallePage'
import { ClientesPage } from '@/pages/ClientesPage'
import { ProductosPage } from '@/pages/ProductosPage'
import { FinanzasPage } from '@/pages/FinanzasPage'
import { PresupuestoPage } from '@/pages/PresupuestoPage'
import { InventarioPage } from '@/pages/InventarioPage'
import { CostosPage } from '@/pages/CostosPage'
import { ReportesPage } from '@/pages/ReportesPage'
import { ConfiguracionPage } from '@/pages/ConfiguracionPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function AppRouter() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}
