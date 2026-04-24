import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { similarListingsQueryOptions } from '@/modules/listings/api/queries'
import { ListingCard } from '@/modules/listings/ui/ListingCard'
import type { ListingCategory, ListingListItem } from '@/modules/listings/model/types'

interface ListingSimilarProps {
  category: ListingCategory
  city: string | undefined
  excludeId: string
  sectionNumber?: string
}

/** Row of 3 compact cards with listings matching the same category (and city, when possible). */
export function ListingSimilar({ category, city, excludeId, sectionNumber = '05' }: ListingSimilarProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { data: items, isLoading } = useQuery(
    similarListingsQueryOptions(category, city, excludeId, 3, i18n.language),
  )

  if (!isLoading && (!items || items.length === 0)) return null

  return (
    <section className="mt-16 md:mt-24">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="meta-label mb-2">{sectionNumber} / {t('listing.similar', 'You may also like')}</div>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            {city
              ? t('listing.moreInCity', { defaultValue: 'More in {{city}}', city })
              : t('listing.moreLike', 'More like this')}
          </h2>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/explore', search: { category } as never })}
          className="h-auto gap-1 rounded-none px-0 py-0 text-sm hover:bg-transparent"
          style={{ color: 'var(--amber-ink)' }}
        >
          <span className="meta-label">{t('common.exploreAll', 'Explore all')}</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-[3/4] animate-pulse bg-(--surface-2)" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {items?.map((it) => (
            <ListingCard
              key={it.id}
              item={it as unknown as ListingListItem}
              variant="compact"
              onSelect={() => navigate({ to: '/listing/$slug', params: { slug: it.slug } })}
            />
          ))}
        </div>
      )}
    </section>
  )
}
