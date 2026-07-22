#!/usr/bin/env tsx

import { runScraping } from './runner'

function positiveNumber(value: string | undefined, fallback: number, name: string): number {
  const parsed = value === undefined ? fallback : Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`${name} must be a positive number`)
  return parsed
}

export function schedulerIntervals(env: NodeJS.ProcessEnv = process.env) {
  return {
    backfillMs:
      positiveNumber(env.SCRAPE_BACKFILL_INTERVAL_MINUTES, 20, 'SCRAPE_BACKFILL_INTERVAL_MINUTES') *
      60_000,
    incrementalMs:
      positiveNumber(env.SCRAPE_INCREMENTAL_INTERVAL_HOURS, 6, 'SCRAPE_INCREMENTAL_INTERVAL_HOURS') *
      60 *
      60_000,
  }
}

const running = new Set<string>()

async function runFlow(flow: 'backfill' | 'incremental') {
  if (running.has(flow)) {
    console.warn(`[scheduler] ${flow} tick skipped because the previous run is still active`)
    return
  }
  running.add(flow)
  try {
    const args = ['--flow', flow, '--source', 'all', '--max', process.env.SCRAPE_BATCH_SIZE ?? '100']
    if (process.env.SCRAPE_SKIP_AI !== 'false') args.push('--skip-ai')
    await runScraping(args)
  } catch (error) {
    console.error(`[scheduler] ${flow} failed`, error)
  } finally {
    running.delete(flow)
  }
}

export async function startScheduler() {
  const intervals = schedulerIntervals()
  console.log(
    `[scheduler] backfill every ${intervals.backfillMs / 60_000}m; incremental every ${intervals.incrementalMs / 3_600_000}h`,
  )
  await runFlow('backfill')
  await runFlow('incremental')
  setInterval(() => void runFlow('backfill'), intervals.backfillMs)
  setInterval(() => void runFlow('incremental'), intervals.incrementalMs)
}

startScheduler().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
