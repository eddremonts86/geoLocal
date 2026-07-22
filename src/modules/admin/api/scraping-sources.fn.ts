/**
 * Server fns for the source-discovery admin page.
 * Candidates are populated by scripts/scraping/discovery.ts.
 */

import { createServerFn } from '@tanstack/react-start'
import { eq, desc, sql, count, asc } from 'drizzle-orm'
import { z } from 'zod'
import { loadDb } from '@/shared/lib/db/load'
import {
  scrapedRaw,
  scrapeCheckpoints,
  scrapeRuns,
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

  const checkpoints = await db.select().from(scrapeCheckpoints)
  const recentRuns = await db
    .select()
    .from(scrapeRuns)
    .orderBy(desc(scrapeRuns.startedAt))
    .limit(200)

  type FlowState = {
    flow: string
    status: string
    cursor: { page: number; partition?: string }
    watermark: { sourceId: string; observedAt: string } | null
    exhausted: boolean
    pauseReason: string | null
    cooldownUntil: string | null
    lastSuccessAt: string | null
    nextRunAt: string | null
    latestRun: {
      status: string
      found: number
      added: number
      updated: number
      known: number
      errors: number
      stopReason: string | null
      startedAt: string
      finishedAt: string | null
    } | null
  }

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
    flows: FlowState[]
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
      flows: [],
    })
  }

  const latestRunByFlow = new Map<string, (typeof recentRuns)[number]>()
  for (const run of recentRuns) {
    const key = `${run.source}:${run.flow}`
    if (!latestRunByFlow.has(key)) latestRunByFlow.set(key, run)
  }
  for (const checkpoint of checkpoints) {
    const target = map.get(checkpoint.source)
    if (!target) continue
    const run = latestRunByFlow.get(`${checkpoint.source}:${checkpoint.flow}`)
    target.flows.push({
      flow: checkpoint.flow,
      status: checkpoint.status,
      cursor: checkpoint.cursor,
      watermark: checkpoint.watermark ?? null,
      exhausted: checkpoint.exhausted,
      pauseReason: checkpoint.pauseReason ?? null,
      cooldownUntil: checkpoint.cooldownUntil?.toISOString() ?? null,
      lastSuccessAt: checkpoint.lastSuccessAt?.toISOString() ?? null,
      nextRunAt: checkpoint.nextRunAt?.toISOString() ?? null,
      latestRun: run
        ? {
            status: run.status,
            found: run.foundCount,
            added: run.newCount,
            updated: run.updatedCount,
            known: run.knownCount,
            errors: run.errorCount,
            stopReason: run.stopReason ?? null,
            startedAt: run.startedAt.toISOString(),
            finishedAt: run.finishedAt?.toISOString() ?? null,
          }
        : null,
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

