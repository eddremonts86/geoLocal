import assert from 'node:assert/strict'
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

const testDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(testDirectory, '..')
const entrypoint = resolve(projectRoot, 'scripts/scraping/docker-entrypoint.sh')

test('scheduled scraper launches independent backfill and incremental flows', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'geolocal-scraper-schedule-'))
  const fakeBin = join(fixture, 'bin')
  const nodeBin = join(fixture, 'node_modules/.bin')
  mkdirSync(fakeBin, { recursive: true })
  mkdirSync(nodeBin, { recursive: true })

  writeFileSync(join(nodeBin, 'tsx'), '#!/bin/sh\nprintf "%s\\n" "$*"\nexit 0\n')
  writeFileSync(join(fakeBin, 'sleep'), '#!/bin/sh\nexit 42\n')
  chmodSync(join(nodeBin, 'tsx'), 0o755)
  chmodSync(join(fakeBin, 'sleep'), 0o755)

  const result = spawnSync('/bin/sh', [entrypoint, '--source', 'all'], {
    cwd: fixture,
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${fakeBin}:${process.env.PATH}`,
      SCRAPE_SCHEDULE: 'true',
      SCRAPE_BACKFILL_INTERVAL_MINUTES: '20',
      SCRAPE_INCREMENTAL_INTERVAL_HOURS: '6',
    },
  })

  assert.equal(result.status, 0)
  assert.match(result.stdout, /scheduler\.ts/)

  const compose = readFileSync(resolve(projectRoot, 'docker-compose.yml'), 'utf8')
  assert.match(compose, /SCRAPE_BACKFILL_INTERVAL_MINUTES: '\$\{SCRAPE_BACKFILL_INTERVAL_MINUTES:-20\}'/)
  assert.match(compose, /SCRAPE_INCREMENTAL_INTERVAL_HOURS: '\$\{SCRAPE_INCREMENTAL_INTERVAL_HOURS:-6\}'/)
})
