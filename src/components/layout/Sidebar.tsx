import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { SidebarNav } from '@/components/layout/SidebarNav'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapsed: () => void
}

export function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
  return (
    <aside
      className={cn(
        'hidden shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex lg:flex-col',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex-1 overflow-hidden">
        <SidebarNav collapsed={collapsed} />
      </div>
      <div className="flex justify-end border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    </aside>
  )
}
