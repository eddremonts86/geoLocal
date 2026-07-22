import type { ScrapedSource } from './types'

export interface ParsedRunnerOptions {
  sources: ScrapedSource[]
  maxItems: number
  dryRun: boolean
  skipAI: boolean
  flow: 'backfill' | 'incremental'
}

function optionValue(args: string[], name: string): string | undefined {
  const inline = args.find((arg) => arg.startsWith(`${name}=`))
  if (inline) return inline.slice(name.length + 1)
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}

export function parseRunnerArgs(
  args: string[],
  knownSources: ScrapedSource[],
): ParsedRunnerOptions {
  const rawFlow = optionValue(args, '--flow') ?? 'backfill'
  if (rawFlow !== 'backfill' && rawFlow !== 'incremental') {
    throw new Error(`Unknown flow "${rawFlow}". Expected backfill or incremental.`)
  }

  const rawSource = optionValue(args, '--source')
  const sources = !rawSource || rawSource === 'all'
    ? [...knownSources]
    : rawSource.split(',').map((source) => source.trim()).filter(Boolean)
  const invalid = sources.filter((source) => !knownSources.includes(source))
  if (invalid.length) {
    throw new Error(`No runnable scraper registered for: ${invalid.join(', ')}`)
  }

  const rawMax = optionValue(args, '--max')
  const parsedMax = rawMax ? Number.parseInt(rawMax, 10) : 100
  return {
    sources,
    maxItems: Number.isFinite(parsedMax) && parsedMax > 0 ? parsedMax : 100,
    dryRun: args.includes('--dry-run'),
    skipAI: args.includes('--skip-ai'),
    flow: rawFlow,
  }
}
