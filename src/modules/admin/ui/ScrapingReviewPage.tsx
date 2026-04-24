import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { m } from 'framer-motion'
import {
  Globe, Check, X, Eye, ChevronLeft, ChevronRight, Sparkles,
  Home, Wrench, ExternalLink, RefreshCw, Code2, MapPin, Calendar,
  Tag, ImageOff, CheckCheck, Loader2,
} from 'lucide-react'
import {
  listScrapedRawFn,
  rejectScrapedItemFn,
  publishScrapedItemFn,
  publishAllPendingFn,
  getScrapedRawItemFn,
} from '@/modules/admin/api/scraped-items.fn'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

// ─── Types ────────────────────────────────────────────────────────────────────

type ScrapedSource =
  | 'airbnb' | 'facebook' | 'facebook-events' | 'linkedin'
  | 'edc' | 'homestra' | 'boligsiden' | 'boliga'
type ScrapedStatus = 'pending' | 'reviewed' | 'published' | 'rejected'

interface ScrapedRowItem {
  id: string
  source: ScrapedSource
  sourceId: string
  sourceUrl: string
  mappedCategory: string | null
  status: ScrapedStatus
  publishedListingId: string | null
  scrapedAt: Date
  // preview fields extracted from rawData
  title: string | null
  imageUrl: string | null
  city: string | null
  price: number | null
  description: string | null
  startDate: string | null
  currency: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sourceColors: Record<ScrapedSource, string> = {
  airbnb: 'bg-rose-500/10 text-rose-600',
  facebook: 'bg-blue-500/10 text-blue-600',
  'facebook-events': 'bg-purple-500/10 text-purple-600',
  linkedin: 'bg-sky-500/10 text-sky-600',
  edc: 'bg-amber-500/10 text-amber-700',
  homestra: 'bg-teal-500/10 text-teal-700',
  boligsiden: 'bg-emerald-500/10 text-emerald-700',
  boliga: 'bg-indigo-500/10 text-indigo-700',
}

const sourceLabels: Record<ScrapedSource, string> = {
  airbnb: 'Airbnb',
  facebook: 'Facebook',
  'facebook-events': 'FB Events',
  linkedin: 'LinkedIn',
  edc: 'EDC',
  homestra: 'Homestra',
  boligsiden: 'Boligsiden',
  boliga: 'Boliga',
}

const statusColors: Record<ScrapedStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600',
  reviewed: 'bg-blue-500/10 text-blue-600',
  published: 'bg-green-500/10 text-green-600',
  rejected: 'bg-gray-500/10 text-gray-500',
}

const categoryIcons: Record<string, React.ElementType> = {
  property: Home,
  service: Wrench,
  experience: Sparkles,
}

const categoryColors: Record<string, string> = {
  property: 'text-amber-600',
  service: 'text-blue-600',
  experience: 'text-purple-600',
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const row = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.22 } } }

function formatPrice(price: number | null, currency: string | null): string | null {
  if (price == null || price === 0) return null
  const c = currency ?? 'DKK'
  return new Intl.NumberFormat('da-DK', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(price)
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return null
  }
}

const PLACEHOLDER = '/img-placeholder.svg'

// ─── Listing preview dialog ────────────────────────────────────────────────────

