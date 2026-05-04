import { useState, useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryStates } from 'nuqs'
import { useInfiniteQuery, useQuery, keepPreviousData } from '@tanstack/react-query'
import { m, AnimatePresence } from 'framer-motion'
import { Map, List } from 'lucide-react'
import { exploreParsers } from '@/modules/explore/state/search-params'
import { listingInfiniteQueryOptions, mapMarkersQueryOptions } from '@/modules/listings/api/queries'
import { MapView, type MapArea } from '@/modules/map/ui/MapView'
import { ExploreTopBar } from '@/modules/explore/ui/ExploreTopBar'
import { FiltersSheet } from '@/modules/explore/ui/FiltersSheet'
import { ListingList } from '@/modules/listings/ui/ListingList'
import { useFavorites } from '@/modules/favorites/ui/useFavorites'
import { Button } from '@/components/ui/button'
import { decodePolygon, encodePolygon } from '@/shared/lib/db/spatial'
import type { FuelType, ListingCategory, ListingSearchFilters, SortOption } from '@/modules/listings/model/types'

/** Shape-level reset shared by category-change and clear-all. */
const FILTER_RESET = {
  subCategory: null,
  transactionType: null,
  sourceKind: null,
  scrapedSource: null,
  beds: null,
  baths: null,
  areaMin: null,
  areaMax: null,
  yearBuiltMin: null,
  yearBuiltMax: null,
  parkingMin: null,
  furnished: null,
  make: null,
  yearMin: null,
  yearMax: null,
  fuelType: null,
  transmission: null,
  mileageMax: null,
  doorsMin: null,
  colors: null,
  experienceMin: null,
  serviceRadiusMin: null,
  responseTime: null,
  certified: null,
  durationMin: null,
  durationMax: null,
  groupMax: null,
  minAgeMax: null,
  languages: null,
  difficulty: null,
  nearLat: null,
  nearLng: null,
  nearRadius: null,
  polygon: null,
  page: 1,
} as const

