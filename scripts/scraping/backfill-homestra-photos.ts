/**
 * One-off: back-fill homestra imageUrl by re-fetching list pages and
 * resolving the Apollo Photo:<uuid> refs that the original scrape left
 * unresolved in rawData.
 *
 * Run: pnpm tsx scripts/scraping/backfill-homestra-photos.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import { scrapedRaw } from '../../src/shared/lib/db/schema'
import { fetchHtml } from './helpers/html-extract'
import { pickUserAgent } from './config'

const BASE = 'https://homestra.com'
const LIST_PATH = '/list/houses-for-sale/denmark/'
const NEXT_DATA_RE = /<script id="__NEXT_DATA__"[^>]*>([\s\S]+?)<\/script>/

async function fetchPage(page: number): Promise<Record<string, string>> {
  const url = `${BASE}${LIST_PATH}${page > 1 ? `?page=${page}` : ''}`
  const html = await fetchHtml(url, { userAgent: pickUserAgent() })
  const m = NEXT_DATA_RE.exec(html)
  if (!m?.[1]) throw new Error(`page ${page}: __NEXT_DATA__ not found`)
  const data = JSON.parse(m[1])
  const apollo: Record<string, any> = data?.props?.pageProps?.__APOLLO_STATE__ ?? {}

  // Build propertyId -> featuredPhotoUrl map
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(apollo)) {
    if (!k.startsWith('Property:')) continue
    const prop = v as { id?: string; featuredPhoto?: { __ref?: string } }
    const ref = prop.featuredPhoto?.__ref
    if (!prop.id || !ref) continue
    const photo = apollo[ref] as { url?: string } | undefined
    if (photo?.url) out[prop.id] = photo.url
  }
  return out
}

async function main() {
  const connectionString =
    process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5434/geo_dashboard'
  const client = postgres(connectionString, { prepare: false })
  const db = drizzle(client)

  // Fetch up to 6 pages (240 items) — we only have 120 rows so this covers it
  const photos: Record<string, string> = {}
  for (let p = 1; p <= 6; p++) {
    try {
      const m = await fetchPage(p)
      const before = Object.keys(photos).length
      Object.assign(photos, m)
      const added = Object.keys(photos).length - before
      console.log(`[homestra-photos] page ${p}: +${added} urls (total ${Object.keys(photos).length})`)
      if (added === 0) break
      await new Promise((r) => setTimeout(r, 1000))
    } catch (err) {
      console.warn(`[homestra-photos] page ${p} failed: ${err instanceof Error ? err.message : err}`)
      break
    }
  }

  const rows = await db
    .select({ id: scrapedRaw.id, sourceId: scrapedRaw.sourceId, normalised: scrapedRaw.normalised, rawData: scrapedRaw.rawData })
    .from(scrapedRaw)
    .where(eq(scrapedRaw.source, 'homestra'))

  let updated = 0
  let missing = 0
  for (const r of rows) {
    const url = photos[r.sourceId]
    if (!url) {
      missing++
      continue
    }
    const normalised = { ...(r.normalised as Record<string, unknown> ?? {}), imageUrl: url, imageUrls: [url] }
    const rawData = { ...(r.rawData as Record<string, unknown> ?? {}), _photoUrl: url }
    await db
      .update(scrapedRaw)
      .set({ normalised, rawData, normalisedAt: new Date(), normalisedBy: 'rules:v1' })
      .where(eq(scrapedRaw.id, r.id))
    updated++
  }
  console.log(`[homestra-photos] updated=${updated}  missing=${missing}  total=${rows.length}`)

  await client.end({ timeout: 5 })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
