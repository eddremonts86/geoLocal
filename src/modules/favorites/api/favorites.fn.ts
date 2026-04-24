import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { auth } from '@clerk/tanstack-react-start/server'
import { loadDb } from '@/shared/lib/db/load'
import { favorites, listings, listingTranslations, listingAssets } from '@/shared/lib/db/schema'

/**
 * Resolve the current Clerk user id or throw. Use for mutations.
 */
async function requireUserId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new Error('UNAUTHENTICATED')
  return userId
}

/**
 * Toggle favorite state for a listing. Returns the final state.
 * - Inserts if not present
 * - Deletes if present
 */
export const toggleFavoriteFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ listingId: z.string().uuid() }))
  .handler(async ({ data }): Promise<{ favorited: boolean }> => {
    const userId = await requireUserId()
    const db = await loadDb()

    const existing = await db
      .select({ id: favorites.id })
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.listingId, data.listingId)))
      .limit(1)

    if (existing.length > 0) {
      await db.delete(favorites).where(eq(favorites.id, existing[0].id))
      return { favorited: false }
    }

    await db.insert(favorites).values({ userId, listingId: data.listingId })
    return { favorited: true }
  })

/**
 * Lightweight — returns only the IDs, for optimistic toggles across cards.
 * Signed-out users get an empty list (not an error).
 */
export const getFavoriteIdsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({}).optional().default({}))
  .handler(async (): Promise<string[]> => {
    const { userId } = await auth()
    if (!userId) return []
    const db = await loadDb()
    const rows = await db
      .select({ listingId: favorites.listingId })
      .from(favorites)
      .where(eq(favorites.userId, userId))
    return rows.map((r) => r.listingId)
  })

/**
 * Full favorites list with cover + title for the /favorites page.
 * Signed-out users get `{ items: [], total: 0 }`.
 */
export const getFavoritesFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      limit: z.number().min(1).max(100).default(30),
      offset: z.number().min(0).default(0),
      locale: z.string().default('en'),
    }),
  )
  .handler(async ({ data }) => {
    const { userId } = await auth()
    if (!userId) return { items: [], total: 0 }
    const db = await loadDb()

    const rows = await db
      .select({
        id: listings.id,
        slug: listings.slug,
        category: listings.category,
        subCategory: listings.subCategory,
        transactionType: listings.transactionType,
        price: listings.price,
        currency: listings.currency,
        pricePeriod: listings.pricePeriod,
        city: listings.city,
        latitude: listings.latitude,
        longitude: listings.longitude,
        addressLine1: listings.addressLine1,
        region: listings.region,
        country: listings.country,
        featured: listings.featured,
        status: listings.status,
        scrapedSource: listings.scrapedSource,
        scrapedSourceUrl: listings.scrapedSourceUrl,
        favoritedAt: favorites.createdAt,
      })
      .from(favorites)
      .innerJoin(listings, eq(listings.id, favorites.listingId))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt))
      .limit(data.limit)
      .offset(data.offset)

    if (rows.length === 0) return { items: [], total: 0 }

    const ids = rows.map((r) => r.id)
    const [translations, covers, totalRow] = await Promise.all([
      db
        .select()
        .from(listingTranslations)
        .where(and(inArray(listingTranslations.listingId, ids), eq(listingTranslations.locale, data.locale))),
      db
        .select()
        .from(listingAssets)
        .where(and(inArray(listingAssets.listingId, ids), eq(listingAssets.isCover, true))),
      db
        .select({ id: favorites.id })
        .from(favorites)
        .where(eq(favorites.userId, userId)),
    ])

    const tMap = new Map(translations.map((t) => [t.listingId, t]))
    const coverMap = new Map(covers.map((c) => [c.listingId, c.url]))

    const items = rows.map((r) => {
      const t = tMap.get(r.id)
      return {
        id: r.id,
        slug: r.slug,
        category: r.category,
        subCategory: r.subCategory,
        transactionType: r.transactionType,
        price: r.price,
        currency: r.currency,
        pricePeriod: r.pricePeriod,
        title: t?.title ?? r.slug,
        summary: t?.summary ?? null,
        coverUrl: coverMap.get(r.id) ?? null,
        city: r.city,
        region: r.region,
        country: r.country,
        latitude: r.latitude,
        longitude: r.longitude,
        addressLine1: r.addressLine1,
        featured: r.featured,
        status: r.status,
        scrapedSource: r.scrapedSource,
        scrapedSourceUrl: r.scrapedSourceUrl,
        favoritedAt: r.favoritedAt,
      }
    })

    return { items, total: totalRow.length }
  })

/**
 * Nuke-all button for the /favorites page.
 */
export const clearFavoritesFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({}).optional().default({}))
  .handler(async (): Promise<{ cleared: number }> => {
    const userId = await requireUserId()
    const db = await loadDb()
    const deleted = await db.delete(favorites).where(eq(favorites.userId, userId)).returning({ id: favorites.id })
    return { cleared: deleted.length }
  })
