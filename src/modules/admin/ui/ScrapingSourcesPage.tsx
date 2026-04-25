import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import {
  CheckCircle2,
  XCircle,
  Skull,
  Globe,
  Loader2,
  ExternalLink,
  Search,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react'
import {
  listBuiltInSourcesFn,
  listSourceCandidatesFn,
  updateSourceCandidateStatusFn,
} from '@/modules/admin/api/scraping-sources.fn'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'

type CandidateStatus = 'pending' | 'approved' | 'rejected' | 'dead'

const STATUS_META: Record<CandidateStatus, { label: string; color: string; bg: string }> = {
  pending: {
    label: 'Pending',
    color: 'var(--amber-ink)',
    bg: 'color-mix(in oklch, var(--amber) 20%, transparent)',
  },
  approved: {
    label: 'Approved',
    color: 'var(--cat-vehicle)',
    bg: 'color-mix(in oklch, var(--cat-vehicle) 12%, transparent)',
  },
  rejected: { label: 'Rejected', color: 'var(--ink-3)', bg: 'var(--surface-2)' },
  dead: {
    label: 'Dead',
    color: 'var(--red)',
    bg: 'color-mix(in oklch, var(--red) 12%, transparent)',
  },
}

const FILTERS: Array<{ key: CandidateStatus | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'dead', label: 'Dead' },
]

const SOURCE_LABELS: Record<string, string> = {
  airbnb: 'Airbnb',
  facebook: 'Facebook',
  'facebook-events': 'Facebook Events',
  linkedin: 'LinkedIn',
  edc: 'EDC',
  homestra: 'Homestra',
  boligsiden: 'Boligsiden',
  boliga: 'Boliga',
}

const SOURCE_DOMAINS: Record<string, string> = {
  airbnb: 'airbnb.com',
  facebook: 'facebook.com',
  'facebook-events': 'facebook.com',
  linkedin: 'linkedin.com',
  edc: 'edc.dk',
  homestra: 'homestra.com',
  boligsiden: 'boligsiden.dk',
  boliga: 'boliga.dk',
}

