import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  Search,
  Home,
  Car,
  Wrench,
  Sparkles,
  Pencil,
  Eye,
  EyeOff,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  FileText,
  ExternalLink,
} from 'lucide-react'
import {
  getAdminListingsFn,
  updateListingStatusFn,
  deleteListingFn,
} from '@/modules/admin/api/admin-listings.fn'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'

type Category = 'property' | 'vehicle' | 'service' | 'experience'
type Status = 'draft' | 'published' | 'archived'

const CATEGORY_META: Record<Category, { label: string; icon: typeof Home; color: string }> = {
  property: { label: 'Property', icon: Home, color: 'var(--cat-property)' },
  vehicle: { label: 'Vehicle', icon: Car, color: 'var(--cat-vehicle)' },
  service: { label: 'Service', icon: Wrench, color: 'var(--cat-service)' },
  experience: { label: 'Experience', icon: Sparkles, color: 'var(--cat-experience)' },
}

const STATUS_META: Record<Status, { label: string; color: string; bg: string }> = {
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

export function ListingsTablePage() {
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const pageSize = 20

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'listings', { search, categoryFilter, statusFilter, page }],
    queryFn: () =>
      getAdminListingsFn({
        data: {
          query: search || undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          page,
          pageSize,
        },
      }),
  })

  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: Status }) => updateListingStatusFn({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'badges'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteListingFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'badges'] })
    },
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1
  const items = data?.items ?? []
  const allSelected = items.length > 0 && items.every((i) => selected.has(i.id))

  const toggleAll = () => {
    setSelected((prev) => {
      if (allSelected) return new Set()
      const next = new Set(prev)
      items.forEach((i) => next.add(i.id))
      return next
    })
  }
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const clearSelection = () => setSelected(new Set())

  const bulkApply = async (status: Status) => {
    await Promise.all(Array.from(selected).map((id) => statusMutation.mutateAsync({ id, status })))
    clearSelection()
  }
  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} listing(s)? This cannot be undone.`)) return
    await Promise.all(Array.from(selected).map((id) => deleteMutation.mutateAsync(id)))
    clearSelection()
  }

  const resetFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setStatusFilter('all')
    setPage(1)
  }
  const hasActiveFilter = search !== '' || categoryFilter !== 'all' || statusFilter !== 'all'

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-2">
          <span className="meta-label" style={{ color: 'var(--ink-3)' }}>
            02 · Catalog
          </span>
          <h1 className="font-display text-[clamp(2.25rem,1.6rem+2vw,3.25rem)] font-medium leading-none tracking-tight text-foreground">
            Listings
          </h1>
          <p className="text-sm tabular-nums" style={{ color: 'var(--ink-3)' }}>
            {isLoading
              ? 'Loading…'
              : `${data?.total.toLocaleString() ?? 0} total` +
                (hasActiveFilter ? ' · filtered' : '')}
          </p>
        </div>

        <Link
          to="/admin/listings/new"
          className="inline-flex h-10 items-center gap-2 bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          <FileText className="h-4 w-4" strokeWidth={1.5} />
          New listing
        </Link>
      </header>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex min-w-60 flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-(--ink-3)" strokeWidth={1.5} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search by title, address, or city…"
              className="h-10 w-full border border-(--line-1) bg-background pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-(--ink-4) focus:border-foreground"
            />
          </div>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="meta-label flex h-10 items-center gap-1 px-2 text-(--ink-3) hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.5} />
              Reset
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <span className="meta-label" style={{ color: 'var(--ink-4)' }}>
            Category
          </span>
          <CategoryChip
            label="All"
            active={categoryFilter === 'all'}
            onClick={() => {
              setCategoryFilter('all')
              setPage(1)
            }}
          />
          {(Object.keys(CATEGORY_META) as Array<Category>).map((c) => (
            <CategoryChip
              key={c}
              label={CATEGORY_META[c].label}
              color={CATEGORY_META[c].color}
              active={categoryFilter === c}
              onClick={() => {
                setCategoryFilter(c)
                setPage(1)
              }}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <span className="meta-label" style={{ color: 'var(--ink-4)' }}>
            Status
          </span>
          <CategoryChip
            label="All"
            active={statusFilter === 'all'}
            onClick={() => {
              setStatusFilter('all')
              setPage(1)
            }}
          />
          {(Object.keys(STATUS_META) as Array<Status>).map((s) => (
            <CategoryChip
              key={s}
              label={STATUS_META[s].label}
              color={STATUS_META[s].color}
              active={statusFilter === s}
              onClick={() => {
                setStatusFilter(s)
                setPage(1)
              }}
            />
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="sticky top-14 z-30 flex items-center justify-between border border-(--line-1) bg-(--surface-2) px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="meta-label" style={{ color: 'var(--ink-2)' }}>
              {selected.size} selected
            </span>
            <button
              type="button"
              onClick={clearSelection}
              className="meta-label text-(--ink-3) hover:text-foreground"
            >
              Clear
            </button>
          </div>
          <div className="flex items-center gap-2">
            <BulkButton onClick={() => bulkApply('published')} icon={Eye} label="Publish" />
            <BulkButton onClick={() => bulkApply('draft')} icon={EyeOff} label="Unpublish" />
            <BulkButton onClick={() => bulkApply('archived')} icon={Archive} label="Archive" />
            <BulkButton onClick={bulkDelete} icon={Trash2} label="Delete" danger />
          </div>
        </div>
      )}

      <div className="border border-(--line-1) bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--line-1) text-left">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all"
                    className="h-3.5 w-3.5 accent-foreground"
                  />
                </th>
                <th className="meta-label px-4 py-3" style={{ color: 'var(--ink-3)' }}>Listing</th>
                <th className="meta-label px-4 py-3" style={{ color: 'var(--ink-3)' }}>Category</th>
                <th className="meta-label px-4 py-3" style={{ color: 'var(--ink-3)' }}>Transaction</th>
                <th className="meta-label px-4 py-3 text-right" style={{ color: 'var(--ink-3)' }}>Price</th>
                <th className="meta-label px-4 py-3" style={{ color: 'var(--ink-3)' }}>Status</th>
                <th className="meta-label px-4 py-3" style={{ color: 'var(--ink-3)' }}>Updated</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-(--line-1)">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="p-3">
                      <Skeleton className="h-14 w-full" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-16 text-center">
                    <div className="mx-auto max-w-sm space-y-3">
                      <p className="font-display text-xl text-foreground">No listings match.</p>
                      <p className="text-sm" style={{ color: 'var(--ink-3)' }}>
                        Try clearing filters or create a new listing.
                      </p>
                      {hasActiveFilter && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="meta-label text-(--ink-2) underline underline-offset-4"
                        >
                          Reset filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const meta = CATEGORY_META[item.category as Category] ?? CATEGORY_META.property
                  const Icon = meta.icon
                  const sel = selected.has(item.id)
                  return (
                    <tr
                      key={item.id}
                      className={cn('transition-colors hover:bg-(--surface-2)', sel && 'bg-(--surface-2)')}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={sel}
                          onChange={() => toggleOne(item.id)}
                          aria-label={`Select ${item.title}`}
                          className="h-3.5 w-3.5 accent-foreground"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.coverUrl ? (
                            <img
                              src={item.coverUrl}
                              alt=""
                              className="h-12 w-12 shrink-0 object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-(--surface-3)">
                              <Icon className="h-4 w-4 text-(--ink-3)" strokeWidth={1.5} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              to="/admin/listings/$id"
                              params={{ id: item.id }}
                              className="block truncate text-sm font-medium text-foreground hover:underline"
                            >
                              {item.title}
                            </Link>
                            <div className="meta-label mt-0.5 truncate" style={{ color: 'var(--ink-3)' }}>
                              {item.city}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="meta-label inline-flex items-center gap-1.5" style={{ color: meta.color }}>
                          <Icon className="h-3 w-3" strokeWidth={1.5} />
                          {item.subCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3 capitalize text-(--ink-2)">{item.transactionType}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                        {new Intl.NumberFormat('en-DK', {
                          style: 'currency',
                          currency: item.currency,
                          maximumFractionDigits: 0,
                        }).format(item.price)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={item.status as Status} />
                      </td>
                      <td className="px-4 py-3 text-xs tabular-nums" style={{ color: 'var(--ink-3)' }}>
                        <RelativeTime iso={item.createdAt} />
                      </td>
                      <td className="px-4 py-3">
                        <RowMenu
                          id={item.id}
                          slug={item.slug}
                          status={item.status as Status}
                          onStatus={(s) => statusMutation.mutate({ id: item.id, status: s })}
                          onDelete={() => {
                            if (confirm('Delete this listing?')) deleteMutation.mutate(item.id)
                          }}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-(--line-1) pt-6">
        <span className="meta-label" style={{ color: 'var(--ink-3)' }}>
          {isFetching ? 'Updating…' : `Page ${page} of ${totalPages}`}
        </span>
        <div className="flex gap-1">
          <PagerButton disabled={page <= 1} onClick={() => setPage((p) => p - 1)} icon={ChevronLeft} label="Previous" />
          <PagerButton disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} icon={ChevronRight} label="Next" iconEnd />
        </div>
      </div>
    </div>
  )
}

function CategoryChip({
  label,
  color,
  active,
  onClick,
}: {
  label: string
  color?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative inline-flex items-center gap-1.5 text-sm transition-colors',
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

function StatusPill({ status }: { status: Status }) {
  const m = STATUS_META[status]
  return (
    <span
      className="meta-label inline-flex h-6 items-center px-2"
      style={{ color: m.color, backgroundColor: m.bg }}
    >
      {m.label}
    </span>
  )
}

function RelativeTime({ iso }: { iso: string }) {
  const label = useMemo(() => {
    const date = new Date(iso)
    const diff = Date.now() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return date.toLocaleDateString()
  }, [iso])
  return <span title={new Date(iso).toLocaleString()}>{label}</span>
}

function BulkButton({
  onClick,
  icon: Icon,
  label,
  danger,
}: {
  onClick: () => void
  icon: typeof Home
  label: string
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 border px-3 text-xs font-medium transition-colors',
        danger
          ? 'border-(--red)/20 text-(--red) hover:bg-(--red)/10'
          : 'border-(--line-1) text-(--ink-1) hover:bg-background',
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
      {label}
    </button>
  )
}

function PagerButton({
  disabled,
  onClick,
  icon: Icon,
  label,
  iconEnd,
}: {
  disabled?: boolean
  onClick: () => void
  icon: typeof Home
  label: string
  iconEnd?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 border border-(--line-1) bg-background px-3 text-xs font-medium transition-colors',
        disabled ? 'cursor-not-allowed text-(--ink-4)' : 'text-(--ink-1) hover:bg-(--surface-2)',
      )}
    >
      {!iconEnd && <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />}
      {label}
      {iconEnd && <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />}
    </button>
  )
}

function RowMenu({
  id,
  slug,
  status,
  onStatus,
  onDelete,
}: {
  id: string
  slug: string
  status: Status
  onStatus: (s: Status) => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Row actions"
          className="flex h-8 w-8 items-center justify-center text-(--ink-3) hover:bg-(--surface-2) hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-none">
        <DropdownMenuItem asChild>
          <Link to="/admin/listings/$id" params={{ id }} className="flex items-center gap-2">
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} /> Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            to="/listing/$slug"
            params={{ slug }}
            target="_blank"
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} /> View public
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {status !== 'published' && (
          <DropdownMenuItem onSelect={() => onStatus('published')} className="flex items-center gap-2">
            <Eye className="h-3.5 w-3.5" strokeWidth={1.5} /> Publish
          </DropdownMenuItem>
        )}
        {status === 'published' && (
          <DropdownMenuItem onSelect={() => onStatus('draft')} className="flex items-center gap-2">
            <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} /> Unpublish
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => onStatus('archived')} className="flex items-center gap-2">
          <Archive className="h-3.5 w-3.5" strokeWidth={1.5} /> Archive
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={onDelete}
          className="flex items-center gap-2"
          style={{ color: 'var(--red)' }}
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
