import { describe, expect, it } from 'vitest'
import { parseRunnerArgs } from '../../scripts/scraping/runner-options'

describe('scraping runner options', () => {
  const sources = ['homestra', 'bilbasen', 'edc']

  it('defaults to backfill and all runnable sources', () => {
    expect(parseRunnerArgs([], sources)).toMatchObject({
      sources,
      flow: 'backfill',
      maxItems: 100,
      dryRun: false,
    })
  })

  it('parses an incremental source slice', () => {
    expect(
      parseRunnerArgs(['--flow', 'incremental', '--source=edc', '--max', '40', '--skip-ai'], sources),
    ).toEqual({
      sources: ['edc'],
      flow: 'incremental',
      maxItems: 40,
      dryRun: false,
      skipAI: true,
    })
  })

  it('rejects unknown flows', () => {
    expect(() => parseRunnerArgs(['--flow=continuous'], sources)).toThrow('Unknown flow')
  })
})
