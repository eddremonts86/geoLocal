import { createFileRoute, Outlet, redirect, Link, useRouterState } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { Header } from '@/components/ui/header'

const requireAuth = createServerFn().handler(async () => {
  const { auth } = await import('@/shared/lib/auth/better-auth')
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })
  if (!session) throw redirect({ to: '/sign-in' })
})

export const Route = createFileRoute('/_account')({
  beforeLoad: async () => {
    await requireAuth()
  },
  component: AccountLayout,
})

type NavItem = { to: string; label: string; exact?: boolean }
const NAV: ReadonlyArray<NavItem> = [
  { to: '/account', label: 'Overview', exact: true },
  { to: '/account/listings', label: 'My listings' },
  { to: '/account/messages', label: 'Messages' },
  { to: '/account/payments', label: 'Payments' },
  { to: '/account/profile', label: 'Profile' },
]

function AccountLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-12 gap-8">
            <aside className="col-span-12 md:col-span-3">
              <nav className="sticky top-0 space-y-1">
                <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Account
                </h2>
                {NAV.map((item) => {
                  const active = item.exact ? pathname === item.to : pathname.startsWith(item.to)
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`block rounded-md px-3 py-2 text-sm transition ${
                        active
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                          : 'text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </aside>
            <main className="col-span-12 md:col-span-9">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