export function ExplorePage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useQueryStates(exploreParsers)

  const [bounds, setBounds] = useState<{
    north: number; south: number; east: number; west: number
  } | null>(null)

  const [filtersOpen, setFiltersOpen] = useState(false)
  // Mobile: toggle between grid and map view
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')
  const boundsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ⚠ Explicit deps — excludes listingId/lat/lng/zoom to avoid spurious refetches
  const filters: ListingSearchFilters = useMemo(() => ({
    category: params.category ?? undefined,
    subCategory: params.subCategory?.length ? params.subCategory : undefined,
    transactionType: params.transactionType ?? undefined,
    query: params.q || undefined,
    priceMin: params.priceMin ?? undefined,
    priceMax: params.priceMax ?? undefined,
    bounds: bounds ?? undefined,
    sort: params.sort,
    locale: i18n.language,
    sourceKind: params.sourceKind ?? undefined,
    scrapedSource: params.scrapedSource?.length ? params.scrapedSource : undefined,
    bedrooms: params.beds?.map((b) => (b === 'studio' ? ('studio' as const) : Number(b))) ?? undefined,
    bathrooms: params.baths ?? undefined,
    areaMin: params.areaMin ?? undefined,
    areaMax: params.areaMax ?? undefined,
    yearBuiltMin: params.yearBuiltMin ?? undefined,
    yearBuiltMax: params.yearBuiltMax ?? undefined,
    parkingMin: params.parkingMin ?? undefined,
    furnished: params.furnished ?? undefined,
    make: params.make?.length ? params.make : undefined,
    yearMin: params.yearMin ?? undefined,
    yearMax: params.yearMax ?? undefined,
    fuelType: params.fuelType?.length ? params.fuelType : undefined,
    transmission: params.transmission ?? undefined,
    mileageMax: params.mileageMax ?? undefined,
    doorsMin: params.doorsMin ?? undefined,
    colors: params.colors?.length ? params.colors : undefined,
    experienceMin: params.experienceMin ?? undefined,
    serviceRadiusMin: params.serviceRadiusMin ?? undefined,
    responseTime: params.responseTime ?? undefined,
    certified: params.certified ?? undefined,
    durationMin: params.durationMin ?? undefined,
    durationMax: params.durationMax ?? undefined,
    groupMax: params.groupMax ?? undefined,
    minAgeMax: params.minAgeMax ?? undefined,
    languages: params.languages?.length ? params.languages : undefined,
    difficulty: params.difficulty ?? undefined,
    nearLat: params.nearLat ?? undefined,
    nearLng: params.nearLng ?? undefined,
    nearRadiusKm: params.nearRadius ?? undefined,
    polygon: params.polygon ?? undefined,
  }), [
    params.category, params.subCategory, params.transactionType, params.q,
    params.priceMin, params.priceMax, params.sort,
    params.sourceKind, params.scrapedSource,
    params.beds, params.baths, params.areaMin, params.areaMax,
    params.yearBuiltMin, params.yearBuiltMax, params.parkingMin, params.furnished,
    params.make, params.yearMin, params.yearMax, params.fuelType,
    params.transmission, params.mileageMax, params.doorsMin, params.colors,
    params.experienceMin, params.serviceRadiusMin, params.responseTime, params.certified,
    params.durationMin, params.durationMax, params.groupMax, params.minAgeMax,
    params.languages, params.difficulty,
    params.nearLat, params.nearLng, params.nearRadius, params.polygon,
    bounds, i18n.language,
  ])

  const { data, isPending, isError, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      ...listingInfiniteQueryOptions({ ...filters, pageSize: 20 }),
      // Keep previous results visible while new query loads — prevents skeleton flash
      placeholderData: keepPreviousData,
    })

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  )
  const total = data?.pages[0]?.total ?? 0

  // ── Map markers: all matching filters, NOT bounded by viewport, NOT paginated ──
  // Keeps the map populated so users can see full geographic context and cluster density.
  const mapFilters = useMemo(() => ({
    category: filters.category,
    subCategory: filters.subCategory,
    transactionType: filters.transactionType,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    sourceKind: filters.sourceKind,
    scrapedSource: filters.scrapedSource,
    bedrooms: filters.bedrooms,
    bathrooms: filters.bathrooms,
    areaMin: filters.areaMin,
    areaMax: filters.areaMax,
    yearBuiltMin: filters.yearBuiltMin,
    yearBuiltMax: filters.yearBuiltMax,
    parkingMin: filters.parkingMin,
    furnished: filters.furnished,
    make: filters.make,
    yearMin: filters.yearMin,
    yearMax: filters.yearMax,
    fuelType: filters.fuelType,
    transmission: filters.transmission,
    mileageMax: filters.mileageMax,
    doorsMin: filters.doorsMin,
    colors: filters.colors,
    experienceMin: filters.experienceMin,
    serviceRadiusMin: filters.serviceRadiusMin,
    responseTime: filters.responseTime,
    certified: filters.certified,
    durationMin: filters.durationMin,
    durationMax: filters.durationMax,
    groupMax: filters.groupMax,
    minAgeMax: filters.minAgeMax,
    languages: filters.languages,
    difficulty: filters.difficulty,
    nearLat: filters.nearLat,
    nearLng: filters.nearLng,
    nearRadiusKm: filters.nearRadiusKm,
    polygon: filters.polygon,
  }), [
    filters.category, filters.subCategory, filters.transactionType,
    filters.priceMin, filters.priceMax,
    filters.sourceKind, filters.scrapedSource,
    filters.bedrooms, filters.bathrooms, filters.areaMin, filters.areaMax,
    filters.yearBuiltMin, filters.yearBuiltMax, filters.parkingMin, filters.furnished,
    filters.make, filters.yearMin, filters.yearMax, filters.fuelType,
    filters.transmission, filters.mileageMax, filters.doorsMin, filters.colors,
    filters.experienceMin, filters.serviceRadiusMin, filters.responseTime, filters.certified,
    filters.durationMin, filters.durationMax, filters.groupMax, filters.minAgeMax,
    filters.languages, filters.difficulty,
    filters.nearLat, filters.nearLng, filters.nearRadiusKm, filters.polygon,
  ])

  const { data: markers = [] } = useQuery({
    ...mapMarkersQueryOptions(mapFilters),
    placeholderData: keepPreviousData,
  })

  // Debounce bounds — map fires moveend on every frame during pan/zoom
  const handleBoundsChange = useCallback(
    (newBounds: { north: number; south: number; east: number; west: number }) => {
      if (boundsTimerRef.current) clearTimeout(boundsTimerRef.current)
      boundsTimerRef.current = setTimeout(() => {
        setBounds(newBounds)
      }, 600)
    },
    [],
  )

  const handleCategoryChange = (cat: ListingCategory | null) => {
    setParams({ ...FILTER_RESET, category: cat })
  }

  const activeFilterCount = useMemo(() => {
    const checks: boolean[] = [
      params.priceMin != null,
      params.priceMax != null,
      !!params.subCategory?.length,
      !!params.transactionType,
      !!params.sourceKind,
      !!params.scrapedSource?.length,
      !!params.beds?.length,
      params.baths != null,
      params.areaMin != null,
      params.areaMax != null,
      params.yearBuiltMin != null,
      params.yearBuiltMax != null,
      params.parkingMin != null,
      params.furnished === true,
      !!params.make?.length,
      params.yearMin != null,
      params.yearMax != null,
      !!params.fuelType?.length,
      !!params.transmission,
      params.mileageMax != null,
      params.doorsMin != null,
      !!params.colors?.length,
      params.experienceMin != null,
      params.serviceRadiusMin != null,
      !!params.responseTime,
      params.certified === true,
      params.durationMin != null,
      params.durationMax != null,
      params.groupMax != null,
      params.minAgeMax != null,
      !!params.languages?.length,
      !!params.difficulty,
    ]
    return checks.filter(Boolean).length
  }, [params])

  const handleClearAll = () => {
    setParams({ ...FILTER_RESET, priceMin: null, priceMax: null })
  }

  // ── Spatial area (near me / radius / polygon) ──
  const area: MapArea = useMemo(() => {
    if (params.nearLat != null && params.nearLng != null && params.nearRadius != null) {
      return { type: 'radius', lat: params.nearLat, lng: params.nearLng, radiusKm: params.nearRadius }
    }
    const poly = decodePolygon(params.polygon)
    if (poly) return { type: 'polygon', ring: poly }
    return null
  }, [params.nearLat, params.nearLng, params.nearRadius, params.polygon])

  const handleAreaChange = useCallback((next: MapArea) => {
    if (!next) {
      setParams({ nearLat: null, nearLng: null, nearRadius: null, polygon: null, page: 1 })
      return
    }
    if (next.type === 'radius') {
      setParams({
        nearLat: next.lat,
        nearLng: next.lng,
        nearRadius: next.radiusKm,
        polygon: null,
        page: 1,
      })
      return
    }
    // polygon
    setParams({
      nearLat: null,
      nearLng: null,
      nearRadius: null,
      polygon: encodePolygon(next.ring),
      page: 1,
    })
  }, [setParams])

  const sharedFilterProps = {
    category: params.category,
    transactionType: params.transactionType,
    priceMin: params.priceMin,
    priceMax: params.priceMax,
    sourceKind: params.sourceKind,
    scrapedSource: params.scrapedSource,
    beds: params.beds,
    baths: params.baths,
    areaMin: params.areaMin,
    areaMax: params.areaMax,
    yearBuiltMin: params.yearBuiltMin,
    yearBuiltMax: params.yearBuiltMax,
    parkingMin: params.parkingMin,
    furnished: params.furnished,
    make: params.make,
    yearMin: params.yearMin,
    yearMax: params.yearMax,
    fuelType: params.fuelType,
    transmission: params.transmission,
    mileageMax: params.mileageMax,
    doorsMin: params.doorsMin,
    colors: params.colors,
    experienceMin: params.experienceMin,
    serviceRadiusMin: params.serviceRadiusMin,
    responseTime: params.responseTime,
    certified: params.certified,
    durationMin: params.durationMin,
    durationMax: params.durationMax,
    groupMax: params.groupMax,
    minAgeMax: params.minAgeMax,
    languages: params.languages,
    difficulty: params.difficulty,
    subCategory: params.subCategory,
    onTransactionTypeChange: (v: typeof params.transactionType) => setParams({ transactionType: v, page: 1 }),
    onPriceMinChange: (v: number | null) => setParams({ priceMin: v, page: 1 }),
    onPriceMaxChange: (v: number | null) => setParams({ priceMax: v, page: 1 }),
    onSourceKindChange: (v: 'user' | 'scraped' | null) => setParams({ sourceKind: v, scrapedSource: v === 'user' ? null : params.scrapedSource, page: 1 }),
    onScrapedSourceChange: (v: string[] | null) => setParams({ scrapedSource: v, page: 1 }),
    onBedsChange: (v: string[] | null) => setParams({ beds: v, page: 1 }),
    onBathsChange: (v: number | null) => setParams({ baths: v, page: 1 }),
    onAreaMinChange: (v: number | null) => setParams({ areaMin: v, page: 1 }),
    onAreaMaxChange: (v: number | null) => setParams({ areaMax: v, page: 1 }),
    onYearBuiltMinChange: (v: number | null) => setParams({ yearBuiltMin: v, page: 1 }),
    onYearBuiltMaxChange: (v: number | null) => setParams({ yearBuiltMax: v, page: 1 }),
    onParkingMinChange: (v: number | null) => setParams({ parkingMin: v, page: 1 }),
    onFurnishedChange: (v: boolean | null) => setParams({ furnished: v, page: 1 }),
    onSubCategoryChange: (v: string[] | null) => setParams({ subCategory: v, page: 1 }),
    onMakeChange: (v: string[] | null) => setParams({ make: v, page: 1 }),
    onYearMinChange: (v: number | null) => setParams({ yearMin: v, page: 1 }),
    onYearMaxChange: (v: number | null) => setParams({ yearMax: v, page: 1 }),
    onFuelTypeChange: (v: FuelType[] | null) => setParams({ fuelType: v, page: 1 }),
    onTransmissionChange: (v: typeof params.transmission) => setParams({ transmission: v, page: 1 }),
    onMileageMaxChange: (v: number | null) => setParams({ mileageMax: v, page: 1 }),
    onDoorsMinChange: (v: number | null) => setParams({ doorsMin: v, page: 1 }),
    onColorsChange: (v: string[] | null) => setParams({ colors: v, page: 1 }),
    onExperienceMinChange: (v: number | null) => setParams({ experienceMin: v, page: 1 }),
    onServiceRadiusMinChange: (v: number | null) => setParams({ serviceRadiusMin: v, page: 1 }),
    onResponseTimeChange: (v: 'within_hour' | 'same_day' | 'few_days' | null) => setParams({ responseTime: v, page: 1 }),
    onCertifiedChange: (v: boolean | null) => setParams({ certified: v, page: 1 }),
    onDurationMinChange: (v: number | null) => setParams({ durationMin: v, page: 1 }),
    onDurationMaxChange: (v: number | null) => setParams({ durationMax: v, page: 1 }),
    onGroupMaxChange: (v: number | null) => setParams({ groupMax: v, page: 1 }),
    onMinAgeMaxChange: (v: number | null) => setParams({ minAgeMax: v, page: 1 }),
    onLanguagesChange: (v: string[] | null) => setParams({ languages: v, page: 1 }),
    onDifficultyChange: (v: 'easy' | 'moderate' | 'hard' | null) => setParams({ difficulty: v, page: 1 }),
    onClearAll: handleClearAll,
  }

  const { ids: favoriteIds, toggle: toggleFavorite } = useFavorites()

  const listingGrid = (
    <ListingList
      items={items}
      isLoading={isPending}
      isError={isError}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage ?? false}
      onLoadMore={() => fetchNextPage()}
      activeId={params.listingId}
      onSelect={(id) => setParams({ listingId: id })}
      total={total}
      layout="grid"
      onFavorite={toggleFavorite}
      favoriteIds={favoriteIds}
    />
  )

  const mapView = (
    <MapView
      markers={markers}
      items={items}
      activeId={params.listingId}
      onSelect={(id) => setParams({ listingId: id })}
      onBoundsChange={handleBoundsChange}
      center={
        params.lat != null && params.lng != null
          ? [params.lng, params.lat]
          : undefined
      }
      zoom={params.zoom ?? undefined}
      area={area}
      onAreaChange={handleAreaChange}
      defaultRadiusKm={5}
    />
  )

  return (
    <div className="flex h-full flex-col">
      {/* Sticky topbar — categories + sort + filters button */}
      <ExploreTopBar
          category={params.category}
          onCategoryChange={handleCategoryChange}
          sort={params.sort}
          onSortChange={(sort: SortOption) => setParams({ sort, page: 1 })}
          total={total}
          activeFilterCount={activeFilterCount}
          onFiltersOpen={() => setFiltersOpen(true)}
          query={params.q}
          onQueryChange={(q) => setParams({ q: q || null, page: 1 })}
          transactionType={params.transactionType}
          priceMin={params.priceMin}
          priceMax={params.priceMax}
          beds={params.beds}
          baths={params.baths}
          areaMin={params.areaMin}
          areaMax={params.areaMax}
          make={params.make}
          yearMin={params.yearMin}
          fuelType={params.fuelType}
          transmission={params.transmission}
          experienceMin={params.experienceMin}
          subCategory={params.subCategory}
          onSubCategoryChange={(v) => setParams({ subCategory: v, page: 1 })}
          onTransactionTypeChange={(v) => setParams({ transactionType: v, page: 1 })}
          onPriceMinChange={(v) => setParams({ priceMin: v, page: 1 })}
          onPriceMaxChange={(v) => setParams({ priceMax: v, page: 1 })}
          onBedsChange={(v) => setParams({ beds: v, page: 1 })}
          onBathsChange={(v) => setParams({ baths: v, page: 1 })}
          onAreaMinChange={(v) => setParams({ areaMin: v, page: 1 })}
          onAreaMaxChange={(v) => setParams({ areaMax: v, page: 1 })}
          onMakeChange={(v) => setParams({ make: v, page: 1 })}
          onYearMinChange={(v) => setParams({ yearMin: v, page: 1 })}
          onFuelTypeChange={(v: FuelType[] | null) => setParams({ fuelType: v, page: 1 })}
          onTransmissionChange={(v) => setParams({ transmission: v, page: 1 })}
          onExperienceMinChange={(v) => setParams({ experienceMin: v, page: 1 })}
          onClearAll={handleClearAll}
        />

      {/* Content area */}
      <div className="relative flex min-h-0 flex-1">

          {/* ── Desktop: listings grid + map side by side ── */}
          <div className="hidden w-[45%] min-w-90 overflow-y-auto lg:block">
            {listingGrid}
          </div>

          <div className="hidden flex-1 lg:block">
            {mapView}
          </div>

          {/* ── Mobile: list OR map (toggle) ── */}
          <div className="flex flex-1 flex-col lg:hidden">
            <AnimatePresence mode="wait">
              {mobileView === 'list' ? (
                <m.div
                  key="mobile-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 overflow-y-auto"
                >
                  {listingGrid}
                </m.div>
              ) : (
                <m.div
                  key="mobile-map"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1"
                >
                  {mapView}
                </m.div>
              )}
            </AnimatePresence>

            {/* Mobile toggle button */}
            <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
              <Button
                variant="default"
                size="sm"
                className="rounded-full shadow-lg"
                onClick={() => setMobileView((v) => (v === 'list' ? 'map' : 'list'))}
              >
                {mobileView === 'list' ? (
                  <>
                    <Map className="mr-1.5 h-3.5 w-3.5" />
                    {t('explore.showMap', 'Show map')}
                  </>
                ) : (
                  <>
                    <List className="mr-1.5 h-3.5 w-3.5" />
                    {total.toLocaleString()} {t('property.resultCount', 'results')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

      {/* Filters sheet (all viewports) */}
      <FiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        total={total}
        activeFilterCount={activeFilterCount}
        {...sharedFilterProps}
      />
    </div>
  )
}
