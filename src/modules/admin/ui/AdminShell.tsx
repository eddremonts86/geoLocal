import { useState, useEffect, type ReactNode } from 'react'
import { Link, useRouterState, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { UserButton } from '@clerk/tanstack-react-start'
import {
  LayoutDashboard,
  List as ListIcon,
  Inbox,
  Globe,
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Command as CommandIcon,
  Home,
  Car,
  Wrench,
  Sparkles,
  Flag,
  Users as UsersIcon,
} from 'lucide-react'
import { getAdminBadgesFn } from '@/modules/admin/api/admin-stats.fn'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LanguageSwitcher } from '@/modules/shared/ui/LanguageSwitcher'
import { ThemeToggle } from '@/modules/shared/ui/ThemeToggle'
import { cn } from '@/shared/lib/utils'

interface NavItem {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  exact?: boolean
  badgeKey?: 'drafts' | 'pendingReview' | 'pendingSources'
}

interface NavSection {
  label: string
  number: string
  items: Array<NavItem>
}

const NAV_SECTIONS: Array<NavSection> = [
  {
    label: 'Overview',
    number: '01',
    items: [
      { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Catalog',
    number: '02',
    items: [
      { label: 'Listings', to: '/admin/listings', icon: ListIcon, badgeKey: 'drafts' },
    ],
  },
  {
    label: 'Pipeline',
    number: '03',
    items: [
      { label: 'Review queue', to: '/admin/scraping', icon: Inbox, badgeKey: 'pendingReview' },
      { label: 'Source candidates', to: '/admin/scraping/sources', icon: Globe, badgeKey: 'pendingSources' },
    ],
  },
  {
    label: 'Moderation',
    number: '04',
    items: [
      { label: 'Reports', to: '/admin/reports', icon: Flag },
      { label: 'Users', to: '/admin/users', icon: UsersIcon },
    ],
  },
]

/**
 * Build crumbs from the current pathname. Editorial, not cute.
 * Produces e.g. ["ADMIN", "CATALOG", "LISTINGS"] for /admin/listings.
 */
function useBreadcrumbs(): Array<{ label: string; to?: string }> {
  const { location } = useRouterState()
  const path = location.pathname.replace(/^\/+|\/+$/g, '')
  const parts = path.split('/').filter(Boolean)
  // Override with section-aware labels
  const SECTION_ALIAS: Record<string, string> = {
    admin: 'Admin',
    listings: 'Catalog · Listings',
    scraping: 'Pipeline · Queue',
    sources: 'Pipeline · Sources',
    new: 'New',
  }
  const crumbs: Array<{ label: string; to?: string }> = []
  let acc = ''
  for (const part of parts) {
    acc += `/${part}`
    const looksLikeId = /^[0-9a-f-]{20,}$/.test(part) || part.length > 24
    crumbs.push({
      label: looksLikeId ? 'Detail' : SECTION_ALIAS[part] ?? part,
      to: acc,
    })
  }
  return crumbs
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { data: badges } = useQuery({
    queryKey: ['admin', 'badges'],
    queryFn: () => getAdminBadgesFn(),
    refetchInterval: 60_000,
  })

  // ⌘K shortcut to toggle palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="flex h-screen bg-(--surface-1) text-foreground">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} badges={badges} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar onOpenPalette={() => setPaletteOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto max-w-[1600px] px-8 py-10">{children}</div>
        </main>
      </div>
      {paletteOpen && <AdminCommandPalette onClose={() => setPaletteOpen(false)} />}
    </div>
  )
}

/* ─── Sidebar ───────────────────────────────────────────────────────────── */

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  badges?: { drafts: number; pendingReview: number; pendingSources: number }
}

