import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const testDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(testDirectory, '..')
const entrypointPath = resolve(projectRoot, 'scripts/docker-app-entrypoint.sh')
const envValuePath = resolve(projectRoot, 'scripts/db/env-value.ts')

test('Docker startup migrates, ensures the default admin, then starts the server', () => {
  assert.equal(existsSync(entrypointPath), true, 'Docker app entrypoint is missing')

  const entrypoint = readFileSync(entrypointPath, 'utf8')
  const migrationIndex = entrypoint.indexOf('scripts/db/apply-scraping-orchestration-migration.ts')
  const seedAdminIndex = entrypoint.indexOf('scripts/db/seed-admin.ts')
  const serverIndex = entrypoint.indexOf('server.prod.mjs')

  assert.ok(migrationIndex >= 0, 'Scraping migration command is missing')
  assert.ok(seedAdminIndex > migrationIndex, 'Admin seed must run after migrations')
  assert.ok(seedAdminIndex >= 0, 'Admin seed command is missing')
  assert.ok(serverIndex > seedAdminIndex, 'Production server must start after the admin seed')

  const dockerfile = readFileSync(resolve(projectRoot, 'Dockerfile'), 'utf8')
  assert.match(dockerfile, /CMD \["sh", "scripts\/docker-app-entrypoint\.sh"\]/)
  assert.match(
    dockerfile,
    /FROM base AS builder[\s\S]*?ENV NODE_ENV=production[\s\S]*?RUN pnpm build/,
    'Production assets must be built with NODE_ENV=production',
  )
})

test('Docker env values discard unquoted inline comments', async () => {
  assert.equal(existsSync(envValuePath), true, 'Docker env normalizer is missing')

  const { normalizeDockerEnvValue } = await import(envValuePath)

  assert.equal(normalizeDockerEnvValue('admin@example.com # local admin'), 'admin@example.com')
  assert.equal(normalizeDockerEnvValue('secret # local password'), 'secret')
  assert.equal(normalizeDockerEnvValue('value#kept'), 'value#kept')
  assert.equal(normalizeDockerEnvValue(undefined), undefined)
})
