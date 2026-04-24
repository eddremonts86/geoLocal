import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@clerk/tanstack-react-start'
import { ArrowUpRight, Heart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { favoritesListQueryOptions, favoriteKeys } from '@/modules/favorites/api/queries'
import { clearFavoritesFn } from '@/modules/favorites/api/favorites.fn'
import { useFavorites } from '@/modules/favorites/ui/useFavorites'

export const Route = createFileRoute('/_public/favorites')({
  component: FavoritesPage,
})

function FavoritesPage() {
  const { t, i18n } = useTranslation()
  const { isSignedIn, isLoaded } = useAuth()
  const qc = useQueryClient()
  const { toggle, isFavorite } = useFavorites()

  const { data, isLoading } = useQuery({
    ...favoritesListQueryOptions(i18n.language === 'es' ? 'es' : 'en', 60, 0),
    enabled: isLoaded && !!isSignedIn,
  })

  const clearMutation = useMutation({
    mutationFn: () => clearFavoritesFn({ data: {} }),
    onSuccess: () => qc.invalidateQueries({ queryKey: favoriteKeys.all }),
  })

  // ─── Signed-out state ──────────────────────────────────────────────────────
  if (isLoaded && !isSignedIn) {
    return (
      <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32">
        <span className="meta-label">01 · {t('favorites.label', 'Favorites')}</span>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,1.8rem+3.2vw,5rem)] font-medium leading-[0.95] tracking-[-0.02em] text-foreground">
          {t('favorites.signedOutTitle', 'Save what you love.')}
        </h1>
        <p
          className="mt-6 max-w-xl text-lg leading-relaxed"
          style={{ color: 'var(--ink-2)' }}
        >
          {t(
            'favorites.signedOutLede',
            'Sign in to save properties, vehicles, services, and experiences you want to come back to.',
          )}
        </p>
        <Link
          to="/sign-in"
          className="mt-10 inline-flex items-center gap-2 bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-(--amber-ink)"
        >
          {t('favorites.signIn', 'Sign in')}
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </section>
    )
  }

  const items = data?.items ?? []

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24">
      {/* Header */}
      <div className="mb-12 flex items-end justify-between gap-6 md:mb-16">
        <div className="space-y-2">
          <span className="meta-label">01 · {t('favorites.label', 'Favorites')}</span>
          <h1 className="font-display text-[clamp(2rem,1.6rem+2vw,3.5rem)] font-medium leading-none tracking-[-0.02em] text-foreground">
            {t('favorites.title', 'Your shortlist')}
          </h1>
          <p className="text-sm tabular-nums" style={{ color: 'var(--ink-3)' }}>
            {isLoading
              ? t('favorites.loading', 'Loading…')
              : t('favorites.count', '{{count}} saved', { count: data?.total ?? 0 })}
          </p>
        </div>

        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="meta-label rounded-none"
            style={{ color: 'var(--ink-3)' }}
            onClick={() => {
              if (confirm(t('favorites.clearConfirm', 'Clear all favorites?'))) {
                clearMutation.mutate()
              }
            }}
            disabled={clearMutation.isPending}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} />
            {t('favorites.clearAll', 'Clear all')}
          </Button>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse bg-(--surface-2)" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="border border-(--line-1) bg-(--surface-2) px-6 py-20 text-center md:py-28">
          <Heart className="mx-auto mb-6 h-8 w-8" strokeWidth={1} style={{ color: 'var(--ink-4)' }} />
          <h2 className="font-display text-3xl font-medium tracking-[-0.01em]">
            {t('favorites.emptyTitle', 'Nothing saved yet.')}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed" style={{ color: 'var(--ink-3)' }}>
            {t(
              'favorites.emptyLede',
              'Tap the heart on any listing — properties, vehicles, services, or experiences — to gather them here.',
            )}
          </p>
          <Link
            to="/explore"
            className="mt-8 inline-flex items-center gap-2 border border-foreground px-5 py-2.5 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
          >
            {t('favorites.exploreCta', 'Start exploring')}
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      )}

      {/* Grid */}
      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <FavoriteCard
              key={item.id}
              item={item}
              isFavorite={isFavorite(item.id)}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

interface FavoriteCardProps {
  item: {
    id: string
    slug: string
    title: string
    coverUrl: string | null
    price: number
    currency: string
    city: string
    category: string
    subCategory: string
  }
  isFavorite: boolean
  onToggle: () => void
}

function FavoriteCard({ item, isFavorite, onToggle }: FavoriteCardProps) {
  return (
    <div className="group relative">
      <Link
        to="/listing/$slug"
        params={{ slug: item.slug }}
        className="block overflow-hidden bg-(--surface-2)"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {item.coverUrl ? (
            <img
              src={item.coverUrl}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-(--surface-3)" />
          )}
          {/* Heart overlay */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggle()
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-background/80 backdrop-blur-sm transition-colors hover:bg-background"
          >
            <Heart
              className="h-4 w-4 transition-colors"
              strokeWidth={1.5}
              style={{
                fill: isFavorite ? 'var(--red)' : 'transparent',
                stroke: isFavorite ? 'var(--red)' : 'var(--ink-2)',
              }}
            />
          </button>
        </div>
      </Link>

      <Link to="/listing/$slug" params={{ slug: item.slug }} className="mt-4 block">
        <span className="meta-label" style={{ color: 'var(--ink-3)' }}>
          {item.category} · {item.city}
        </span>
        <h3 className="mt-1.5 font-display text-xl font-medium leading-tight tracking-[-0.01em] line-clamp-2 text-foreground">
          {item.title}
        </h3>
        <p className="mt-2 text-sm tabular-nums" style={{ color: 'var(--ink-2)' }}>
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: item.currency,
            maximumFractionDigits: 0,
          }).format(item.price)}
        </p>
      </Link>
    </div>
  )
}
