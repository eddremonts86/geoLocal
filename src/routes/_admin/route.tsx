import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { AdminShell } from '@/modules/admin/ui/AdminShell'

const requireAdmin = createServerFn().handler(async () => {
  const { isAuthenticated } = await auth()
  if (!isAuthenticated) {
    throw redirect({ to: '/sign-in' })
  }
})

export const Route = createFileRoute('/_admin')({
  beforeLoad: async () => {
    await requireAdmin()
  },
  component: AdminLayoutWrapper,
})

function AdminLayoutWrapper() {
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  )
}
