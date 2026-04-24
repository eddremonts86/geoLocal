import { createServerFn } from '@tanstack/react-start'
import { sql, eq, count, inArray } from 'drizzle-orm'
import { loadDb } from '@/shared/lib/db/load'
import { listings, listingTranslations } from '@/shared/lib/db/schema'

export const getAdminStatsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await loadDb()

  const [total] = await db.select({ count: count() }).from(listings)
  const byCategory = await db
    .select({ category: listings.category, count: count() })
    .from(listings)
    .groupBy(listings.category)
  const byStatus = await db
    .select({ status: listings.status, count: count() })
    .from(listings)
    .groupBy(listings.status)
  const [featuredCount] = await db
    .select({ count: count() })
    .from(listings)
    .where(eq(listings.featured, true))

  return {
    total: total?.count ?? 0,
    byCategory: Object.fromEntries(byCategory.map((r) => [r.category, r.count])),
    byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r.count])),
    featured: featuredCount?.count ?? 0,
  }
})

export const getRecentListingsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await loadDb()

  const rows = await db
    .select()
    .from(listings)
    .orderBy(sql`${listings.createdAt} desc`)
    .limit(10)

  if (rows.length === 0) return []

  const ids = rows.map((r) => r.id)
  const translations = await db
    .select()
    .from(listingTranslations)
    .where(inArray(listingTranslations.listingId, ids))
  const tMap = new Map<string, typeof translations[0]>()
  for (const t of translations) {
    const existing = tMap.get(t.listingId)
    if (!existing || t.locale === 'en') tMap.set(t.listingId, t)
  }

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    category: r.category,
    subCategory: r.subCategory,
    status: r.status,
    price: r.price,
    currency: r.currency,
    city: r.city,
    featured: r.featured,
    title: tMap.get(r.id)?.title ?? r.slug,
    createdAt: r.createdAt.toISOString(),
  }))
})
