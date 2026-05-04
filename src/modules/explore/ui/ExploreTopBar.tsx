import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Home, Car, Wrench, Sparkles, SlidersHorizontal, ArrowUpDown, X, Search } from 'lucide-react'
import { m, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { Badge } from '@/components/ui/badge'
import type { ListingCategory, SortOption, TransactionType, FuelType, TransmissionType } from '@/modules/listings/model/types'

const SORT_OPTIONS: { value: SortOption; labelKey: string }[] = [
  { value: 'popular', labelKey: 'explore.popular' },
  { value: 'newest', labelKey: 'explore.newest' },
  { value: 'price_asc', labelKey: 'explore.priceAsc' },
  { value: 'price_desc', labelKey: 'explore.priceDesc' },
]

interface ActiveFilter {
  key: string
  label: string
  onRemove: () => void
}

interface ExploreTopBarProps {
  category: ListingCategory | null
  onCategoryChange: (cat: ListingCategory | null) => void
  sort: SortOption | null
  onSortChange: (sort: SortOption) => void
  total: number
  activeFilterCount: number
  onFiltersOpen: () => void
  // Free-text search
  query: string
  onQueryChange: (v: string) => void
  // Active filter chips
  subCategory: string[] | null
  transactionType: TransactionType | null
  priceMin: number | null
  priceMax: number | null
  beds: string[] | null
  baths: number | null
  areaMin: number | null
  areaMax: number | null
  make: string[] | null
  yearMin: number | null
  fuelType: FuelType[] | null
  transmission: TransmissionType | null
  experienceMin: number | null
  // Remove handlers
  onSubCategoryChange: (v: string[] | null) => void
  onTransactionTypeChange: (v: TransactionType | null) => void
  onPriceMinChange: (v: number | null) => void
  onPriceMaxChange: (v: number | null) => void
  onBedsChange: (v: string[] | null) => void
  onBathsChange: (v: number | null) => void
  onAreaMinChange: (v: number | null) => void
  onAreaMaxChange: (v: number | null) => void
  onMakeChange: (v: string[] | null) => void
  onYearMinChange: (v: number | null) => void
  onFuelTypeChange: (v: FuelType[] | null) => void
  onTransmissionChange: (v: TransmissionType | null) => void
  onExperienceMinChange: (v: number | null) => void
  onClearAll: () => void
}

const CATEGORY_META = [
  { value: null, icon: null, labelKey: 'explore.allCategories' },
  { value: 'property' as ListingCategory, icon: Home, labelKey: 'explore.properties' },
  { value: 'vehicle' as ListingCategory, icon: Car, labelKey: 'explore.vehicles' },
  { value: 'service' as ListingCategory, icon: Wrench, labelKey: 'explore.services' },
  { value: 'experience' as ListingCategory, icon: Sparkles, labelKey: 'explore.experiences' },
] as const

function buildActiveChips(props: ExploreTopBarProps): ActiveFilter[] {
  const chips: ActiveFilter[] = []

  if (props.transactionType) {
    chips.push({
      key: 'tx',
      label: props.transactionType === 'buy' ? 'Buy' : props.transactionType === 'rent' ? 'Rent' : 'Hire',
      onRemove: () => props.onTransactionTypeChange(null),
    })
  }
  if (props.priceMin != null) {
    chips.push({ key: 'priceMin', label: `From ${props.priceMin.toLocaleString()} DKK`, onRemove: () => props.onPriceMinChange(null) })
  }
  if (props.priceMax != null) {
    chips.push({ key: 'priceMax', label: `To ${props.priceMax.toLocaleString()} DKK`, onRemove: () => props.onPriceMaxChange(null) })
  }
  if (props.beds?.length) {
    chips.push({ key: 'beds', label: `${props.beds.join(', ')} beds`, onRemove: () => props.onBedsChange(null) })
  }
  if (props.baths != null) {
    chips.push({ key: 'baths', label: `${props.baths}+ baths`, onRemove: () => props.onBathsChange(null) })
  }
  if (props.areaMin != null) {
    chips.push({ key: 'areaMin', label: `From ${props.areaMin} m²`, onRemove: () => props.onAreaMinChange(null) })
  }
  if (props.areaMax != null) {
    chips.push({ key: 'areaMax', label: `To ${props.areaMax} m²`, onRemove: () => props.onAreaMaxChange(null) })
  }
  if (props.make?.length) {
    chips.push({ key: 'make', label: props.make.join(', '), onRemove: () => props.onMakeChange(null) })
  }
  if (props.subCategory?.length) {
    chips.push({ key: 'subcat', label: props.subCategory.join(', '), onRemove: () => props.onSubCategoryChange(null) })
  }
  if (props.yearMin != null) {
    chips.push({ key: 'yearMin', label: `From ${props.yearMin}`, onRemove: () => props.onYearMinChange(null) })
  }
  if (props.fuelType?.length) {
    chips.push({ key: 'fuel', label: props.fuelType.join(', '), onRemove: () => props.onFuelTypeChange(null) })
  }
  if (props.transmission) {
    chips.push({ key: 'tx-type', label: props.transmission, onRemove: () => props.onTransmissionChange(null) })
  }
  if (props.experienceMin != null) {
    chips.push({ key: 'exp', label: `${props.experienceMin}+ yrs exp.`, onRemove: () => props.onExperienceMinChange(null) })
  }
  return chips
}

export function ExploreTopBar(props: ExploreTopBarProps) {
  const { t } = useTranslation()
  const categoryScrollRef = useRef<HTMLDivElement>(null)
  const chips = buildActiveChips(props)

  // Local input state — debounced into the URL via `onQueryChange` so typing
  // feels snappy and doesn't churn the router on every keystroke.
  const [localQuery, setLocalQuery] = useState(props.query ?? '')
  useEffect(() => {
    // Sync down when the URL changes externally (e.g. category nav links).
    setLocalQuery(props.query ?? '')
  }, [props.query])
  useEffect(() => {
    if ((localQuery ?? '') === (props.query ?? '')) return
    const id = setTimeout(() => props.onQueryChange(localQuery ?? ''), 250)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQuery])

  return (
    <div className="shrink-0 border-b border-border bg-background">
      {/* Main row: categories + controls */}
      <div className="flex items-center gap-4 px-5 py-3">
        {/* Category pills — horizontal scroll */}
        <div
          ref={categoryScrollRef}
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {CATEGORY_META.map(({ value, icon: Icon, labelKey }) => {
            const isActive = props.category === value
            return (
              <Toggle
                key={String(value)}
                pressed={isActive}
                onPressedChange={() => props.onCategoryChange(value)}
                size="sm"
                className="shrink-0 rounded-full px-3.5 text-xs font-medium data-[state=on]:bg-foreground data-[state=on]:text-background"
              >
                {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />}
                {t(labelKey, String(value ?? 'All'))}
              </Toggle>
            )
          })}
        </div>

        {/* Right side controls */}
        <div className="flex shrink-0 items-center gap-3 pl-3">
          {/* Free-text search pill */}
          <label
            className="group flex h-8 w-36 items-center gap-2 rounded-full border border-border bg-background pl-3 pr-1 text-xs transition-colors focus-within:border-foreground hover:border-foreground md:w-56"
            htmlFor="explore-search-input"
          >
            <Search
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-focus-within:text-foreground"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              id="explore-search-input"
              type="text"
              value={localQuery ?? ''}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setLocalQuery('')
                  props.onQueryChange('')
                  ;(e.target as HTMLInputElement).blur()
                }
              }}
              placeholder={t('explore.searchPlaceholder', 'Search…')}
              className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              aria-label={t('explore.searchAria', 'Search listings')}
            />
            {(localQuery?.length ?? 0) > 0 && (
              <button
                type="button"
                onClick={() => {
                  setLocalQuery('')
                  props.onQueryChange('')
                }}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={t('explore.clearSearch', 'Clear search')}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </label>

          {/* Result count */}
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {props.total.toLocaleString()} {t('property.resultCount', 'results')}
          </span>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="xs"
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>{t(`explore.${props.sort ?? 'newest'}`, props.sort ?? 'Newest')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-none">
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => props.onSortChange(opt.value)}
                  className={`rounded-none text-xs ${props.sort === opt.value ? 'font-medium text-foreground' : ''}`}
                >
                  {t(opt.labelKey, opt.value)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filters button */}
          <Toggle
            pressed={props.activeFilterCount > 0}
            onPressedChange={props.onFiltersOpen}
            size="sm"
            variant="outline"
            className="rounded-full px-3.5 text-xs font-medium data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {t('filters.filters', 'Filters')}
            {props.activeFilterCount > 0 && (
              <span className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-background text-[10px] font-semibold text-foreground">
                {props.activeFilterCount}
              </span>
            )}
          </Toggle>
        </div>
      </div>

      {/* Active filter chips */}
      <AnimatePresence>
        {chips.length > 0 && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-5 py-2">
              {chips.map((chip) => (
                <Badge
                  key={chip.key}
                  asChild
                  variant="outline"
                  className="cursor-pointer gap-1 hover:border-foreground hover:bg-muted/80"
                >
                  <button type="button" onClick={chip.onRemove}>
                    {chip.label}
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="xs"
                onClick={props.onClearAll}
                className="ml-1 text-xs text-muted-foreground"
              >
                {t('filters.clearAll', 'Clear all')}
              </Button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
