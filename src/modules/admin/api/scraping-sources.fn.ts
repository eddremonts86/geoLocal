/**
 * Server fns for the source-discovery admin page.
 * Candidates are populated by scripts/scraping/discovery.ts.
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, desc } from 'drizzle-orm'
import { loadDb } from '@/shared/lib/db/load'
import { scrapedSourceCandidates } from '@/shared/lib/db/schema'

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
    await db
      .update(scrapedSourceCandidates)
      .set({ status: data.status })
      .where(eq(scrapedSourceCandidates.id, data.id))
    return { ok: true }
  })
