import { queryOptions } from '@tanstack/react-query'
import { getFavoriteIdsFn, getFavoritesFn } from './favorites.fn'

export const favoriteKeys = {
  all: ['favorites'] as const,
  ids: () => [...favoriteKeys.all, 'ids'] as const,
  list: (locale: string, limit: number, offset: number) =>
    [...favoriteKeys.all, 'list', locale, limit, offset] as const,
}

export function favoriteIdsQueryOptions() {
  return queryOptions({
    queryKey: favoriteKeys.ids(),
    queryFn: () => getFavoriteIdsFn({ data: {} }),
    staleTime: 1000 * 60 * 5,
  })
}

export function favoritesListQueryOptions(locale = 'en', limit = 30, offset = 0) {
  return queryOptions({
    queryKey: favoriteKeys.list(locale, limit, offset),
    queryFn: () => getFavoritesFn({ data: { locale, limit, offset } }),
    staleTime: 1000 * 60,
  })
}
