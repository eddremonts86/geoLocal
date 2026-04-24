import type { ReactNode } from 'react'
import { AdminSidebar } from '@/components/ui/admin-sidebar'

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  )
}