function ListingPreviewDialog({ item, open, onClose }: {
  item: ScrapedRowItem | null
  open: boolean
  onClose: () => void
}) {
  if (!item) return null
  const CatIcon = categoryIcons[item.mappedCategory ?? 'service'] ?? Wrench
  const catColor = categoryColors[item.mappedCategory ?? 'service'] ?? 'text-blue-600'
  const priceStr = formatPrice(item.price, item.currency)
  const dateStr = formatDate(item.startDate)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Listing preview</DialogTitle>
        </DialogHeader>

        {/* Hero image */}
        <div className="relative h-52 w-full bg-surface overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => { e.currentTarget.src = PLACEHOLDER; e.currentTarget.onerror = null }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface-2">
              <ImageOff className="h-10 w-10 text-muted/40" />
            </div>
          )}
          {/* Category chip */}
          <span className={`absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold shadow-sm ${catColor}`}>
            <CatIcon className="h-3 w-3" />
            <span className="capitalize">{item.mappedCategory ?? 'listing'}</span>
          </span>
          {/* Price chip */}
          {priceStr && (
            <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-foreground shadow">
              {priceStr}
            </span>
          )}
          {/* Source badge */}
          <span className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${sourceColors[item.source]}`}>
            {sourceLabels[item.source]}
          </span>
        </div>

        {/* Body */}
        <div className="px-5 pb-5 pt-4 space-y-3">
          <div>
            <h2 className="font-display text-lg font-semibold leading-snug text-foreground">
              {item.title ?? item.sourceId}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              {item.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {item.city}
                </span>
              )}
              {dateStr && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {dateStr}
                </span>
              )}
              {!item.city && !dateStr && (
                <span className="italic">No location data</span>
              )}
            </div>
          </div>

          {item.description && (
            <p className="text-sm text-foreground/70 leading-relaxed line-clamp-4">
              {item.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-2 pt-1">
            <Badge className={`text-xs ${statusColors[item.status]}`}>{item.status}</Badge>
            {priceStr && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <Tag className="h-3 w-3" />
                {priceStr}
              </span>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-border px-5 py-3 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>Close</Button>
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Source
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Raw data dialog ──────────────────────────────────────────────────────────

function RawDataDialog({ id, open, onClose }: { id: string | null; open: boolean; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'scraped', 'raw', id],
    queryFn: () => getScrapedRawItemFn({ data: { id: id! } }),
    enabled: open && !!id,
  })

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Raw scraped data</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto rounded border border-border bg-surface p-4 text-xs font-mono">
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : data ? (
            <pre className="whitespace-pre-wrap break-all text-foreground/80">
              {typeof data.rawData === 'string' ? data.rawData : JSON.stringify(data.rawData, null, 2)}
            </pre>
          ) : (
            <p className="text-muted">Not found</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          {data && (
            <Button variant="outline" size="sm" asChild>
              <a href={String(data.sourceUrl ?? '')} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Open source
              </a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ScrapingReviewPage() {
  const queryClient = useQueryClient()

  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [previewItem, setPreviewItem] = useState<ScrapedRowItem | null>(null)
  const [rawId, setRawId] = useState<string | null>(null)
  const [publishAllConfirm, setPublishAllConfirm] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'scraped', { sourceFilter, statusFilter, page }],
    queryFn: () =>
      listScrapedRawFn({
        data: {
          source: sourceFilter !== 'all' ? (sourceFilter as ScrapedSource) : undefined,
          status: statusFilter !== 'all' ? (statusFilter as ScrapedStatus) : undefined,
          page,
          pageSize,
        },
      }),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'scraped'] })

  const publishMutation = useMutation({
    mutationFn: (id: string) => publishScrapedItemFn({ data: { id } }),
    onSuccess: invalidate,
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectScrapedItemFn({ data: { id } }),
    onSuccess: invalidate,
  })

  const publishAllMutation = useMutation({
    mutationFn: () =>
      publishAllPendingFn({
        data: { source: sourceFilter !== 'all' ? (sourceFilter as ScrapedSource) : undefined },
      }),
    onSuccess: (result) => {
      invalidate()
      setPublishAllConfirm(false)
      // Admin UX: toast the result (keeping silent for now — could hook into a toast system)
      void result
    },
  })

  const items = (data?.items ?? []) as ScrapedRowItem[]
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-5 w-5 text-muted" />
            <h1 className="font-display text-2xl text-foreground">Scraped Items Review</h1>
          </div>
          <p className="text-sm text-muted">
            Review items collected from Airbnb, Facebook, and LinkedIn before publishing.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => setPublishAllConfirm(true)}
            disabled={total === 0 || statusFilter === 'published' || statusFilter === 'rejected'}
          >
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
            Publish All ({total})
          </Button>
        </div>
      </m.div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4 flex flex-wrap gap-3">
          <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setPage(1) }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="airbnb">Airbnb</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="facebook-events">FB Events</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <span className="ml-auto text-sm text-muted self-center">{total} total items</span>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Scraped items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-16 w-20 rounded-md shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-muted text-sm">
              No items match the current filters.
            </div>
          ) : (
            <m.div variants={stagger} initial="hidden" animate="show" className="divide-y divide-border">
              {items.map((item) => {
                const CatIcon = categoryIcons[item.mappedCategory ?? 'service'] ?? Wrench
                const catColor = categoryColors[item.mappedCategory ?? 'service'] ?? 'text-blue-600'
                const isPending = item.status === 'pending' || item.status === 'reviewed'
                const isProcessing = publishMutation.isPending || rejectMutation.isPending
                const priceStr = formatPrice(item.price, item.currency)
                const dateStr = formatDate(item.startDate)

                return (
                  <m.div
                    key={item.id}
                    variants={row}
                    className="flex items-start gap-4 px-4 py-3 hover:bg-surface/60 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="shrink-0 h-16 w-20 rounded-md overflow-hidden bg-surface-2 border border-border/50">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => { e.currentTarget.src = PLACEHOLDER; e.currentTarget.onerror = null }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageOff className="h-5 w-5 text-muted/30" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground leading-snug">
                          {item.title ?? item.sourceId}
                        </p>
                        <Badge className={`text-xs shrink-0 ${sourceColors[item.source]}`}>
                          {sourceLabels[item.source]}
                        </Badge>
                        <Badge className={`text-xs shrink-0 ${statusColors[item.status as ScrapedStatus]}`}>
                          {item.status}
                        </Badge>
                      </div>

                      {/* Description */}
                      {item.description && (
                        <p className="mt-0.5 text-xs text-muted line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {/* Meta row */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                        <span className={`flex items-center gap-1 font-medium ${catColor}`}>
                          <CatIcon className="h-3 w-3" />
                          <span className="capitalize">{item.mappedCategory ?? '—'}</span>
                        </span>
                        {item.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.city}
                          </span>
                        )}
                        {dateStr && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {dateStr}
                          </span>
                        )}
                        {priceStr && (
                          <span className="flex items-center gap-1 font-medium text-foreground/70">
                            <Tag className="h-3 w-3" />
                            {priceStr}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex items-center gap-1 pt-0.5">
                      {/* Preview as listing */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="Preview as listing"
                        onClick={() => setPreviewItem(item)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>

                      {/* Raw JSON */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted"
                        title="View raw data"
                        onClick={() => setRawId(item.id)}
                      >
                        <Code2 className="h-3.5 w-3.5" />
                      </Button>

                      {isPending && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-green-600 hover:text-green-700"
                            title="Publish as draft listing"
                            disabled={isProcessing}
                            onClick={() => publishMutation.mutate(item.id)}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive/80"
                            title="Reject"
                            disabled={isProcessing}
                            onClick={() => rejectMutation.mutate(item.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </m.div>
                )
              })}
            </m.div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Listing preview dialog */}
      <ListingPreviewDialog
        item={previewItem}
        open={!!previewItem}
        onClose={() => setPreviewItem(null)}
      />

      {/* Raw data dialog */}
      <RawDataDialog
        id={rawId}
        open={!!rawId}
        onClose={() => setRawId(null)}
      />

      {/* Publish All confirmation dialog */}
      <Dialog open={publishAllConfirm} onOpenChange={(v) => !v && setPublishAllConfirm(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-lg flex items-center gap-2">
              <CheckCheck className="h-5 w-5 text-green-600" />
              Publish All Pending
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted leading-relaxed">
            This will publish <strong className="text-foreground">{total} items</strong>
            {sourceFilter !== 'all' && (
              <> from <strong className="text-foreground">{sourceFilter}</strong></>
            )}{' '}
            directly to the explore page. This cannot be undone in bulk.
          </p>
          {publishAllMutation.data && (
            <p className="text-sm text-green-600 font-medium">
              ✓ Published {publishAllMutation.data.published} items
              {publishAllMutation.data.skipped > 0 && ` · ${publishAllMutation.data.skipped} errors`}
            </p>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setPublishAllConfirm(false)}
              disabled={publishAllMutation.isPending}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={publishAllMutation.isPending}
              onClick={() => publishAllMutation.mutate()}
            >
              {publishAllMutation.isPending ? (
                <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Publishing...</>
              ) : (
                <><CheckCheck className="mr-1.5 h-3.5 w-3.5" />Confirm Publish All</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

