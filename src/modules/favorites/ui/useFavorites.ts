import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@clerk/tanstack-react-start'
import { useCallback, useMemo } from 'react'
import { toggleFavoriteFn } from '../api/favorites.fn'
import { favoriteKeys, favoriteIdsQueryOptions } from '../api/queries'

/**
 * Central hook for favorite state + mutations.
 *
 * - Fetches the user's favorite IDs once (cached 5m) and exposes them as a Set.
 * - `toggle(listingId)` optimistically flips the heart across all UI using it.
 * - Signed-out users are redirected to /sign-in when clicking.
 */
export function useFavorites() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { isSignedIn, isLoaded } = useAuth()

  const { data: idsArray = [] } = useQuery({
    ...favoriteIdsQueryOptions(),
    enabled: isLoaded && !!isSignedIn,
  })

  const ids = useMemo(() => new Set(idsArray), [idsArray])

  const mutation = useMutation({
    mutationFn: (listingId: string) => toggleFavoriteFn({ data: { listingId } }),
    onMutate: async (listingId) => {
      await qc.cancelQueries({ queryKey: favoriteKeys.ids() })
      const prev = qc.getQueryData<string[]>(favoriteKeys.ids()) ?? []
      const next = prev.includes(listingId) ? prev.filter((x) => x !== listingId) : [...prev, listingId]
      qc.setQueryData(favoriteKeys.ids(), next)
      return { prev }
    },
    onError: (_err, _listingId, ctx) => {
      if (ctx?.prev) qc.setQueryData(favoriteKeys.ids(), ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: favoriteKeys.all })
    },
  })

  const toggle = useCallback(
    (listingId: string) => {
      if (!isLoaded) return
      if (!isSignedIn) {
        navigate({ to: '/sign-in' })
        return
      }
      mutation.mutate(listingId)
    },
    [isLoaded, isSignedIn, mutation, navigate],
  )

  const isFavorite = useCallback((listingId: string) => ids.has(listingId), [ids])

  return {
    ids,
    isFavorite,
    toggle,
    isSignedIn: !!isSignedIn,
    isLoaded,
    count: ids.size,
  }
}