function AdminSidebar({ collapsed, onToggle, badges }: SidebarProps) {
  const { location } = useRouterState()
  const path = location.pathname

  const isActive = (item: NavItem): boolean => {
    if (item.exact) return path === item.to || path === `${item.to}/`
    return path.startsWith(item.to)
  }

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-(--line-1) bg-(--surface-2) transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Masthead */}
      <div className="flex h-16 items-center justify-between border-b border-(--line-1) px-[15px]">
        {!collapsed && (
          <Link to="/admin" className="flex items-baseline gap-1.5 leading-none">
            <span className="font-display text-lg font-medium tracking-[-0.01em] text-foreground">
              GeoLocal
            </span>
            <span className="meta-label" style={{ color: 'var(--ink-3)' }}>
              admin
            </span>
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="flex h-7 w-7 items-center justify-center rounded-none text-(--ink-3) hover:bg-(--surface-3) hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-5 px-[15px] last:mb-0">
            {!collapsed && (
              <div className="mb-1.5 flex items-center gap-2 px-2">
                <span className="meta-label" style={{ color: 'var(--ink-4)' }}>
                  {section.number}
                </span>
                <span className="meta-label" style={{ color: 'var(--ink-3)' }}>
                  {section.label}
                </span>
              </div>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item)
                const count = item.badgeKey ? badges?.[item.badgeKey] ?? 0 : 0
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        'group flex h-9 items-center gap-3 px-2 text-sm transition-colors',
                        active
                          ? 'bg-(--surface-3) text-foreground'
                          : 'text-(--ink-2) hover:bg-(--surface-3)/60 hover:text-foreground',
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {count > 0 && (
                            <span
                              className={cn(
                                'flex h-5 min-w-5 items-center justify-center px-1.5 text-[10px] font-medium tabular-nums',
                                active ? 'bg-(--amber) text-(--amber-ink)' : 'bg-(--surface-3) text-(--ink-2)',
                              )}
                            >
                              {count > 99 ? '99+' : count}
                            </span>
                          )}
                        </>
                      )}
                      {collapsed && count > 0 && (
                        <span className="absolute ml-6 h-1.5 w-1.5 rounded-full bg-(--amber-ink)" aria-hidden />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-(--line-1) px-[15px] py-3">
        <Link
          to="/"
          className={cn(
            'mb-2 flex h-8 items-center gap-2 px-2 text-xs transition-colors',
            'text-(--ink-3) hover:text-foreground',
          )}
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          {!collapsed && <span className="meta-label">Back to site</span>}
        </Link>
        <div className="flex items-center gap-2 px-1">
          <UserButton
            appearance={{ elements: { avatarBox: 'w-7 h-7' } }}
          />
          {!collapsed && (
            <div className="flex-1 text-xs leading-tight">
              <div className="meta-label" style={{ color: 'var(--ink-3)' }}>
                Signed in
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

/* ─── Topbar ───────────────────────────────────────────────────────────── */

function AdminTopbar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const crumbs = useBreadcrumbs()

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-(--line-1) bg-background/95 px-[15px] backdrop-blur-sm">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex items-center gap-2 truncate">
          {crumbs.map((c, i) => (
            <li key={`${c.to}-${i}`} className="flex items-center gap-2">
              {i > 0 && (
                <span className="text-(--ink-4)" aria-hidden>
                  ·
                </span>
              )}
              {c.to && i < crumbs.length - 1 ? (
                <Link to={c.to} className="meta-label text-(--ink-3) hover:text-foreground">
                  {c.label}
                </Link>
              ) : (
                <span className="meta-label text-foreground">{c.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onOpenPalette}
          className="flex h-9 items-center gap-2 border border-(--line-1) bg-(--surface-2) px-3 text-xs text-(--ink-2) transition-colors hover:bg-(--surface-3)"
          aria-label="Open command palette"
        >
          <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="hidden sm:inline">Search or run a command</span>
          <kbd className="ml-1 hidden items-center gap-0.5 border border-(--line-1) bg-background px-1.5 py-0.5 text-[10px] font-medium tabular-nums sm:inline-flex">
            <CommandIcon className="h-2.5 w-2.5" /> K
          </kbd>
        </button>

        <span className="mx-1 h-4 w-px bg-(--line-1)" aria-hidden />

        <QuickAddMenu />

        <span className="mx-1 h-4 w-px bg-(--line-1)" aria-hidden />

        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  )
}

function QuickAddMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Quick add"
          className="flex h-9 items-center gap-1.5 bg-foreground px-3 text-xs font-medium text-background transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">New</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-none">
        <DropdownMenuLabel className="meta-label">Create listing</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/admin/listings/new" search={{ category: 'property' }} className="flex items-center gap-2">
            <Home className="h-4 w-4" strokeWidth={1.5} style={{ color: 'var(--cat-property)' }} />
            Property
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/listings/new" search={{ category: 'vehicle' }} className="flex items-center gap-2">
            <Car className="h-4 w-4" strokeWidth={1.5} style={{ color: 'var(--cat-vehicle)' }} />
            Vehicle
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/listings/new" search={{ category: 'service' }} className="flex items-center gap-2">
            <Wrench className="h-4 w-4" strokeWidth={1.5} style={{ color: 'var(--cat-service)' }} />
            Service
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/listings/new" search={{ category: 'experience' }} className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" strokeWidth={1.5} style={{ color: 'var(--cat-experience)' }} />
            Experience
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ─── Command Palette ──────────────────────────────────────────────────── */

interface PaletteAction {
  id: string
  label: string
  section: string
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>
  run: () => void
}

function AdminCommandPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const { t: _t } = useTranslation()

  const go = (to: string, search?: Record<string, unknown>) => {
    navigate({ to, search: search as never })
    onClose()
  }

  const actions: Array<PaletteAction> = [
    { id: 'nav-dashboard', label: 'Go to Dashboard', section: 'Navigate', icon: LayoutDashboard, run: () => go('/admin') },
    { id: 'nav-listings', label: 'Go to Listings', section: 'Navigate', icon: ListIcon, run: () => go('/admin/listings') },
    { id: 'nav-review', label: 'Go to Review queue', section: 'Navigate', icon: Inbox, run: () => go('/admin/scraping') },
    { id: 'nav-sources', label: 'Go to Source candidates', section: 'Navigate', icon: Globe, run: () => go('/admin/scraping/sources') },
    { id: 'new-prop', label: 'New property', section: 'Create', icon: Home, run: () => go('/admin/listings/new', { category: 'property' }) },
    { id: 'new-veh', label: 'New vehicle', section: 'Create', icon: Car, run: () => go('/admin/listings/new', { category: 'vehicle' }) },
    { id: 'new-srv', label: 'New service', section: 'Create', icon: Wrench, run: () => go('/admin/listings/new', { category: 'service' }) },
    { id: 'new-exp', label: 'New experience', section: 'Create', icon: Sparkles, run: () => go('/admin/listings/new', { category: 'experience' }) },
    { id: 'goto-site', label: 'Open public site', section: 'Other', icon: ArrowUpRight, run: () => go('/') },
  ]

  const q = query.trim().toLowerCase()
  const filtered = q ? actions.filter((a) => a.label.toLowerCase().includes(q)) : actions
  const grouped = filtered.reduce<Record<string, Array<PaletteAction>>>((acc, a) => {
    acc[a.section] ??= []
    acc[a.section].push(a)
    return acc
  }, {})

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-24 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl border border-(--line-1) bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-(--line-1) px-4">
          <Search className="h-4 w-4 text-(--ink-3)" strokeWidth={1.5} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or run a command…"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-(--ink-4)"
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose()
              if (e.key === 'Enter' && filtered[0]) {
                filtered[0].run()
              }
            }}
          />
          <kbd className="border border-(--line-1) bg-(--surface-2) px-1.5 py-0.5 text-[10px] text-(--ink-3)">
            ESC
          </kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {Object.keys(grouped).length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-(--ink-3)">No results</div>
          )}
          {Object.entries(grouped).map(([section, items]) => (
            <div key={section} className="mb-2">
              <div className="meta-label px-4 py-1.5" style={{ color: 'var(--ink-4)' }}>
                {section}
              </div>
              <ul>
                {items.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={a.run}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-(--ink-1) hover:bg-(--surface-2)"
                    >
                      {a.icon && <a.icon className="h-4 w-4 text-(--ink-3)" strokeWidth={1.5} />}
                      <span>{a.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
