import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Shapes,
  Wallet,
  Target,
  Package,
  Calculator,
  FileBarChart,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

// Orden oficial: Docs/27_NAVEGACION.md
export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Pedidos', path: '/pedidos', icon: ShoppingCart },
  { label: 'Clientes', path: '/clientes', icon: Users },
  { label: 'Productos', path: '/productos', icon: Shapes },
  { label: 'Finanzas', path: '/finanzas', icon: Wallet },
  { label: 'Presupuesto', path: '/presupuesto', icon: Target },
  { label: 'Inventario', path: '/inventario', icon: Package },
  { label: 'Costos', path: '/costos', icon: Calculator },
  { label: 'Reportes', path: '/reportes', icon: FileBarChart },
  { label: 'Configuración', path: '/configuracion', icon: Settings },
]
