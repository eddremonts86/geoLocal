import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query'
import { searchListingsFn, getListingBySlugFn, getFeaturedListingsFn, getScrapedListingsFn, getMapMarkersFn, getSimilarListingsFn, getHomeStatsFn } from './listings.fn'
import type { ListingSearchFilters, ListingCategory } from '@/modules/listings/model/types'

export const listingKeys = {
  all: ['listings'] as const,
  lists: () => [...listingKeys.all, 'list'] as const,
  list: (filters: ListingSearchFilters) => [...listingKeys.lists(), filters] as const,
  details: () => [...listingKeys.all, 'detail'] as const,
  detail: (slug: string) => [...listingKeys.details(), slug] as const,
  featured: (limit: number) => [...listingKeys.all, 'featured', limit] as const,
  scraped: (limit: number) => [...listingKeys.all, 'scraped', limit] as const,
  mapMarkers: (filters: Omit<ListingSearchFilters, 'bounds' | 'locale' | 'sort' | 'query'>) =>
    [...listingKeys.all, 'mapMarkers', filters] as const,
  similar: (category: ListingCategory, city: string | undefined, excludeId: string, limit: number) =>
    [...listingKeys.all, 'similar', category, city ?? '_any_', excludeId, limit] as const,
  homeStats: (locale: string) => [...listingKeys.all, 'homeStats', locale] as const,
}

export function listingSearchQueryOptions(filters: ListingSearchFilters & { page?: number; pageSize?: number }) {
  return queryOptions({
    queryKey: listingKeys.list(filters),
    queryFn: () =>
      searchListingsFn({
        data: {
          category: filters.category,
          subCategory: filters.subCategory,
          transactionType: filters.transactionType,
          query: filters.query,
          priceMin: filters.priceMin,
          priceMax: filters.priceMax,
          boundsNorth: filters.bounds?.north,
          boundsSouth: filters.bounds?.south,
          boundsEast: filters.bounds?.east,
          boundsWest: filters.bounds?.west,
          nearLat: filters.nearLat,
          nearLng: filters.nearLng,
          nearRadiusKm: filters.nearRadiusKm,
          polygon: filters.polygon,
          sort: filters.sort ?? 'newest',
          page: filters.page ?? 1,
          pageSize: filters.pageSize ?? 20,
          locale: filters.locale ?? 'en',
          bedrooms: filters.bedrooms,
          bathrooms: filters.bathrooms,
          areaMin: filters.areaMin,
          areaMax: filters.areaMax,
          make: filters.make,
          yearMin: filters.yearMin,
          yearMax: filters.yearMax,
          fuelType: filters.fuelType,
          transmission: filters.transmission,
          experienceMin: filters.experienceMin,
        },
      }),
  })
}

export function listingInfiniteQueryOptions(filters: ListingSearchFilters & { pageSize?: number }) {
  return infiniteQueryOptions({
    queryKey: [...listingKeys.list(filters), 'infinite'] as const,
    queryFn: ({ pageParam = 1 }) =>
      searchListingsFn({
        data: {
          category: filters.category,
          subCategory: filters.subCategory,
          transactionType: filters.transactionType,
          query: filters.query,
          priceMin: filters.priceMin,
          priceMax: filters.priceMax,
          boundsNorth: filters.bounds?.north,
          boundsSouth: filters.bounds?.south,
          boundsEast: filters.bounds?.east,
          boundsWest: filters.bounds?.west,
          nearLat: filters.nearLat,
          nearLng: filters.nearLng,
          nearRadiusKm: filters.nearRadiusKm,
          polygon: filters.polygon,
          sort: filters.sort ?? 'newest',
          page: pageParam,
          pageSize: filters.pageSize ?? 20,
          locale: filters.locale ?? 'en',
          bedrooms: filters.bedrooms,
          bathrooms: filters.bathrooms,
          areaMin: filters.areaMin,
          areaMax: filters.areaMax,
          make: filters.make,
          yearMin: filters.yearMin,
          yearMax: filters.yearMax,
          fuelType: filters.fuelType,
          transmission: filters.transmission,
          experienceMin: filters.experienceMin,
        },
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1
      return nextPage * lastPage.pageSize <= lastPage.total + lastPage.pageSize
        ? nextPage
        : undefined
    },
  })
}

export function listingDetailQueryOptions(slug: string, locale = 'en') {
  return queryOptions({
    queryKey: listingKeys.detail(slug),
    queryFn: () => getListingBySlugFn({ data: { slug, locale } }),
    enabled: !!slug,
  })
}

export function featuredListingsQueryOptions(limit = 12, locale = 'en') {
  return queryOptions({
    queryKey: listingKeys.featured(limit),
    queryFn: () => getFeaturedListingsFn({ data: { limit, locale } }),
    staleTime: 1000 * 60 * 5, // 5 min
  })
}

export function scrapedListingsQueryOptions(limit = 12, locale = 'en') {
  return queryOptions({
    queryKey: listingKeys.scraped(limit),
    queryFn: () => getScrapedListingsFn({ data: { limit, locale } }),
    staleTime: 1000 * 60 * 5,
  })
}

export function mapMarkersQueryOptions(filters: Omit<ListingSearchFilters, 'bounds' | 'locale' | 'sort' | 'query'>) {
  return queryOptions({
    queryKey: listingKeys.mapMarkers(filters),
    queryFn: () =>
      getMapMarkersFn({
        data: {
          category: filters.category,
          subCategory: filters.subCategory,
          transactionType: filters.transactionType,
          priceMin: filters.priceMin,
          priceMax: filters.priceMax,
          bedrooms: filters.bedrooms,
          bathrooms: filters.bathrooms,
          areaMin: filters.areaMin,
          areaMax: filters.areaMax,
          make: filters.make,
          yearMin: filters.yearMin,
          yearMax: filters.yearMax,
          fuelType: filters.fuelType,
          transmission: filters.transmission,
          experienceMin: filters.experienceMin,
          nearLat: filters.nearLat,
          nearLng: filters.nearLng,
          nearRadiusKm: filters.nearRadiusKm,
          polygon: filters.polygon,
          limit: 10000,
        },
      }),
    staleTime: 1000 * 60 * 2,
  })
}

export function similarListingsQueryOptions(
  category: ListingCategory,
  city: string | undefined,
  excludeId: string,
  limit = 3,
  locale = 'en',
) {
  return queryOptions({
    queryKey: listingKeys.similar(category, city, excludeId, limit),
    queryFn: () => getSimilarListingsFn({ data: { category, city, excludeId, limit, locale } }),
    enabled: !!excludeId,
    staleTime: 1000 * 60 * 5,
  })
}

export function homeStatsQueryOptions(locale = 'en') {
  return queryOptions({
    queryKey: listingKeys.homeStats(locale),
    queryFn: () => getHomeStatsFn({ data: { locale } }),
    staleTime: 1000 * 60 * 5,
  })
}
