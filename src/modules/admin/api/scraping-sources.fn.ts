/**
 * Server fns for the source-discovery admin page.
 * Candidates are populated by scripts/scraping/discovery.ts.
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, desc, sql, count, asc } from 'drizzle-orm'
import { loadDb } from '@/shared/lib/db/load'
import {
  scrapedRaw,
  scrapedSourceCandidates,
  scrapingSources,
} from '@/shared/lib/db/schema'

const statusSchema = z.enum(['pending', 'approved', 'rejected', 'dead'])

export const listSourceCandidatesFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ status: statusSchema.optional() }))
  .handler(async ({ data }) => {
    const db = await loadDb()
    const query = db
      .select()
      .from(scrapedSourceCandidates)
      .orderBy(desc(scrapedSourceCandidates.discoveredAt))
    const rows = data.status
      ? await query.where(eq(scrapedSourceCandidates.status, data.status))
      : await query
    return { items: rows }
  })

export const updateSourceCandidateStatusFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().uuid(), status: statusSchema }))
  .handler(async ({ data }) => {
    const db = await loadDb()

    // 1. Flip the candidate's status.
    const [cand] = await db
      .update(scrapedSourceCandidates)
      .set({ status: data.status })
      .where(eq(scrapedSourceCandidates.id, data.id))
      .returning()

    // 2. If it's now approved, make sure the registry row exists so future
    //    scraping runs can use it as an FK target. kind='none' means "approved
    //    by a human but no scraper implementation yet".
    if (cand && data.status === 'approved') {
      await db
        .insert(scrapingSources)
        .values({
          key: cand.domain,
          label: cand.domain,
          domain: cand.domain,
          status: 'active',
          kind: 'none',
        })
        .onConflictDoNothing({ target: scrapingSources.key })
    }
    return { ok: true }
  })

/**
 * Active sources = every row in `scraping_sources`, enriched with live
 * ingestion stats from `scraped_raw`. The registry table is the single source
 * of truth: approving a candidate inserts a row here with kind='none';
 * shipping a scraper just flips kind='built-in'. No schema change required.
 */
export const listBuiltInSourcesFn = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await loadDb()

  const sources = await db
    .select()
    .from(scrapingSources)
    // Hide deprecated rows (false-positives from discovery, retired scrapers).
    .where(sql`${scrapingSources.status} != 'deprecated'`)
    .orderBy(asc(scrapingSources.kind), asc(scrapingSources.key))

  const stats = await db
    .select({
      source: scrapedRaw.source,
      status: scrapedRaw.status,
      count: count(),
      lastSeenAt: sql<string>`max(${scrapedRaw.createdAt})`,
    })
    .from(scrapedRaw)
    .groupBy(scrapedRaw.source, scrapedRaw.status)

  type ActiveSource = {
    source: string
    label: string
    domain: string
    /** Legacy field kept for UI compatibility. 'approved-candidate' = kind='none'. */
    kind: 'built-in' | 'approved-candidate'
    sourceStatus: 'active' | 'paused' | 'deprecated'
    total: number
    pending: number
    reviewed: number
    published: number
    rejected: number
    lastSeenAt: string | null
  }

  const map = new Map<string, ActiveSource>()
  for (const s of sources) {
    map.set(s.key, {
      source: s.key,
      label: s.label,
      domain: s.domain,
      kind: s.kind === 'none' ? 'approved-candidate' : 'built-in',
      sourceStatus: s.status,
      total: 0,
      pending: 0,
      reviewed: 0,
      published: 0,
      rejected: 0,
      lastSeenAt: null,
    })
  }
  for (const r of stats) {
    const t = map.get(r.source as string)
    if (!t) continue // FK guarantees this only happens mid-race; ignore.
    t.total += r.count
    if (r.status === 'pending') t.pending = r.count
    else if (r.status === 'reviewed') t.reviewed = r.count
    else if (r.status === 'published') t.published = r.count
    else if (r.status === 'rejected') t.rejected = r.count
    if (r.lastSeenAt && (!t.lastSeenAt || r.lastSeenAt > t.lastSeenAt)) {
      t.lastSeenAt = r.lastSeenAt
    }
  }

  return {
    items: Array.from(map.values()).sort((a, b) => {
      // Sort built-in before approved-candidate, then by total desc, then by key.
      if (a.kind !== b.kind) return a.kind === 'built-in' ? -1 : 1
      if (a.total !== b.total) return b.total - a.total
      return a.source.localeCompare(b.source)
    }),
  }
})


