import { t as createServerFn } from "../server.js";
import { u as useAuth } from "./dist-TPNQHynL.js";
import { t as createSsrRpc } from "./createSsrRpc-BWHnVJ-F.js";
import { useCallback, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
//#region src/modules/favorites/api/favorites.fn.ts
/**
* Resolve the current Clerk user id or throw. Use for mutations.
*/
/**
* Toggle favorite state for a listing. Returns the final state.
* - Inserts if not present
* - Deletes if present
*/
var toggleFavoriteFn = createServerFn({ method: "POST" }).inputValidator(z.object({ listingId: z.string().uuid() })).handler(createSsrRpc("4638e68be622bb050989744a0f35243cd8f557e24b171cb744ecb3fa0271c5ef"));
/**
* Lightweight — returns only the IDs, for optimistic toggles across cards.
* Signed-out users get an empty list (not an error).
*/
var getFavoriteIdsFn = createServerFn({ method: "GET" }).inputValidator(z.object({}).optional().default({})).handler(createSsrRpc("372abdd9c010c20ad528dc7810d53111b35e2b34ee0c1d0764eca0bdfadd1b74"));
/**
* Full favorites list with cover + title for the /favorites page.
* Signed-out users get `{ items: [], total: 0 }`.
*/
var getFavoritesFn = createServerFn({ method: "GET" }).inputValidator(z.object({
	limit: z.number().min(1).max(100).default(30),
	offset: z.number().min(0).default(0),
	locale: z.string().default("en")
})).handler(createSsrRpc("ed7f21ecfe78267a0207b0bff936c6223700eaf0a4d329d1d08fa12b823065db"));
/**
* Nuke-all button for the /favorites page.
*/
var clearFavoritesFn = createServerFn({ method: "POST" }).inputValidator(z.object({}).optional().default({})).handler(createSsrRpc("2ecdbed99ab297fe7af48b5f492a7510ca6e12c8f2f0e0ef4ca1052c9724c489"));
//#endregion
//#region src/modules/favorites/api/queries.ts
var favoriteKeys = {
	all: ["favorites"],
	ids: () => [...favoriteKeys.all, "ids"],
	list: (locale, limit, offset) => [
		...favoriteKeys.all,
		"list",
		locale,
		limit,
		offset
	]
};
function favoriteIdsQueryOptions() {
	return queryOptions({
		queryKey: favoriteKeys.ids(),
		queryFn: () => getFavoriteIdsFn({ data: {} }),
		staleTime: 1e3 * 60 * 5
	});
}
function favoritesListQueryOptions(locale = "en", limit = 30, offset = 0) {
	return queryOptions({
		queryKey: favoriteKeys.list(locale, limit, offset),
		queryFn: () => getFavoritesFn({ data: {
			locale,
			limit,
			offset
		} }),
		staleTime: 1e3 * 60
	});
}
//#endregion
//#region src/modules/favorites/ui/useFavorites.ts
/**
* Central hook for favorite state + mutations.
*
* - Fetches the user's favorite IDs once (cached 5m) and exposes them as a Set.
* - `toggle(listingId)` optimistically flips the heart across all UI using it.
* - Signed-out users are redirected to /sign-in when clicking.
*/
function useFavorites() {
	const qc = useQueryClient();
	const navigate = useNavigate();
	const { isSignedIn, isLoaded } = useAuth();
	const { data: idsArray = [] } = useQuery({
		...favoriteIdsQueryOptions(),
		enabled: isLoaded && !!isSignedIn
	});
	const ids = useMemo(() => new Set(idsArray), [idsArray]);
	const mutation = useMutation({
		mutationFn: (listingId) => toggleFavoriteFn({ data: { listingId } }),
		onMutate: async (listingId) => {
			await qc.cancelQueries({ queryKey: favoriteKeys.ids() });
			const prev = qc.getQueryData(favoriteKeys.ids()) ?? [];
			const next = prev.includes(listingId) ? prev.filter((x) => x !== listingId) : [...prev, listingId];
			qc.setQueryData(favoriteKeys.ids(), next);
			return { prev };
		},
		onError: (_err, _listingId, ctx) => {
			if (ctx?.prev) qc.setQueryData(favoriteKeys.ids(), ctx.prev);
		},
		onSettled: () => {
			qc.invalidateQueries({ queryKey: favoriteKeys.all });
		}
	});
	const toggle = useCallback((listingId) => {
		if (!isLoaded) return;
		if (!isSignedIn) {
			navigate({ to: "/sign-in" });
			return;
		}
		mutation.mutate(listingId);
	}, [
		isLoaded,
		isSignedIn,
		mutation,
		navigate
	]);
	return {
		ids,
		isFavorite: useCallback((listingId) => ids.has(listingId), [ids]),
		toggle,
		isSignedIn: !!isSignedIn,
		isLoaded,
		count: ids.size
	};
}
//#endregion
export { clearFavoritesFn as i, favoriteKeys as n, favoritesListQueryOptions as r, useFavorites as t };
