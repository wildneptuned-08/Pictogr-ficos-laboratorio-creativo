import { useLocation } from 'react-router-dom'
import { Menu, Search, Bell, Sun, Moon } from 'lucide-react'
import { NAV_ITEMS } from '@/constants/navigation'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TopBarProps {
  onOpenMobileNav: () => void
}

export function TopBar({ onOpenMobileNav }: TopBarProps) {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const currentItem = NAV_ITEMS.find((item) =>
    location.pathname.startsWith(item.path),
  )

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Abrir menú"
      >
        <Menu className="size-5" aria-hidden="true" />
      </Button>

      <h1 className="truncate text-base font-semibold">
        {currentItem?.label ?? 'PictoGráficos'}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Buscar..."
            aria-label="Buscar"
            className="w-56 pl-8"
          />
        </div>

        <Button variant="ghost" size="icon" aria-label="Notificaciones">
          <Bell className="size-4" aria-hidden="true" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          {theme === 'dark' ? (
            <Sun className="size-4" aria-hidden="true" />
          ) : (
            <Moon className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    </header>
  )
}
