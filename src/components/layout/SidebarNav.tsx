import { NavLink } from 'react-router-dom'
import { LogOut, Palette } from 'lucide-react'
import { NAV_ITEMS } from '@/constants/navigation'
import { useSession } from '@/hooks/useSession'
import { supabase } from '@/config/supabaseClient'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface SidebarNavProps {
  collapsed?: boolean
  onNavigate?: () => void
}

export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const { user } = useSession()

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-14 items-center gap-2 px-4">
        <Palette className="size-6 shrink-0 text-primary" aria-hidden="true" />
        {!collapsed && (
          <span className="truncate font-semibold">PictoGráficos</span>
        )}
      </div>

      <TooltipProvider>
        <nav className="flex flex-1 flex-col gap-1 px-2">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
            const link = (
              <NavLink
                key={path}
                to={path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )
                }
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {!collapsed && <span className="truncate">{label}</span>}
              </NavLink>
            )

            if (!collapsed) return link

            return (
              <Tooltip key={path}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            )
          })}
        </nav>
      </TooltipProvider>

      <div className="border-t border-sidebar-border px-2 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-sidebar-accent"
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase() ?? '?'}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <span className="truncate text-sm text-sidebar-foreground">
                  {user?.email ?? 'Sin sesión'}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top">
            <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
              <LogOut className="size-4" aria-hidden="true" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