export function ScrapingSourcesPage() {
  const search$ = useSearch({ from: '/_admin/admin/scraping/sources' }) as {
    tab?: 'discovery' | 'active'
  }
  const navigate = useNavigate({ from: '/admin/scraping/sources' })
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'all'>('pending')
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'source-candidates', { status: statusFilter }],
    queryFn: () =>
      listSourceCandidatesFn({
        data: { status: statusFilter === 'all' ? undefined : statusFilter },
      }),
  })
  const { data: builtIn, isLoading: builtInLoading } = useQuery({
    queryKey: ['admin', 'built-in-sources'],
    queryFn: () => listBuiltInSourcesFn(),
  })

  // Pending candidates count — used to pick the default tab + drive the
  // "needs attention" dot on the Discovery tab header.
  const { data: pendingData } = useQuery({
    queryKey: ['admin', 'source-candidates', { status: 'pending' as const }],
    queryFn: () => listSourceCandidatesFn({ data: { status: 'pending' } }),
  })
  const pendingCount = pendingData?.items.length ?? 0

  const tab: 'discovery' | 'active' = search$.tab ?? (pendingCount > 0 ? 'discovery' : 'active')
  useEffect(() => {
    if (!search$.tab) {
      navigate({
        search: (prev) => ({ ...prev, tab: pendingCount > 0 ? 'discovery' : 'active' }),
        replace: true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCount])
  const setTab = (next: 'discovery' | 'active') =>
    navigate({ search: (prev) => ({ ...prev, tab: next }) })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'source-candidates'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'built-in-sources'] })
  }

  const updateMutation = useMutation({
    mutationFn: (args: { id: string; status: CandidateStatus }) =>
      updateSourceCandidateStatusFn({ data: args }),
    onSuccess: invalidate,
  })

  const items = data?.items ?? []
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter((c) => c.domain.toLowerCase().includes(q))
  }, [items, search])

  const stats = useMemo(() => {
    const s = { pending: 0, approved: 0, rejected: 0, dead: 0, total: items.length }
    for (const c of items) {
      s[c.status as CandidateStatus] = (s[c.status as CandidateStatus] ?? 0) + 1
    }
    return s
  }, [items])

  const activeItems = builtIn?.items ?? []
  const activeTotal = activeItems.reduce((a, b) => a + b.total, 0)

  return (
    <div className="space-y-8">
      {/* Masthead */}
      <header className="space-y-2">
        <span className="meta-label" style={{ color: 'var(--ink-3)' }}>
          03 · Pipeline · Sources
        </span>
        <h1 className="font-display text-[clamp(2.25rem,1.6rem+2vw,3.25rem)] font-medium leading-none tracking-tight text-foreground">
          Sources
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--ink-2)' }}>
          Domains the crawler has found, plus the scrapers already ingesting listings into the
          catalog.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex items-end gap-8 border-b border-(--line-1)">
        <TabButton
          active={tab === 'discovery'}
          onClick={() => setTab('discovery')}
          label="Discovery"
          counter={pendingCount}
          counterAccent="var(--amber-ink)"
          hint="awaiting approval"
        />
        <TabButton
          active={tab === 'active'}
          onClick={() => setTab('active')}
          label="Active"
          counter={activeItems.length}
          counterAccent="var(--cat-vehicle)"
          hint="in use"
        />
      </div>

      {tab === 'discovery' ? (
        <section className="space-y-6">
          {/* Stats strip */}
          <div className="grid grid-cols-2 gap-px bg-(--line-1) md:grid-cols-4">
            <StatCell label="Pending" value={stats.pending} color="var(--amber-ink)" />
            <StatCell label="Approved" value={stats.approved} color="var(--cat-vehicle)" />
            <StatCell label="Rejected" value={stats.rejected} color="var(--ink-3)" />
            <StatCell label="Dead" value={stats.dead} color="var(--red)" />
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-wrap items-center gap-6">
              <span className="meta-label" style={{ color: 'var(--ink-4)' }}>
                Status
              </span>
              {FILTERS.map((f) => (
                <FilterChip
                  key={f.key}
                  label={f.label}
                  active={statusFilter === f.key}
                  color={f.key !== 'all' ? STATUS_META[f.key].color : undefined}
                  onClick={() => setStatusFilter(f.key)}
                />
              ))}
            </div>
            <div className="relative ml-auto flex min-w-60 items-center">
              <Search
                className="pointer-events-none absolute left-3 h-4 w-4 text-(--ink-3)"
                strokeWidth={1.5}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by domain…"
                className="h-10 w-full border border-(--line-1) bg-background pl-10 pr-3 text-sm outline-none placeholder:text-(--ink-4) focus:border-foreground"
              />
            </div>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="border border-(--line-1) bg-background p-16 text-center">
              <p className="font-display text-xl text-foreground">No candidates.</p>
              <p className="mt-2 text-sm" style={{ color: 'var(--ink-3)' }}>
                Run{' '}
                <span className="rounded bg-(--surface-2) px-1.5 py-0.5 font-mono text-xs text-foreground">
                  npx tsx scripts/scraping/discovery.ts
                </span>{' '}
                to discover new sources.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-(--line-1) border border-(--line-1) bg-background">
              {filteredItems.map((c) => (
                <CandidateRow
                  key={c.id}
                  id={c.id}
                  domain={c.domain}
                  status={c.status as CandidateStatus}
                  discoveredFrom={c.discoveredFrom}
                  notes={c.notes}
                  pending={updateMutation.isPending}
                  onAct={(status) => updateMutation.mutate({ id: c.id, status })}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="meta-label" style={{ color: 'var(--ink-4)' }}>
              {activeItems.length} approved · {activeTotal.toLocaleString()} items ingested
            </span>
          </div>
          {builtInLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : activeItems.length === 0 ? (
            <div className="border border-(--line-1) bg-background p-16 text-center">
              <p className="font-display text-xl text-foreground">No active sources yet.</p>
              <p className="mt-2 text-sm" style={{ color: 'var(--ink-3)' }}>
                Approve a candidate in the Discovery tab to add it here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-(--line-1) border border-(--line-1) bg-background">
              {activeItems.map((s) => (
                <BuiltInRow
                  key={`${s.kind}-${s.source}`}
                  kind={s.kind}
                  label={s.label ?? SOURCE_LABELS[s.source] ?? s.source}
                  domain={s.domain ?? SOURCE_DOMAINS[s.source] ?? s.source}
                  total={s.total}
                  pending={s.pending}
                  published={s.published}
                  rejected={s.rejected}
                  lastSeenAt={s.lastSeenAt}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  label,
  counter,
  counterAccent,
  hint,
}: {
  active: boolean
  onClick: () => void
  label: string
  counter: number
  counterAccent: string
  hint: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative -mb-px flex items-baseline gap-3 pb-3 text-left transition-colors',
        active ? 'text-foreground' : 'text-(--ink-3) hover:text-foreground',
      )}
    >
      <span className="font-display text-2xl font-medium tracking-tight">{label}</span>
      <span className="meta-label tabular-nums" style={{ color: active ? counterAccent : 'var(--ink-4)' }}>
        {counter} {hint}
      </span>
      <span
        className={cn(
          'absolute -bottom-px left-0 right-0 h-0.5 transition-transform',
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
        )}
        style={{ backgroundColor: 'var(--foreground)' }}
        aria-hidden
      />
    </button>
  )
}

/* ─── Sub-components ─── */

function StatCell({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-background p-5">
      <div className="meta-label mb-2" style={{ color: 'var(--ink-3)' }}>
        {label}
      </div>
      <div className="font-display text-3xl font-medium tabular-nums" style={{ color }}>
        {value.toLocaleString()}
      </div>
    </div>
  )
}

function FilterChip({
  label,
  active,
  color,
  onClick,
}: {
  label: string
  active: boolean
  color?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative inline-flex items-center text-sm transition-colors',
        active ? 'text-foreground' : 'text-(--ink-3) hover:text-foreground',
      )}
    >
      {label}
      <span
        className={cn(
          'absolute -bottom-1 left-0 right-0 h-0.5 transition-transform',
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
        )}
        style={{ backgroundColor: color ?? 'var(--foreground)' }}
        aria-hidden
      />
    </button>
  )
}

function CandidateRow({
  domain,
  status,
  discoveredFrom,
  notes,
  pending,
  onAct,
}: {
  id: string
  domain: string
  status: CandidateStatus
  discoveredFrom: string | null
  notes: string | null
  pending: boolean
  onAct: (s: CandidateStatus) => void
}) {
  const meta = STATUS_META[status]
  const favicon = `https://www.google.com/s2/favicons?sz=32&domain=${domain}`
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-(--surface-2)">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-(--surface-2)">
        <img
          src={favicon}
          alt=""
          className="h-5 w-5"
          loading="lazy"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
        <Globe
          className="absolute h-4 w-4 text-(--ink-3)"
          style={{ opacity: 0 }}
          strokeWidth={1.5}
          aria-hidden
        />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <a
            href={`https://${domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm font-medium text-foreground hover:underline"
          >
            {domain}
          </a>
          <ExternalLink className="h-3 w-3 text-(--ink-4)" strokeWidth={1.5} />
          <span
            className="meta-label inline-flex h-5 items-center px-2"
            style={{ color: meta.color, backgroundColor: meta.bg }}
          >
            {meta.label}
          </span>
        </div>
        {(discoveredFrom ?? notes) && (
          <div className="meta-label mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 truncate" style={{ color: 'var(--ink-3)' }}>
            {discoveredFrom && (
              <span className="truncate">
                via{' '}
                <a
                  href={discoveredFrom}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  {discoveredFrom.replace(/^https?:\/\//, '').slice(0, 60)}
                </a>
              </span>
            )}
            {notes && <span className="truncate font-mono text-[10px]">{notes}</span>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <RowAction
          icon={pending ? Loader2 : CheckCircle2}
          label="Approve"
          disabled={pending || status === 'approved'}
          onClick={() => onAct('approved')}
          accent="var(--cat-vehicle)"
          spin={pending}
        />
        <RowAction
          icon={XCircle}
          label="Reject"
          disabled={pending || status === 'rejected'}
          onClick={() => onAct('rejected')}
          accent="var(--ink-3)"
        />
        <RowAction
          icon={Skull}
          label="Dead"
          disabled={pending || status === 'dead'}
          onClick={() => onAct('dead')}
          accent="var(--red)"
        />
      </div>
    </div>
  )
}

function RowAction({
  icon: Icon,
  label,
  disabled,
  onClick,
  accent,
  spin,
}: {
  icon: typeof CheckCircle2
  label: string
  disabled?: boolean
  onClick: () => void
  accent: string
  spin?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 border border-(--line-1) bg-background px-3 text-xs font-medium transition-colors',
        disabled
          ? 'cursor-not-allowed text-(--ink-4) opacity-40'
          : 'text-(--ink-1) hover:bg-(--surface-2)',
      )}
      title={label}
    >
      <Icon
        className={cn('h-3.5 w-3.5', spin && 'animate-spin')}
        style={{ color: accent }}
        strokeWidth={1.5}
      />
      {label}
    </button>
  )
}

function BuiltInRow({
  kind,
  label,
  domain,
  total,
  pending,
  published,
  rejected,
  lastSeenAt,
}: {
  kind: 'built-in' | 'approved-candidate'
  label: string
  domain: string
  total: number
  pending: number
  published: number
  rejected: number
  lastSeenAt: string | null
}) {
  const favicon = `https://www.google.com/s2/favicons?sz=32&domain=${domain}`
  const lastSeen = lastSeenAt ? formatRelative(lastSeenAt) : null
  const isAwaiting = kind === 'approved-candidate'
  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-(--surface-2)">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-(--surface-2)">
        <img
          src={favicon}
          alt=""
          className="h-5 w-5"
          loading="lazy"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
        <Globe
          className="absolute h-4 w-4 text-(--ink-3)"
          style={{ opacity: 0 }}
          strokeWidth={1.5}
          aria-hidden
        />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">{label}</span>
          <a
            href={`https://${domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-(--ink-3) hover:text-foreground"
          >
            {domain}
            <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
          </a>
          <span
            className="meta-label inline-flex h-5 items-center gap-1 px-2"
            style={{
              color: 'var(--cat-vehicle)',
              backgroundColor: 'color-mix(in oklch, var(--cat-vehicle) 12%, transparent)',
            }}
          >
            <ShieldCheck className="h-3 w-3" strokeWidth={1.75} />
            {isAwaiting ? 'Approved · awaiting scraper' : 'Approved'}
          </span>
        </div>
        <div
          className="meta-label mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5"
          style={{ color: 'var(--ink-3)' }}
        >
          {isAwaiting ? (
            <span>No scraper wired yet — add one under scripts/scraping/</span>
          ) : (
            <>
              <span className="tabular-nums">
                <span className="text-foreground">{total.toLocaleString()}</span> items
              </span>
              {published > 0 && (
                <span className="tabular-nums" style={{ color: 'var(--cat-vehicle)' }}>
                  {published} published
                </span>
              )}
              {pending > 0 && (
                <span className="tabular-nums" style={{ color: 'var(--amber-ink)' }}>
                  {pending} pending
                </span>
              )}
              {rejected > 0 && <span className="tabular-nums">{rejected} rejected</span>}
              {lastSeen && <span>· last seen {lastSeen}</span>}
            </>
          )}
        </div>
      </div>

      <div className="hidden min-w-32 md:block">
        {isAwaiting ? (
          <div className="h-1.5 w-full bg-(--surface-2)" />
        ) : (
          <SourceMiniBar
            published={published}
            pending={pending}
            rejected={rejected}
            total={total}
          />
        )}
      </div>

      <Link
        to="/admin/scraping"
        className="inline-flex h-8 items-center gap-1.5 border border-(--line-1) bg-background px-3 text-xs font-medium text-(--ink-1) transition-colors hover:bg-(--surface-2)"
      >
        Review queue
        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
      </Link>
    </div>
  )
}

function SourceMiniBar({
  published,
  pending,
  rejected,
  total,
}: {
  published: number
  pending: number
  rejected: number
  total: number
}) {
  if (total === 0) return <div className="h-1.5 w-full bg-(--surface-2)" />
  const pub = (published / total) * 100
  const pen = (pending / total) * 100
  const rej = (rejected / total) * 100
  return (
    <div
      className="flex h-1.5 w-full overflow-hidden bg-(--surface-2)"
      title={`${published} published · ${pending} pending · ${rejected} rejected`}
    >
      {pub > 0 && <div style={{ width: `${pub}%`, backgroundColor: 'var(--cat-vehicle)' }} />}
      {pen > 0 && <div style={{ width: `${pen}%`, backgroundColor: 'var(--amber-ink)' }} />}
      {rej > 0 && <div style={{ width: `${rej}%`, backgroundColor: 'var(--ink-4)' }} />}
    </div>
  )
}

function formatRelative(iso: string): string {
  const ts = new Date(iso).getTime()
  if (!Number.isFinite(ts)) return ''
  const diff = Date.now() - ts
  const m = Math.round(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}
