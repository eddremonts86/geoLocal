import { m } from 'framer-motion'
import { ArrowRight, Heart, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { PropertyCardMetrics } from '@/modules/listings/cards/PropertyCard'
import { VehicleCardMetrics } from '@/modules/listings/cards/VehicleCard'
import { ServiceCardMetrics } from '@/modules/listings/cards/ServiceCard'
import { ExperienceCardMetrics } from '@/modules/listings/cards/ExperienceCard'
import { useFavorites } from '@/modules/favorites/ui/useFavorites'
import type { ListingListItem } from '@/modules/listings/model/types'
import {
  CATEGORY_ACCENT_VAR,
  EDITORIAL_EASE,
  formatListingPrice,
} from '@/modules/listings/model/display'

interface ListingCardProps {
  item: ListingListItem
  isActive?: boolean
  isFavorite?: boolean
  onSelect?: () => void
  onFavorite?: () => void
  variant?: 'default' | 'compact' | 'bubble'
}

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
const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = PLACEHOLDER
  e.currentTarget.onerror = null // prevent infinite loop if placeholder also fails
}

export function ListingCard({ item, isActive, isFavorite, onSelect, onFavorite, variant = 'default' }: ListingCardProps) {
  const { i18n, t } = useTranslation()
  const navigate = useNavigate()
  const accent = CATEGORY_ACCENT_VAR[item.category] ?? 'var(--amber-ink)'

  // Bubble variant self-wires favorites (MapView parent doesn't pass props).
  const favorites = useFavorites()
  const effectiveIsFavorite = onFavorite ? isFavorite : favorites.isFavorite(item.id)
  const effectiveOnFavorite = onFavorite ?? (() => favorites.toggle(item.id))

  // Select the listing (pans map, highlights in list) — does NOT navigate
  const handleCardClick = () => {
    onSelect?.()
  }

  // Explicit intent: go to detail page
  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate({ to: '/listing/$slug', params: { slug: item.slug } })
  }

  const { amount: formattedPrice, suffix: priceSuffix } = formatListingPrice(
    item.price,
    item.currency,
    item.pricePeriod,
    i18n.language,
  )

  // ─── Bubble variant (map popup) — editorial ───────────────────────

  if (variant === 'bubble') {
    return (
      <div className="w-56 overflow-hidden">
        {/* Hero image */}
        <div className="relative h-32 w-full overflow-hidden bg-(--surface-3)">
          <img
            src={item.coverUrl ?? PLACEHOLDER}
            alt=""
            className="h-full w-full object-cover"
            onError={handleImgError}
          />
          {/* Gradient overlay bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
          {/* Category badge — top left */}
          <span
            className="absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-white"
            style={{ backgroundColor: accent }}
          >
            {item.transactionType}
          </span>
          {/* Heart — top right */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              effectiveOnFavorite()
            }}
            aria-label={effectiveIsFavorite ? 'Remove from favorites' : 'Save to favorites'}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/85 backdrop-blur-sm transition-colors hover:bg-background"
          >
            <Heart
              className="h-3.5 w-3.5"
              strokeWidth={1.5}
              style={{
                fill: effectiveIsFavorite ? 'var(--red)' : 'transparent',
                stroke: effectiveIsFavorite ? 'var(--red)' : 'var(--ink-2)',
              }}
            />
          </button>
          {/* Price — bottom left, over gradient */}
          <div className="absolute bottom-2 left-2.5">
            <p className="font-display text-base font-semibold tabular-nums leading-tight text-white">
              {formattedPrice}
              {priceSuffix && (
                <span className="text-[0.65rem] font-normal opacity-80">{priceSuffix}</span>
              )}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-3 pb-3 pt-2.5">
          <p className="mb-0.5 line-clamp-2 text-xs font-medium leading-snug text-foreground">{item.title}</p>
          <p className="mb-2 text-[0.65rem]" style={{ color: 'var(--ink-3)' }}>
            {item.city}{item.neighborhood ? ` · ${item.neighborhood}` : ''}
          </p>

          {/* Category-specific specs */}
          {item.category === 'vehicle' && (
            <div className="mb-2.5 flex flex-wrap gap-x-2.5 gap-y-1">
              <span className="flex items-center gap-1 text-[0.65rem]" style={{ color: 'var(--ink-2)' }}>
                <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {item.year}
              </span>
              {item.mileageKm != null && (
                <span className="flex items-center gap-1 text-[0.65rem]" style={{ color: 'var(--ink-2)' }}>
                  <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 12l4-4"/></svg>
                  {(item.mileageKm / 1000).toFixed(0)}k km
                </span>
              )}
              {item.fuelType && (
                <span className="flex items-center gap-1 text-[0.65rem]" style={{ color: 'var(--ink-2)' }}>
                  <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 22V8a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14"/><path d="M14 8h2a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h0"/><line x1="3" y1="22" x2="16" y2="22"/></svg>
                  {item.fuelType}
                </span>
              )}
            </div>
          )}

          {item.category === 'property' && (
            <div className="mb-2.5 flex flex-wrap gap-x-2.5 gap-y-1">
              {item.bedrooms != null && (
                <span className="flex items-center gap-1 text-[0.65rem]" style={{ color: 'var(--ink-2)' }}>
                  <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 22V12a9 9 0 0 1 18 0v10"/><path d="M3 18h18"/></svg>
                  {item.bedrooms} hab.
                </span>
              )}
              {item.bathrooms != null && (
                <span className="flex items-center gap-1 text-[0.65rem]" style={{ color: 'var(--ink-2)' }}>
                  <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" y1="5" x2="8" y2="7"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
                  {item.bathrooms} baños
                </span>
              )}
              {item.areaSqm != null && (
                <span className="flex items-center gap-1 text-[0.65rem]" style={{ color: 'var(--ink-2)' }}>
                  <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="1"/></svg>
                  {item.areaSqm} m²
                </span>
              )}
            </div>
          )}

          {item.category === 'service' && item.responseTime && (
            <div className="mb-2.5">
              <span className="flex items-center gap-1 text-[0.65rem]" style={{ color: 'var(--ink-2)' }}>
                <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Responde en {item.responseTime}
              </span>
            </div>
          )}

          {item.category === 'experience' && (
            <div className="mb-2.5 flex flex-wrap gap-x-2.5 gap-y-1">
              {item.durationHours != null && (
                <span className="flex items-center gap-1 text-[0.65rem]" style={{ color: 'var(--ink-2)' }}>
                  <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {item.durationHours}h
                </span>
              )}
              {item.maxGuests != null && (
                <span className="flex items-center gap-1 text-[0.65rem]" style={{ color: 'var(--ink-2)' }}>
                  <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Máx. {item.maxGuests}
                </span>
              )}
            </div>
          )}

          <Button
            onClick={handleNavigate}
            className="h-8 w-full gap-1.5 rounded-lg text-xs font-medium"
          >
            {t('common.viewDetail', 'Ver detalle')}
            <ArrowRight className="h-3 w-3" />
          </Button>

          {/* Scraped source badge + link */}
          {item.scrapedSource && (
            <a
              href={item.scrapedSourceUrl ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-1.5 flex items-center gap-1 text-[0.6rem] font-medium underline-offset-2 hover:underline"
              style={{ color: SOURCE_COLORS[item.scrapedSource] ?? 'var(--ink-3)' }}
            >
              <ExternalLink className="h-2.5 w-2.5" />
              {SOURCE_LABELS[item.scrapedSource] ?? item.scrapedSource}
            </a>
          )}
        </div>
      </div>
    )
  }

  // ─── Compact variant (grid card) — Airbnb-style portrait ────────

  if (variant === 'compact') {
    return (
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="group cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative mb-2.5 aspect-[3/4] overflow-hidden rounded-xl bg-(--surface-3)">

          <img
            src={item.coverUrl ?? PLACEHOLDER}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            onError={handleImgError}
          />

          {/* Featured star — top left, only if no badge conflict */}
          {item.featured && (
            <div className="absolute left-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-[0.58rem] font-semibold text-white backdrop-blur-sm">
              ★ Featured
            </div>
          )}

          {/* Transaction type badge — bottom-left */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-2.5 pb-2 pt-6">
            <span
              className="rounded-full px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-wider text-white"
              style={{ backgroundColor: accent }}
            >
              {item.transactionType}
            </span>
          </div>

          {/* Heart — top right */}
          {onFavorite && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => { e.stopPropagation(); onFavorite() }}
              className="absolute right-2 top-2 rounded-full p-1 active:scale-90"
              aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart
                className={`h-4.5 w-4.5 drop-shadow transition-colors ${
                  isFavorite
                    ? 'fill-(--red) stroke-(--red)'
                    : 'fill-black/30 stroke-white'
                }`}
                strokeWidth={1.5}
              />
            </Button>
          )}
        </div>

        {/* ── Card body ── */}
        <div className="space-y-0.5">
          {/* Title */}
          <p className="truncate text-sm font-medium leading-snug text-foreground">{item.title}</p>

          {/* Price */}
          <p className="text-sm font-semibold tabular-nums text-foreground">
            {formattedPrice}
            {priceSuffix && (
              <span className="text-xs font-normal" style={{ color: 'var(--ink-3)' }}>
                {priceSuffix}
              </span>
            )}
          </p>

          {/* Location */}
          <p className="truncate text-xs" style={{ color: 'var(--ink-3)' }}>
            {item.city}{item.neighborhood ? ` · ${item.neighborhood}` : ''}
          </p>

          {/* Scraped source badge + link */}
          {item.scrapedSource && (
            <a
              href={item.scrapedSourceUrl ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-1 flex items-center gap-1 text-[0.6rem] font-medium underline-offset-2 hover:underline"
              style={{ color: SOURCE_COLORS[item.scrapedSource] ?? 'var(--ink-3)' }}
            >
              <ExternalLink className="h-2.5 w-2.5" />
              {SOURCE_LABELS[item.scrapedSource] ?? item.scrapedSource}
            </a>
          )}

          {/* Spec chips — wrapping, small pills */}
          <div className="flex flex-wrap gap-1 pt-1">
            {item.category === 'vehicle' && (
              <>
                <span className="rounded bg-(--surface-2) px-1.5 py-0.5 text-[0.6rem] text-(--ink-2)">{item.year}</span>
                {item.mileageKm != null && (
                  <span className="rounded bg-(--surface-2) px-1.5 py-0.5 text-[0.6rem] text-(--ink-2)">{(item.mileageKm / 1000).toFixed(0)}k km</span>
                )}
                {item.fuelType && (
                  <span className="rounded bg-(--surface-2) px-1.5 py-0.5 text-[0.6rem] text-(--ink-2)">{item.fuelType}</span>
                )}
                {item.transmission && (
                  <span className="rounded bg-(--surface-2) px-1.5 py-0.5 text-[0.6rem] text-(--ink-2)">{item.transmission}</span>
                )}
              </>
            )}
            {item.category === 'property' && (
              <>
                {item.bedrooms != null && (
                  <span className="rounded bg-(--surface-2) px-1.5 py-0.5 text-[0.6rem] text-(--ink-2)">{item.bedrooms} hab.</span>
                )}
                {item.bathrooms != null && (
                  <span className="rounded bg-(--surface-2) px-1.5 py-0.5 text-[0.6rem] text-(--ink-2)">{item.bathrooms} baños</span>
                )}
                {item.areaSqm != null && (
                  <span className="rounded bg-(--surface-2) px-1.5 py-0.5 text-[0.6rem] text-(--ink-2)">{item.areaSqm} m²</span>
                )}
              </>
            )}
            {item.category === 'service' && (
              <ServiceCardMetrics item={item as any} />
            )}
            {item.category === 'experience' && (
              <ExperienceCardMetrics item={item as any} />
            )}
          </div>
        </div>
      </m.div>
    )
  }

  // ─── Default variant — horizontal editorial row ──────────────────

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EDITORIAL_EASE }}
      className={`group relative flex cursor-pointer gap-4 border-b p-4 transition-colors ${
        isActive
          ? 'bg-(--surface-2)'
          : 'hover:bg-(--surface-2)'
      }`}
      style={{
        borderColor: 'var(--line-1)',
        borderLeftWidth: isActive ? '2px' : '0',
        borderLeftColor: isActive ? 'var(--amber)' : 'transparent',
        borderLeftStyle: 'solid',
        paddingLeft: isActive ? 'calc(1rem - 2px)' : '1rem',
      }}
      onClick={handleCardClick}
    >
      {/* Thumbnail — sharp corners, larger, magazine aspect */}
      <div className="relative h-28 w-28 shrink-0 overflow-hidden bg-(--surface-2) sm:h-32 sm:w-36">
        <img
          src={item.coverUrl ?? PLACEHOLDER}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
          onError={handleImgError}
        />
      </div>

      {/* Content — dense meta stack */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Meta line: category + transaction, uppercase tracked */}
            <div className="mb-1.5 flex items-center gap-2 text-[0.6875rem]">
              <span className="meta-label" style={{ color: accent }}>
                {item.transactionType}
              </span>
              <span className="meta-label" style={{ color: 'var(--ink-4)' }}>·</span>
              <span className="meta-label" style={{ color: 'var(--ink-3)' }}>
                {item.subCategory}
              </span>
            </div>
            {/* Title — serif, editorial */}
            <p className="font-display text-base font-medium leading-[1.2] tracking-[-0.015em] text-foreground line-clamp-2 sm:text-lg">
              {item.title}
            </p>
            {/* Location */}
            <p className="mt-1 text-xs" style={{ color: 'var(--ink-3)' }}>
              {item.city}{item.neighborhood ? ` · ${item.neighborhood}` : ''}
            </p>
          </div>
          {onFavorite && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => { e.stopPropagation(); onFavorite() }}
              className="shrink-0 rounded-full p-1 active:scale-90"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  isFavorite ? 'fill-(--red) text-(--red)' : ''
                }`}
                style={!isFavorite ? { color: 'var(--ink-3)' } : undefined}
                strokeWidth={1.5}
              />
            </Button>
          )}
        </div>

        {/* Price — tabular, prominent */}
        <p className="mt-2.5 font-sans text-base font-medium tabular-nums text-foreground sm:text-lg">
          {formattedPrice}
          {priceSuffix && (
            <span className="text-xs font-normal" style={{ color: 'var(--ink-3)' }}>{priceSuffix}</span>
          )}
        </p>

        {/* Category-specific metrics — bottom row */}
        <div className="mt-2">
          {item.category === 'property' && <PropertyCardMetrics item={item as any} />}
          {item.category === 'vehicle' && <VehicleCardMetrics item={item as any} />}
          {item.category === 'service' && <ServiceCardMetrics item={item as any} />}
          {item.category === 'experience' && <ExperienceCardMetrics item={item as any} />}
        </div>

        {/* Explicit detail CTA */}
        <Button
          variant="ghost"
          size="xs"
          onClick={handleNavigate}
          className="mt-2 h-auto gap-1 px-0 py-0 text-xs font-medium"
          style={{ color: 'var(--ink-3)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink-1)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-3)')}
        >
          {t('common.viewDetail', 'Ver')}
          <ArrowRight className="h-3 w-3" />
        </Button>

        {/* Scraped source badge + link — default/row variant */}
        {item.scrapedSource && (
          <a
            href={item.scrapedSourceUrl ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-1 flex items-center gap-1 text-[0.6rem] font-medium underline-offset-2 hover:underline"
            style={{ color: SOURCE_COLORS[item.scrapedSource] ?? 'var(--ink-3)' }}
          >
            <ExternalLink className="h-2.5 w-2.5" />
            {SOURCE_LABELS[item.scrapedSource] ?? item.scrapedSource}
          </a>
        )}
      </div>
    </m.div>
  )
}
