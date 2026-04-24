import { Link } from '@tanstack/react-router'
import { m } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ExternalLink, Heart } from 'lucide-react'
import { scrapedListingsQueryOptions } from '@/modules/listings/api/queries'
import { useFavorites } from '@/modules/favorites/ui/useFavorites'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { CATEGORY_ICONS, EDITORIAL_EASE as EASE, formatListingPrice } from '@/modules/listings/model/display'
import { Home } from 'lucide-react'

const SOURCE_LABELS: Record<string, string> = {
  airbnb: 'Airbnb',
  facebook: 'Facebook',
  'facebook-events': 'FB Events',
  linkedin: 'LinkedIn',
}

const SOURCE_COLORS: Record<string, string> = {
  airbnb: '#FF5A5F',
  facebook: '#1877F2',
  'facebook-events': '#9333EA',
  linkedin: '#0A66C2',
}

const PLACEHOLDER = '/img-placeholder.svg'

export function ScrapedCarousel() {
  const { i18n } = useTranslation()
  const { data: items, isLoading } = useQuery(scrapedListingsQueryOptions(16, i18n.language))
  const { isFavorite, toggle: toggleFavorite } = useFavorites()

  if (isLoading) {
    return (
      <div className="flex gap-6 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-72 shrink-0 space-y-3">
            <Skeleton className="aspect-3/2 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  if (!items?.length) return null

  return (
    <Carousel opts={{ align: 'start', loop: false }} className="w-full">
      <CarouselContent className="-ml-5">
        {items.map((item, i) => {
          const Icon = CATEGORY_ICONS[item.category] ?? Home
          const source = item.scrapedSource ?? ''
          const sourceLabel = SOURCE_LABELS[source] ?? source
          const sourceColor = SOURCE_COLORS[source] ?? 'var(--ink-3)'
          const { amount: priceLabel, suffix: periodSuffix } = formatListingPrice(
            item.price,
            item.currency,
            item.pricePeriod,
            i18n.language,
          )

          return (
            <CarouselItem
              key={item.id}
              className="pl-5 basis-[85%] sm:basis-[50%] lg:basis-[33%] xl:basis-[25%]"
            >
              <m.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.04, duration: 0.5, ease: EASE }}
              >
                <Link to="/listing/$slug" params={{ slug: item.slug }} className="group block">
                  {/* Landscape image — 3/2 ratio, wider feel */}
                  <div className="relative mb-4 aspect-3/2 overflow-hidden bg-(--surface-2)">
                    {item.coverUrl ? (
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.04]"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = PLACEHOLDER; e.currentTarget.onerror = null }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Icon className="h-8 w-8" style={{ color: 'var(--ink-4)' }} strokeWidth={1} />
                      </div>
                    )}
                    {/* Source badge — top-right */}
                    {source && (
                      <a
                        href={item.scrapedSourceUrl ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-none border border-white/20 bg-black/60 px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm transition-opacity hover:opacity-80"
                        style={{ color: sourceColor }}
                      >
                        {sourceLabel}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                    {/* Heart overlay — top-left to avoid source badge */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(item.id)
                      }}
                      aria-label={isFavorite(item.id) ? 'Remove from favorites' : 'Save to favorites'}
                      className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center bg-background/80 backdrop-blur-sm transition-colors hover:bg-background"
                    >
                      <Heart
                        className="h-3.5 w-3.5"
                        strokeWidth={1.5}
                        style={{
                          fill: isFavorite(item.id) ? 'var(--red)' : 'transparent',
                          stroke: isFavorite(item.id) ? 'var(--red)' : 'var(--ink-2)',
                        }}
                      />
                    </button>
                  </div>

                  {/* Meta */}
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <span className="meta-label" style={{ color: 'var(--ink-3)' }}>
                      {item.city}
                    </span>
                    <span className="meta-label" style={{ color: 'var(--ink-4)' }}>
                      {item.category}
                    </span>
                  </div>

                  <h3 className="font-display line-clamp-2 text-base font-medium leading-[1.2] tracking-[-0.01em] text-foreground transition-colors group-hover:text-(--amber-ink) md:text-lg">
                    {item.title}
                  </h3>

                  <p className="mt-1.5 font-sans text-sm tabular-nums" style={{ color: 'var(--ink-2)' }}>
                    {priceLabel}
                    {periodSuffix && <span style={{ color: 'var(--ink-3)' }}>{periodSuffix}</span>}
                  </p>
                </Link>
              </m.div>
            </CarouselItem>
          )
        })}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex -left-2 h-10 w-10 rounded-none border-border bg-background shadow-none" />
      <CarouselNext className="hidden sm:flex -right-2 h-10 w-10 rounded-none border-border bg-background shadow-none" />
    </Carousel>
  )
}
