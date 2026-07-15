import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import logo from '@/assets/LogoPicto.jpeg'
import { NAV_ITEMS } from '@/constants/navigation'
import { useAuth } from '@/hooks/useAuth'
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
  const { session } = useAuth()
  const user = session?.user

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-14 items-center gap-2 px-4">
        <img
          src={logo}
          alt={collapsed ? 'PictoGráficos' : ''}
          className="size-8 shrink-0 rounded-full"
        />
        {!collapsed && (
          <span className="truncate font-heading font-semibold">
            PictoGráficos
          </span>
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
                    'group flex items-center gap-3 rounded-r-md border-l-2 py-2 pr-3 pl-2.5 text-sm font-medium transition-colors duration-300',
                    isActive
                      ? 'border-primary bg-gradient-to-r from-primary/15 via-primary/5 to-transparent text-sidebar-accent-foreground'
                      : 'border-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'size-4 shrink-0 transition-colors duration-300',
                        isActive ? 'text-primary' : 'group-hover:text-primary',
                      )}
                      aria-hidden="true"
                    />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </>
                )}
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
