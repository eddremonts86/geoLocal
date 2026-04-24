import { Link, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, List, Globe, HelpCircle, LogOut, ArrowLeft } from 'lucide-react'
import { UserButton } from '@clerk/tanstack-react-start'
import { cn } from '@/shared/lib/utils'

const navItems = [
  { key: 'dashboard', to: '/admin' as const, icon: LayoutDashboard },
  { key: 'listings', to: '/admin/listings' as const, icon: List },
  { key: 'scraping', to: '/admin/scraping' as const, icon: Globe },
] as const

export function AdminSidebar() {
  const { t } = useTranslation()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-surface-solid">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">G</span>
          </div>
          <span className="text-lg font-semibold text-foreground">GeoLocal</span>
        </div>
        <Link
          to="/"
          className="flex items-center gap-1 text-xs text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Sitio
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.to === '/admin'
              ? currentPath === '/admin' || currentPath === '/admin/'
              : currentPath.startsWith(item.to)

          return (
            <Link
              key={item.key}
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-accent text-primary-foreground'
                  : 'text-muted hover:bg-accent-soft hover:text-foreground',
              )}
            >
              <item.icon className="h-5 w-5" />
              {t(`admin.${item.key}`)}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-1 border-t border-border p-4">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-accent-soft hover:text-foreground"
        >
          <HelpCircle className="h-5 w-5" />
          {t('admin.help')}
        </button>
        <div className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5">
          <LogOut className="h-5 w-5 text-muted" />
          <UserButton />
        </div>
      </div>
    </aside>
  )
}
