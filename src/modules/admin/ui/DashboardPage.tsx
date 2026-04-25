import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  Home,
  Car,
  Wrench,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Inbox,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import { getAdminDashboardFn, getRecentListingsFn, getListingsTrendFn } from '@/modules/admin/api/admin-stats.fn'
import { Skeleton } from '@/components/ui/skeleton'

type Category = 'property' | 'vehicle' | 'service' | 'experience'

const CATEGORY_META: Record<Category, { label: string; icon: typeof Home; color: string }> = {
  property: { label: 'Properties', icon: Home, color: 'var(--cat-property)' },
  vehicle: { label: 'Vehicles', icon: Car, color: 'var(--cat-vehicle)' },
  service: { label: 'Services', icon: Wrench, color: 'var(--cat-service)' },
  experience: { label: 'Experiences', icon: Sparkles, color: 'var(--cat-experience)' },
}

const SOURCE_LABELS: Record<string, string> = {
  airbnb: 'Airbnb',
  facebook: 'Facebook',
  'facebook-events': 'FB Events',
  linkedin: 'LinkedIn',
  edc: 'EDC',
  homestra: 'Homestra',
  boligsiden: 'Boligsiden',
  boliga: 'Boliga',
}

function formatPct(delta: number) {
  if (!Number.isFinite(delta)) return '—'
  const sign = delta > 0 ? '+' : ''
  return `${sign}${Math.round(delta * 100)}%`
}

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => getAdminDashboardFn(),
  })
  const { data: recent, isLoading: recentLoading } = useQuery({
    queryKey: ['admin', 'recent'],
    queryFn: () => getRecentListingsFn(),
  })
  const { data: trend } = useQuery({
    queryKey: ['admin', 'trend'],
    queryFn: () => getListingsTrendFn(),
  })

  const hero = data?.hero
  const pipeline = data?.pipeline
  const topSources = data?.topSources ?? []

  const thisM = hero?.publishedThisMonth ?? 0
  const lastM = hero?.publishedLastMonth ?? 0
  const prevM = hero?.publishedPrevMonth ?? 0
  const deltaMoM = lastM === 0 ? (thisM > 0 ? 1 : 0) : (thisM - lastM) / lastM
  const deltaLast = prevM === 0 ? (lastM > 0 ? 1 : 0) : (lastM - prevM) / prevM

  return (
    <div className="space-y-14">
      <header className="space-y-3">
        <span className="meta-label" style={{ color: 'var(--ink-3)' }}>
          01 · Editor's desk
        </span>
        <h1 className="font-display text-[clamp(2.5rem,1.8rem+2.4vw,4rem)] font-medium leading-[0.95] tracking-tight text-foreground">
          Good day. Here's what's happening.
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed" style={{ color: 'var(--ink-2)' }}>
          A daily read on your catalog, pipeline, and the little stories behind the numbers.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-px bg-(--line-1) md:grid-cols-3">
        <HeroNumber
          label="Total catalog"
          value={hero?.total}
          sub={`${hero?.published ?? 0} published · ${hero?.drafts ?? 0} drafts`}
          loading={isLoading}
        />
        <HeroNumber
          label="Published this month"
          value={thisM}
          sub={`${lastM} last month`}
          delta={deltaMoM}
          loading={isLoading}
        />
        <HeroNumber
          label="Published last month"
          value={lastM}
          sub={`${prevM} the month before`}
          delta={deltaLast}
          loading={isLoading}
        />
      </section>

      <section className="space-y-4">
        <h2 className="meta-label" style={{ color: 'var(--ink-3)' }}>
          02 · By category
        </h2>
        <div className="grid grid-cols-2 gap-px bg-(--line-1) lg:grid-cols-4">
          {(['property', 'vehicle', 'service', 'experience'] as const).map((cat) => {
            const meta = CATEGORY_META[cat]
            const stat = data?.byCategory?.[cat] ?? { total: 0, published: 0 }
            const pct = stat.total > 0 ? stat.published / stat.total : 0
            return (
              <Link
                key={cat}
                to="/admin/listings"
                search={{ category: cat }}
                className="group relative block bg-background p-6 transition-colors hover:bg-(--surface-2)"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="meta-label" style={{ color: meta.color }}>
                    {meta.label}
                  </span>
                  <meta.icon className="h-4 w-4" style={{ color: meta.color }} strokeWidth={1.5} />
                </div>
                {isLoading ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <div className="font-display text-4xl font-medium tabular-nums tracking-tight text-foreground">
                    {stat.total.toLocaleString()}
                  </div>
                )}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-baseline justify-between text-xs">
                    <span style={{ color: 'var(--ink-3)' }}>Published</span>
                    <span className="tabular-nums" style={{ color: 'var(--ink-2)' }}>
                      {stat.published} ({Math.round(pct * 100)}%)
                    </span>
                  </div>
                  <div className="h-0.5 w-full bg-(--line-1)">
                    <div
                      className="h-full transition-all"
                      style={{ width: `${pct * 100}%`, backgroundColor: meta.color }}
                    />
                  </div>
                </div>
                <ArrowUpRight
                  className="absolute right-6 bottom-6 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ color: 'var(--ink-3)' }}
                  strokeWidth={1.5}
                />
              </Link>
            )
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-px bg-(--line-1) lg:grid-cols-[1.2fr_1fr]">
        <div className="bg-background p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="meta-label" style={{ color: 'var(--ink-3)' }}>
              02b · Catalog mix
            </h2>
            <span className="meta-label tabular-nums" style={{ color: 'var(--ink-4)' }}>
              {(hero?.total ?? 0).toLocaleString()} total
            </span>
          </div>
          <DonutCategories
            data={(['property', 'vehicle', 'service', 'experience'] as const).map((cat) => ({
              key: cat,
              label: CATEGORY_META[cat].label,
              color: CATEGORY_META[cat].color,
              value: data?.byCategory?.[cat]?.total ?? 0,
            }))}
          />
        </div>
        <div className="bg-background p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="meta-label" style={{ color: 'var(--ink-3)' }}>
              02c · Status mix
            </h2>
            <span className="meta-label tabular-nums" style={{ color: 'var(--ink-4)' }}>
              {(hero?.total ?? 0).toLocaleString()} listings
            </span>
          </div>
          <StackedBarStatus
            published={hero?.published ?? 0}
            drafts={hero?.drafts ?? 0}
            archived={hero?.archived ?? 0}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <h2 className="meta-label" style={{ color: 'var(--ink-3)' }}>
            03 · Scraping pipeline
          </h2>
          <div className="grid grid-cols-4 gap-px border border-(--line-1) bg-(--line-1)">
            <PipelineCell
              icon={Inbox}
              label="Pending"
              value={pipeline?.pendingReview}
              to="/admin/scraping"
              accent="var(--amber-ink)"
              loading={isLoading}
            />
            <PipelineCell
              icon={FileText}
              label="Reviewed"
              value={pipeline?.reviewed}
              accent="var(--ink-3)"
              loading={isLoading}
            />
            <PipelineCell
              icon={CheckCircle2}
              label="Published"
              value={pipeline?.published}
              accent="var(--cat-vehicle)"
              loading={isLoading}
            />
            <PipelineCell
              icon={XCircle}
              label="Rejected"
              value={pipeline?.rejected}
              accent="var(--ink-4)"
              loading={isLoading}
            />
          </div>

          <div className="border border-(--line-1) bg-background p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="meta-label" style={{ color: 'var(--ink-3)' }}>
                Pending by source
              </span>
              <Link to="/admin/scraping" className="meta-label text-(--ink-3) hover:text-foreground">
                View all →
              </Link>
            </div>
            {topSources.length === 0 ? (
              <div className="py-6 text-center text-sm text-(--ink-3)">Queue is clear.</div>
            ) : (
              <ul className="space-y-2.5">
                {topSources.map((s) => {
                  const max = topSources[0]?.count ?? 1
                  return (
                    <li
                      key={s.source}
                      className="grid grid-cols-[120px_1fr_auto] items-center gap-3 text-sm"
                    >
                      <span style={{ color: 'var(--ink-2)' }}>
                        {SOURCE_LABELS[s.source] ?? s.source}
                      </span>
                      <div className="h-1.5 bg-(--surface-2)">
                        <div
                          className="h-full bg-foreground"
                          style={{ width: `${(s.count / max) * 100}%` }}
                        />
                      </div>
                      <span
                        className="w-10 text-right tabular-nums"
                        style={{ color: 'var(--ink-2)' }}
                      >
                        {s.count}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="meta-label" style={{ color: 'var(--ink-3)' }}>
            04 · Needs attention
          </h2>
          <div className="divide-y divide-(--line-1) border border-(--line-1) bg-background">
            <AttentionRow
              label="Review queue"
              count={pipeline?.pendingReview ?? 0}
              to="/admin/scraping"
              hint="Scraped items waiting approval"
              loading={isLoading}
            />
            <AttentionRow
              label="Unpublished drafts"
              count={hero?.drafts ?? 0}
              to="/admin/listings"
              toSearch={{ status: 'draft' }}
              hint="Created but not live"
              loading={isLoading}
            />
            <AttentionRow
              label="New source candidates"
              count={data?.pendingSources ?? 0}
              to="/admin/scraping/sources"
              hint="Domains discovered by crawler"
              loading={isLoading}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="meta-label" style={{ color: 'var(--ink-3)' }}>
            06 · Publish trend · last 12 weeks
          </h2>
          <span className="meta-label tabular-nums" style={{ color: 'var(--ink-4)' }}>
            {(trend?.reduce((a, b) => a + b.total, 0) ?? 0).toLocaleString()} published
          </span>
        </div>
        <div className="grid grid-cols-1 gap-px bg-(--line-1) lg:grid-cols-[1fr_1.4fr]">
          <div className="bg-background p-6">
            <div className="meta-label mb-3" style={{ color: 'var(--ink-4)' }}>
              Weekly total
            </div>
            <SparklineArea data={(trend ?? []).map((b) => b.total)} />
          </div>
          <div className="bg-background p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="meta-label" style={{ color: 'var(--ink-4)' }}>
                By category
              </span>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {(['property', 'vehicle', 'service', 'experience'] as const).map((cat) => (
                  <span
                    key={cat}
                    className="flex items-center gap-1.5"
                    style={{ color: 'var(--ink-3)' }}
                  >
                    <span
                      className="h-2 w-2"
                      style={{ backgroundColor: CATEGORY_META[cat].color }}
                    />
                    {CATEGORY_META[cat].label}
                  </span>
                ))}
              </div>
            </div>
            <StackedAreaByCategory data={trend ?? []} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="meta-label" style={{ color: 'var(--ink-3)' }}>
            07 · Recent activity
          </h2>
          <Link to="/admin/listings" className="meta-label text-(--ink-3) hover:text-foreground">
            View all →
          </Link>
        </div>
        <div className="border border-(--line-1) bg-background">
          {recentLoading ? (
            <div className="divide-y divide-(--line-1)">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4">
                  <Skeleton className="h-5 w-2/3" />
                </div>
              ))}
            </div>
          ) : recent && recent.length > 0 ? (
            <ul className="divide-y divide-(--line-1)">
              {recent.map((item) => {
                const meta = CATEGORY_META[item.category as Category]
                const Icon = meta?.icon ?? FileText
                return (
                  <li key={item.id}>
                    <Link
                      to="/admin/listings/$id"
                      params={{ id: item.id }}
                      className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-(--surface-2)"
                    >
                      <Icon
                        className="h-4 w-4"
                        style={{ color: meta?.color ?? 'var(--ink-3)' }}
                        strokeWidth={1.5}
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm text-foreground">{item.title}</div>
                        <div className="meta-label truncate" style={{ color: 'var(--ink-3)' }}>
                          {item.city} · {item.subCategory}
                        </div>
                      </div>
                      <StatusPill status={item.status} />
                      <span className="hidden text-xs tabular-nums text-(--ink-3) md:block">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-(--ink-4)" strokeWidth={1.5} />
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="p-10 text-center text-sm text-(--ink-3)">No activity yet.</div>
          )}
        </div>
      </section>
    </div>
  )
}

function HeroNumber({
  label,
  value,
  sub,
  delta,
  loading,
}: {
  label: string
  value?: number
  sub?: string
  delta?: number
  loading?: boolean
}) {
  const deltaIcon =
    delta == null ? null : delta > 0 ? (
      <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
    ) : delta < 0 ? (
      <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={2} />
    ) : (
      <Minus className="h-3.5 w-3.5" strokeWidth={2} />
    )
  const deltaColor =
    delta == null
      ? 'var(--ink-3)'
      : delta > 0
        ? 'var(--cat-vehicle)'
        : delta < 0
          ? 'var(--red)'
          : 'var(--ink-3)'

  return (
    <div className="bg-background p-8">
      <div className="meta-label mb-3" style={{ color: 'var(--ink-3)' }}>
        {label}
      </div>
      {loading ? (
        <Skeleton className="h-14 w-32" />
      ) : (
        <div className="font-display text-5xl font-medium leading-none tracking-tight tabular-nums text-foreground md:text-6xl">
          {(value ?? 0).toLocaleString()}
        </div>
      )}
      <div className="mt-4 flex items-center gap-2 text-xs">
        {delta != null && (
          <span
            className="flex items-center gap-0.5 font-medium tabular-nums"
            style={{ color: deltaColor }}
          >
            {deltaIcon}
            {formatPct(delta)}
          </span>
        )}
        {sub && <span style={{ color: 'var(--ink-3)' }}>{sub}</span>}
      </div>
    </div>
  )
}

function PipelineCell({
  icon: Icon,
  label,
  value,
  accent,
  to,
  loading,
}: {
  icon: typeof Home
  label: string
  value?: number
  accent: string
  to?: string
  loading?: boolean
}) {
  const body = (
    <div className="bg-background p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="meta-label" style={{ color: 'var(--ink-3)' }}>
          {label}
        </span>
        <Icon className="h-3.5 w-3.5" style={{ color: accent }} strokeWidth={1.5} />
      </div>
      {loading ? (
        <Skeleton className="h-9 w-16" />
      ) : (
        <div className="font-display text-3xl font-medium tabular-nums text-foreground">
          {(value ?? 0).toLocaleString()}
        </div>
      )}
    </div>
  )
  if (to)
    return (
      <Link to={to} className="block transition-colors hover:bg-(--surface-2)">
        {body}
      </Link>
    )
  return body
}

function AttentionRow({
  label,
  count,
  to,
  toSearch,
  hint,
  loading,
}: {
  label: string
  count: number
  to: string
  toSearch?: Record<string, unknown>
  hint: string
  loading?: boolean
}) {
  return (
    <Link
      to={to}
      search={toSearch as never}
      className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-(--surface-2)"
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm text-foreground">{label}</div>
        <div className="meta-label mt-0.5" style={{ color: 'var(--ink-4)' }}>
          {hint}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {count > 0 ? (
          <AlertTriangle
            className="h-3.5 w-3.5"
            style={{ color: 'var(--amber-ink)' }}
            strokeWidth={1.5}
          />
        ) : (
          <CheckCircle2
            className="h-3.5 w-3.5"
            style={{ color: 'var(--cat-vehicle)' }}
            strokeWidth={1.5}
          />
        )}
        {loading ? (
          <Skeleton className="h-6 w-8" />
        ) : (
          <span className="font-display text-xl font-medium tabular-nums text-foreground">
            {count}
          </span>
        )}
        <ArrowUpRight className="h-3.5 w-3.5 text-(--ink-4)" strokeWidth={1.5} />
      </div>
    </Link>
  )
}

function StatusPill({ status }: { status: string }) {
  const MAP: Record<string, { label: string; color: string; bg: string }> = {
    published: {
      label: 'Published',
      color: 'var(--cat-vehicle)',
      bg: 'color-mix(in oklch, var(--cat-vehicle) 12%, transparent)',
    },
    draft: {
      label: 'Draft',
      color: 'var(--amber-ink)',
      bg: 'color-mix(in oklch, var(--amber) 20%, transparent)',
    },
    archived: { label: 'Archived', color: 'var(--ink-3)', bg: 'var(--surface-2)' },
  }
  const m = MAP[status] ?? MAP.draft
  return (
    <span
      className="meta-label inline-flex h-6 items-center px-2 tabular-nums"
      style={{ color: m.color, backgroundColor: m.bg }}
    >
      {m.label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG chart primitives — hand-rolled to stay true to the editorial aesthetic.
// No chart library; all shapes are plain <path>/<rect> on a viewBox grid.
// ─────────────────────────────────────────────────────────────────────────────

function SparklineArea({ data }: { data: number[] }) {
  const W = 320
  const H = 88
  const pad = 2
  const n = data.length
  if (n === 0) {
    return (
      <div className="flex h-22 items-center justify-center text-xs text-(--ink-4)">No data</div>
    )
  }
  const max = Math.max(1, ...data)
  const stepX = (W - pad * 2) / Math.max(1, n - 1)
  const pts = data.map((v, i) => {
    const x = pad + i * stepX
    const y = H - pad - (v / max) * (H - pad * 2)
    return [x, y] as const
  })
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${(W - pad).toFixed(1)},${(H - pad).toFixed(1)} L${pad},${(H - pad).toFixed(1)} Z`
  const last = pts[pts.length - 1]!
  const total = data.reduce((a, b) => a + b, 0)
  const avg = total / n
  const avgY = H - pad - (avg / max) * (H - pad * 2)

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-22 w-full" preserveAspectRatio="none">
        <path d={area} fill="var(--ink-4)" opacity="0.14" />
        <line
          x1={pad}
          x2={W - pad}
          y1={avgY}
          y2={avgY}
          stroke="var(--ink-4)"
          strokeWidth={0.5}
          strokeDasharray="2 3"
        />
        <path d={line} fill="none" stroke="var(--ink-1)" strokeWidth={1.5} />
        <circle cx={last[0]} cy={last[1]} r={2.5} fill="var(--ink-1)" />
      </svg>
      <div className="mt-3 flex items-baseline justify-between text-xs">
        <div className="font-display text-2xl tabular-nums text-foreground">
          {data[n - 1]?.toLocaleString() ?? 0}
        </div>
        <div className="meta-label tabular-nums" style={{ color: 'var(--ink-4)' }}>
          avg {Math.round(avg).toLocaleString()}/wk
        </div>
      </div>
    </div>
  )
}

function StackedAreaByCategory({
  data,
}: {
  data: Array<{
    weekStart: string
    property: number
    vehicle: number
    service: number
    experience: number
    total: number
  }>
}) {
  const W = 520
  const H = 160
  const pad = 4
  const cats = ['experience', 'service', 'vehicle', 'property'] as const
  const colors: Record<(typeof cats)[number], string> = {
    property: 'var(--cat-property)',
    vehicle: 'var(--cat-vehicle)',
    service: 'var(--cat-service)',
    experience: 'var(--cat-experience)',
  }
  if (!data.length) {
    return (
      <div className="flex h-40 items-center justify-center text-xs text-(--ink-4)">No data</div>
    )
  }
  const max = Math.max(1, ...data.map((d) => d.total))
  const stepX = (W - pad * 2) / Math.max(1, data.length - 1)

  // Build cumulative baselines (top-down). For a stacked area we paint largest→smallest.
  const baselines: number[][] = data.map(() => [0])
  for (const cat of cats) {
    data.forEach((d, i) => {
      const prev = baselines[i]![baselines[i]!.length - 1]!
      baselines[i]!.push(prev + (d[cat] ?? 0))
    })
  }

  const paths = cats.map((cat, catIdx) => {
    const upper = data.map((_, i) => {
      const y = baselines[i]![catIdx + 1]!
      const x = pad + i * stepX
      return [x, H - pad - (y / max) * (H - pad * 2)] as const
    })
    const lower = data.map((_, i) => {
      const y = baselines[i]![catIdx]!
      const x = pad + i * stepX
      return [x, H - pad - (y / max) * (H - pad * 2)] as const
    })
    const d =
      upper.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ') +
      ' ' +
      lower
        .slice()
        .reverse()
        .map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`)
        .join(' ') +
      ' Z'
    return { cat, d }
  })

  // X-axis labels: first / mid / last week
  const labelIdx = [0, Math.floor(data.length / 2), data.length - 1]

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-40 w-full" preserveAspectRatio="none">
        {paths.map(({ cat, d }) => (
          <path key={cat} d={d} fill={colors[cat]} opacity={0.85} />
        ))}
        <line
          x1={pad}
          x2={W - pad}
          y1={H - pad}
          y2={H - pad}
          stroke="var(--line-1)"
          strokeWidth={0.5}
        />
      </svg>
      <div className="mt-2 flex justify-between text-[10px] tabular-nums" style={{ color: 'var(--ink-4)' }}>
        {labelIdx.map((i) => (
          <span key={i}>
            {data[i]
              ? new Date(data[i].weekStart).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })
              : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

function DonutCategories({
  data,
}: {
  data: Array<{ key: string; label: string; color: string; value: number }>
}) {
  const total = data.reduce((a, b) => a + b.value, 0)
  const size = 180
  const cx = size / 2
  const cy = size / 2
  const r = 70
  const innerR = 48
  if (total === 0) {
    return (
      <div className="flex h-44 items-center justify-center text-xs text-(--ink-4)">
        No listings yet
      </div>
    )
  }

  const arcs: Array<{ d: string; color: string }> = []
  let acc = 0
  for (const slice of data) {
    if (slice.value <= 0) continue
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2
    acc += slice.value
    const end = (acc / total) * Math.PI * 2 - Math.PI / 2
    const large = end - start > Math.PI ? 1 : 0
    const x1 = cx + r * Math.cos(start)
    const y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end)
    const y2 = cy + r * Math.sin(end)
    const x3 = cx + innerR * Math.cos(end)
    const y3 = cy + innerR * Math.sin(end)
    const x4 = cx + innerR * Math.cos(start)
    const y4 = cy + innerR * Math.sin(start)
    arcs.push({
      color: slice.color,
      d: `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} L${x3.toFixed(2)},${y3.toFixed(2)} A${innerR},${innerR} 0 ${large} 0 ${x4.toFixed(2)},${y4.toFixed(2)} Z`,
    })
  }

  return (
    <div className="flex items-center gap-6">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-44 w-44 shrink-0">
        {arcs.map((a, i) => (
          <path key={i} d={a.d} fill={a.color} />
        ))}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          className="fill-foreground font-display tabular-nums"
          style={{ fontSize: 22, fontWeight: 500 }}
        >
          {total.toLocaleString()}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          className="fill-(--ink-4)"
          style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          total
        </text>
      </svg>
      <ul className="flex-1 space-y-2 text-sm">
        {data.map((s) => {
          const pct = total > 0 ? (s.value / total) * 100 : 0
          return (
            <li key={s.key} className="grid grid-cols-[10px_1fr_auto_auto] items-center gap-3">
              <span className="h-2.5 w-2.5" style={{ backgroundColor: s.color }} />
              <span style={{ color: 'var(--ink-2)' }}>{s.label}</span>
              <span className="tabular-nums" style={{ color: 'var(--ink-3)' }}>
                {s.value.toLocaleString()}
              </span>
              <span
                className="w-10 text-right tabular-nums"
                style={{ color: 'var(--ink-4)' }}
              >
                {pct.toFixed(0)}%
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function StackedBarStatus({
  published,
  drafts,
  archived,
}: {
  published: number
  drafts: number
  archived: number
}) {
  const total = published + drafts + archived
  const rows = [
    { key: 'published', label: 'Published', value: published, color: 'var(--cat-vehicle)' },
    { key: 'draft', label: 'Drafts', value: drafts, color: 'var(--amber-ink)' },
    { key: 'archived', label: 'Archived', value: archived, color: 'var(--ink-4)' },
  ]
  if (total === 0) {
    return (
      <div className="flex h-44 items-center justify-center text-xs text-(--ink-4)">
        Nothing here yet
      </div>
    )
  }
  return (
    <div className="space-y-5">
      <div className="flex h-3 w-full overflow-hidden">
        {rows.map((r) => {
          const pct = total > 0 ? (r.value / total) * 100 : 0
          if (pct === 0) return null
          return <div key={r.key} style={{ width: `${pct}%`, backgroundColor: r.color }} />
        })}
      </div>
      <ul className="space-y-2.5 text-sm">
        {rows.map((r) => {
          const pct = total > 0 ? (r.value / total) * 100 : 0
          return (
            <li key={r.key} className="grid grid-cols-[10px_1fr_auto_auto] items-center gap-3">
              <span className="h-2.5 w-2.5" style={{ backgroundColor: r.color }} />
              <span style={{ color: 'var(--ink-2)' }}>{r.label}</span>
              <span className="tabular-nums" style={{ color: 'var(--ink-3)' }}>
                {r.value.toLocaleString()}
              </span>
              <span
                className="w-10 text-right tabular-nums"
                style={{ color: 'var(--ink-4)' }}
              >
                {pct.toFixed(0)}%
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
