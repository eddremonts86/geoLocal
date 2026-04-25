import { createServerFn } from '@tanstack/react-start'
import { sql, eq, count, inArray, and, gte, lt } from 'drizzle-orm'
import { loadDb } from '@/shared/lib/db/load'
import {
  listings,
  listingTranslations,
  scrapedRaw,
  scrapedSourceCandidates,
} from '@/shared/lib/db/schema'

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

/**
 * Lightweight counters used by the sidebar badges + topbar.
 * Cheap enough to poll every 60s.
 */
export const getAdminBadgesFn = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await loadDb()
  const [drafts] = await db
    .select({ count: count() })
    .from(listings)
    .where(eq(listings.status, 'draft'))
  const [pendingReview] = await db
    .select({ count: count() })
    .from(scrapedRaw)
    .where(eq(scrapedRaw.status, 'pending'))
  const [pendingSources] = await db
    .select({ count: count() })
    .from(scrapedSourceCandidates)
    .where(eq(scrapedSourceCandidates.status, 'pending'))
  return {
    drafts: drafts?.count ?? 0,
    pendingReview: pendingReview?.count ?? 0,
    pendingSources: pendingSources?.count ?? 0,
  }
})

/**
 * Full dashboard payload — hero numbers, deltas, pipeline, top sources,
 * and per-category breakdown with published share.
 */
export const getAdminDashboardFn = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await loadDb()
  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1)

  // Hero counters
  const [total] = await db.select({ count: count() }).from(listings)
  const [published] = await db
    .select({ count: count() })
    .from(listings)
    .where(eq(listings.status, 'published'))
  const [drafts] = await db
    .select({ count: count() })
    .from(listings)
    .where(eq(listings.status, 'draft'))
  const [archived] = await db
    .select({ count: count() })
    .from(listings)
    .where(eq(listings.status, 'archived'))
  const [featured] = await db
    .select({ count: count() })
    .from(listings)
    .where(eq(listings.featured, true))

  // Monthly deltas for "published"
  const [publishedThisMonth] = await db
    .select({ count: count() })
    .from(listings)
    .where(and(eq(listings.status, 'published'), gte(listings.createdAt, startOfThisMonth)))
  const [publishedLastMonth] = await db
    .select({ count: count() })
    .from(listings)
    .where(
      and(
        eq(listings.status, 'published'),
        gte(listings.createdAt, startOfLastMonth),
        lt(listings.createdAt, startOfThisMonth),
      ),
    )
  const [publishedPrevMonth] = await db
    .select({ count: count() })
    .from(listings)
    .where(
      and(
        eq(listings.status, 'published'),
        gte(listings.createdAt, startOfPrevMonth),
        lt(listings.createdAt, startOfLastMonth),
      ),
    )

  // Per category with published share
  const byCategoryRows = await db
    .select({
      category: listings.category,
      total: count(),
      published: sql<number>`count(*) filter (where ${listings.status} = 'published')::int`,
    })
    .from(listings)
    .groupBy(listings.category)

  // Scraping pipeline funnel
  const [pendingReview] = await db
    .select({ count: count() })
    .from(scrapedRaw)
    .where(eq(scrapedRaw.status, 'pending'))
  const [reviewedScraped] = await db
    .select({ count: count() })
    .from(scrapedRaw)
    .where(eq(scrapedRaw.status, 'reviewed'))
  const [publishedScraped] = await db
    .select({ count: count() })
    .from(scrapedRaw)
    .where(eq(scrapedRaw.status, 'published'))
  const [rejectedScraped] = await db
    .select({ count: count() })
    .from(scrapedRaw)
    .where(eq(scrapedRaw.status, 'rejected'))

  // Top scraping sources (pending volume)
  const topSources = await db
    .select({ source: scrapedRaw.source, count: count() })
    .from(scrapedRaw)
    .where(eq(scrapedRaw.status, 'pending'))
    .groupBy(scrapedRaw.source)
    .orderBy(sql`count(*) desc`)
    .limit(6)

  // Source candidates waiting approval
  const [pendingSources] = await db
    .select({ count: count() })
    .from(scrapedSourceCandidates)
    .where(eq(scrapedSourceCandidates.status, 'pending'))

  const byCategory = Object.fromEntries(
    byCategoryRows.map((r) => [
      r.category,
      { total: r.total, published: Number(r.published ?? 0) },
    ]),
  )

  return {
    hero: {
      total: total?.count ?? 0,
      published: published?.count ?? 0,
      drafts: drafts?.count ?? 0,
      archived: archived?.count ?? 0,
      featured: featured?.count ?? 0,
      publishedThisMonth: publishedThisMonth?.count ?? 0,
      publishedLastMonth: publishedLastMonth?.count ?? 0,
      publishedPrevMonth: publishedPrevMonth?.count ?? 0,
    },
    byCategory,
    pipeline: {
      pendingReview: pendingReview?.count ?? 0,
      reviewed: reviewedScraped?.count ?? 0,
      published: publishedScraped?.count ?? 0,
      rejected: rejectedScraped?.count ?? 0,
    },
    topSources: topSources.map((s) => ({ source: s.source, count: s.count })),
    pendingSources: pendingSources?.count ?? 0,
  }
})

/**
 * Weekly published-listing counts for the last N weeks, broken down by category.
 * Used to draw the trend sparkline + stacked-area chart on the dashboard.
 */
export const getListingsTrendFn = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await loadDb()
  const weeks = 12
  const now = new Date()
  // Monday of current ISO week
  const dow = (now.getUTCDay() + 6) % 7 // 0 = Monday
  const thisWeekStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dow),
  )
  const windowStart = new Date(thisWeekStart)
  windowStart.setUTCDate(windowStart.getUTCDate() - 7 * (weeks - 1))

  const rows = await db
    .select({
      week: sql<string>`date_trunc('week', ${listings.createdAt})::date`,
      category: listings.category,
      count: count(),
    })
    .from(listings)
    .where(and(eq(listings.status, 'published'), gte(listings.createdAt, windowStart)))
    .groupBy(sql`date_trunc('week', ${listings.createdAt})`, listings.category)
    .orderBy(sql`date_trunc('week', ${listings.createdAt})`)

  // Build a dense [{ weekStart, property, vehicle, service, experience, total }] series.
  type Bucket = {
    weekStart: string
    property: number
    vehicle: number
    service: number
    experience: number
    total: number
  }
  const buckets: Bucket[] = []
  for (let i = 0; i < weeks; i++) {
    const d = new Date(windowStart)
    d.setUTCDate(d.getUTCDate() + i * 7)
    buckets.push({
      weekStart: d.toISOString().slice(0, 10),
      property: 0,
      vehicle: 0,
      service: 0,
      experience: 0,
      total: 0,
    })
  }
  const byKey = new Map(buckets.map((b) => [b.weekStart, b]))
  for (const r of rows) {
    const key = String(r.week).slice(0, 10)
    const b = byKey.get(key)
    if (!b) continue
    const cat = r.category as 'property' | 'vehicle' | 'service' | 'experience'
    b[cat] += r.count
    b.total += r.count
  }
  return buckets
})

