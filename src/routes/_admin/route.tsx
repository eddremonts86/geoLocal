import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { AdminShell } from '@/modules/admin/ui/AdminShell'

const requireAdmin = createServerFn().handler(async () => {
  const { auth } = await import('@/shared/lib/auth/better-auth')
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })
  if (!session) {
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
