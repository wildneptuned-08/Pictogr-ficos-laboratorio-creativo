import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { SidebarNav } from '@/components/layout/SidebarNav'

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
        <SidebarNav onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  )
}
