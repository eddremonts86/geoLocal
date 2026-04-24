import { Link } from '@tanstack/react-router'
import { m } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { featuredListingsQueryOptions } from '@/modules/listings/api/queries'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { Home, Heart } from 'lucide-react'
import { useFavorites } from '@/modules/favorites/ui/useFavorites'
import {
  CATEGORY_ACCENT_VAR,
  CATEGORY_ICONS,
  EDITORIAL_EASE as EASE,
  formatListingPrice,
} from '@/modules/listings/model/display'

export function FeaturedCarousel() {
  const { i18n } = useTranslation()
  const { data: featured, isLoading } = useQuery(featuredListingsQueryOptions(12, i18n.language))
  const { isFavorite, toggle: toggleFavorite } = useFavorites()

  if (isLoading) {
    return (
      <div className="flex gap-6 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-80 shrink-0 space-y-3">
            <Skeleton className="aspect-[4/5] w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  if (!featured?.length) return null

  return (
    <Carousel opts={{ align: 'start', loop: false }} className="w-full">
      <CarouselContent className="-ml-6">
        {featured.map((item, i) => {
          const Icon = CATEGORY_ICONS[item.category] ?? Home
          const accent = CATEGORY_ACCENT_VAR[item.category] ?? 'var(--amber-ink)'
          const { amount: priceLabel, suffix: periodSuffix } = formatListingPrice(
            item.price,
            item.currency,
            item.pricePeriod,
            i18n.language,
          )

          return (
            <CarouselItem
              key={item.id}
              className="pl-6 basis-[78%] sm:basis-[45%] lg:basis-[32%] xl:basis-[25%]"
            >
              <m.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.04, duration: 0.5, ease: EASE }}
              >
                <Link
                  to="/listing/$slug"
                  params={{ slug: item.slug }}
                  className="group block"
                >
                  {/* Editorial tall image — portrait 4/5, no border, no rounded-xl */}
                  <div className="relative mb-5 aspect-[4/5] overflow-hidden bg-[var(--surface-2)]">
                    {item.coverUrl ? (
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Icon className="h-10 w-10" style={{ color: 'var(--ink-4)' }} strokeWidth={1} />
                      </div>
                    )}
                    {/* Editorial category + price overlay — bottom-left, no badge pill */}
                    <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-[var(--surface-0)]">
                      <span className="meta-label" style={{ color: 'oklch(1 0 0 / 0.9)' }}>
                        {item.category}
                      </span>
                    </div>
                    {/* Heart overlay */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(item.id)
                      }}
                      aria-label={isFavorite(item.id) ? 'Remove from favorites' : 'Save to favorites'}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-background/80 backdrop-blur-sm transition-colors hover:bg-background"
                    >
                      <Heart
                        className="h-4 w-4"
                        strokeWidth={1.5}
                        style={{
                          fill: isFavorite(item.id) ? 'var(--red)' : 'transparent',
                          stroke: isFavorite(item.id) ? 'var(--red)' : 'var(--ink-2)',
                        }}
                      />
                    </button>
                  </div>

                  {/* Meta line */}
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <span className="meta-label" style={{ color: accent }}>
                      {item.city}
                    </span>
                    <span className="meta-label" style={{ color: 'var(--ink-4)' }}>
                      {item.subCategory}
                    </span>
                  </div>

                  {/* Title — serif, strong */}
                  <h3 className="font-display text-lg font-medium leading-[1.15] tracking-[-0.015em] text-foreground transition-colors duration-300 group-hover:text-[var(--amber-ink)] md:text-xl">
                    {item.title}
                  </h3>

                  {/* Price — tabular */}
                  <p className="mt-2 font-sans text-sm tabular-nums" style={{ color: 'var(--ink-2)' }}>
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
