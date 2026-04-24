import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { m, AnimatePresence } from 'framer-motion'
import { ListingCard } from './ListingCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import type { ListingListItem } from '@/modules/listings/model/types'

interface ListingListProps {
  items: ListingListItem[]
  isLoading: boolean
  isError: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  onLoadMore: () => void
  activeId?: string | null
  onSelect: (id: string) => void
  onFavorite?: (id: string) => void
  favoriteIds?: Set<string>
  total: number
  layout?: 'list' | 'grid'
}

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3 },
  }),
}

export function ListingList({
  items, isLoading, isError, isFetchingNextPage, hasNextPage,
  onLoadMore, activeId, onSelect, onFavorite, favoriteIds,
  layout = 'list',
}: ListingListProps) {
  const { t } = useTranslation()
  const sentinelRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) return
    // Find the scrollable parent (overflow-y-auto or overflow auto/scroll)
    let scrollParent: HTMLElement | null = sentinelRef.current.parentElement
    while (scrollParent) {
      const style = getComputedStyle(scrollParent)
      if (
        style.overflowY === 'auto' || style.overflowY === 'scroll' ||
        style.overflow === 'auto' || style.overflow === 'scroll'
      ) break
      scrollParent = scrollParent.parentElement
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore()
        }
      },
      { root: scrollParent, rootMargin: '400px' },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, onLoadMore])

  if (isLoading) {
    return (
      <div className={layout === 'grid' ? 'grid gap-2 p-3 [grid-template-columns:repeat(auto-fill,minmax(148px,1fr))]' : 'flex flex-col gap-0 p-0'}>
        {Array.from({ length: layout === 'grid' ? 8 : 6 }).map((_, i) => (
          <Skeleton key={i} className={layout === 'grid' ? 'aspect-[3/4] w-full rounded-xl' : 'h-28 w-full rounded-xl'} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-muted-foreground">{t('property.errorLoading', 'Could not load listings')}</p>
        <Button variant="outline" size="sm" onClick={onLoadMore}>
          {t('common.retry', 'Retry')}
        </Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-8 text-center">
        <p className="text-muted-foreground">{t('property.noResults', 'No listings found')}</p>
        <p className="text-sm text-muted-foreground">{t('property.tryAdjustingFilters', 'Try adjusting your filters')}</p>
      </div>
    )
  }

  return (
    <div className={layout === 'grid' ? 'grid grid-cols-2 gap-3 p-4 sm:grid-cols-3' : 'flex flex-col gap-3 p-4'}>
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => (
          <m.div
            key={item.id}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.95 }}
            layout
          >
            <ListingCard
              item={item}
              isActive={activeId === item.id}
              isFavorite={favoriteIds?.has(item.id)}
              onSelect={() => onSelect(item.id)}
              onFavorite={onFavorite ? () => onFavorite(item.id) : undefined}
              variant={layout === 'grid' ? 'compact' : 'default'}
            />
          </m.div>
        ))}
      </AnimatePresence>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="col-span-full h-1" />

      {isFetchingNextPage && (
        <div className={layout === 'grid' ? 'col-span-full flex flex-col gap-3' : 'flex flex-col gap-3'}>
          {Array.from({ length: layout === 'grid' ? 4 : 3 }).map((_, i) => (
            <Skeleton key={`loading-${i}`} className={layout === 'grid' ? 'aspect-4/5 w-full' : 'h-28 w-full rounded-xl'} />
          ))}
        </div>
      )}
    </div>
  )
}
