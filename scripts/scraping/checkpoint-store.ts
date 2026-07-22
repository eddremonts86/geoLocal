import postgres from 'postgres'
import { nextBackoffMs, type PageCursor, type ScrapeFlow, type ScrapeWatermark } from './orchestration'

function jsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Record<string, string | number | boolean | null>
}

export interface ClaimedCheckpoint {
  id: string
  source: string
  flow: ScrapeFlow
  cursor: PageCursor
  watermark: ScrapeWatermark | null
  consecutiveKnownItems: number
  consecutiveFailures: number
}

export interface RunTotals {
  found: number
  saved: number
  updated: number
  known: number
  errors: number
}

export class CheckpointStore {
  private readonly sql: ReturnType<typeof postgres>

  constructor(connectionString: string) {
    this.sql = postgres(connectionString, { max: 2, prepare: false })
  }

  async close() {
    await this.sql.end({ timeout: 5 })
  }

  async ensure(source: string, flow: ScrapeFlow) {
    await this.sql`
      INSERT INTO scrape_checkpoints (source, flow, next_run_at)
      VALUES (${source}, ${flow}, now())
      ON CONFLICT (source, flow) DO NOTHING
    `
  }

  async reconcileStaleRuns() {
    await this.sql`
      UPDATE scrape_runs AS run
      SET status = 'failed',
          stop_reason = 'lease_recovered',
          error_message = 'The scraper stopped before releasing its lease',
          error_count = GREATEST(error_count, 1),
          finished_at = now()
      WHERE run.status = 'running'
        AND NOT EXISTS (
          SELECT 1
          FROM scrape_checkpoints AS checkpoint
          WHERE checkpoint.source = run.source
            AND checkpoint.flow = run.flow
            AND checkpoint.status = 'running'
            AND checkpoint.lease_expires_at > now()
        )
    `
  }

  async knownSourceIds(source: string, sourceIds: string[]): Promise<Set<string>> {
    if (sourceIds.length === 0) return new Set()
    const rows = await this.sql<{ source_id: string }[]>`
      SELECT source_id
      FROM scraped_raw
      WHERE source = ${source}
        AND source_id = ANY(${this.sql.array([...new Set(sourceIds)])})
    `
    return new Set(rows.map((row) => row.source_id))
  }

  async claim(source: string, flow: ScrapeFlow, owner: string, leaseMs = 30 * 60_000) {
    await this.ensure(source, flow)
    const leaseUntil = new Date(Date.now() + leaseMs)
    const [row] = await this.sql<{
      id: string
      source: string
      flow: ScrapeFlow
      cursor: PageCursor
      watermark: ScrapeWatermark | null
      consecutive_known_items: number
      consecutive_failures: number
    }[]>`
      UPDATE scrape_checkpoints
      SET status = 'running',
          lease_owner = ${owner},
          lease_expires_at = ${leaseUntil},
          updated_at = now()
      WHERE source = ${source}
        AND flow = ${flow}
        AND status NOT IN ('paused', 'exhausted')
        AND (cooldown_until IS NULL OR cooldown_until <= now())
        AND (next_run_at IS NULL OR next_run_at <= now())
        AND (lease_expires_at IS NULL OR lease_expires_at <= now() OR lease_owner = ${owner})
      RETURNING id, source, flow, cursor, watermark,
                consecutive_known_items, consecutive_failures
    `
    if (!row) return null
    return {
      id: row.id,
      source: row.source,
      flow: row.flow,
      cursor: row.cursor,
      watermark: row.watermark,
      consecutiveKnownItems: row.consecutive_known_items,
      consecutiveFailures: row.consecutive_failures,
    } satisfies ClaimedCheckpoint
  }

  async startRun(checkpoint: ClaimedCheckpoint) {
    const [row] = await this.sql<{ id: string }[]>`
      INSERT INTO scrape_runs (source, flow, cursor_before)
      VALUES (${checkpoint.source}, ${checkpoint.flow}, ${this.sql.json(jsonValue(checkpoint.cursor))})
      RETURNING id
    `
    if (!row) throw new Error('Failed to create scrape run')
    return row.id
  }

  async succeed(input: {
    checkpoint: ClaimedCheckpoint
    runId: string
    owner: string
    cursor: PageCursor
    watermark: ScrapeWatermark | null
    consecutiveKnownItems: number
    exhausted: boolean
    totals: RunTotals
    stopReason: string
    nextRunAt: Date
  }) {
    await this.sql.begin(async (tx) => {
      await tx`
        UPDATE scrape_runs
        SET status = 'succeeded', cursor_after = ${tx.json(jsonValue(input.cursor))},
            found_count = ${input.totals.found}, new_count = ${input.totals.saved},
            updated_count = ${input.totals.updated}, known_count = ${input.totals.known},
            error_count = ${input.totals.errors}, stop_reason = ${input.stopReason},
            finished_at = now()
        WHERE id = ${input.runId}
      `
      await tx`
        UPDATE scrape_checkpoints
        SET status = ${input.exhausted && input.checkpoint.flow === 'backfill' ? 'exhausted' : 'idle'},
            cursor = ${tx.json(jsonValue(input.cursor))},
            watermark = ${input.watermark ? tx.json(jsonValue(input.watermark)) : null},
            consecutive_known_items = ${input.consecutiveKnownItems},
            consecutive_failures = 0, exhausted = ${input.exhausted},
            lease_owner = NULL, lease_expires_at = NULL, cooldown_until = NULL,
            last_success_at = now(), next_run_at = ${input.nextRunAt}, updated_at = now()
        WHERE id = ${input.checkpoint.id} AND lease_owner = ${input.owner}
      `
    })
  }

  async fail(input: {
    checkpoint: ClaimedCheckpoint
    runId: string
    owner: string
    error: unknown
  }) {
    const failures = input.checkpoint.consecutiveFailures + 1
    const cooldownUntil = new Date(Date.now() + nextBackoffMs(failures))
    const message = input.error instanceof Error ? input.error.message : String(input.error)
    await this.sql.begin(async (tx) => {
      await tx`
        UPDATE scrape_runs
        SET status = 'failed', error_count = 1, error_message = ${message}, finished_at = now()
        WHERE id = ${input.runId}
      `
      await tx`
        UPDATE scrape_checkpoints
        SET status = 'cooldown', consecutive_failures = ${failures},
            cooldown_until = ${cooldownUntil}, next_run_at = ${cooldownUntil},
            lease_owner = NULL, lease_expires_at = NULL, updated_at = now()
        WHERE id = ${input.checkpoint.id} AND lease_owner = ${input.owner}
      `
    })
  }
}
