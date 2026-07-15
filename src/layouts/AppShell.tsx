import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileSidebar } from '@/components/layout/MobileSidebar'
import { TopBar } from '@/components/layout/TopBar'

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((current) => !current)}
      />
      <MobileSidebar open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
