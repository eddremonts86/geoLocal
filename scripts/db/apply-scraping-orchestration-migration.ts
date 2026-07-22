import { readFile } from 'node:fs/promises'
import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required to apply migrations')

const migrationName = '0010_scraping_orchestration'
const sql = postgres(databaseUrl, { max: 1, prepare: false })

try {
  await sql`
    CREATE TABLE IF NOT EXISTS app_migrations (
      name text PRIMARY KEY,
      applied_at timestamp NOT NULL DEFAULT now()
    )
  `
  const [existing] = await sql<{ exists: boolean }[]>`
    SELECT EXISTS(SELECT 1 FROM app_migrations WHERE name = ${migrationName}) AS exists
  `
  if (!existing?.exists) {
    const migration = await readFile(
      new URL('../../drizzle/0010_scraping_orchestration.sql', import.meta.url),
      'utf8',
    )
    await sql.begin(async (transaction) => {
      await transaction.unsafe(migration)
      await transaction`INSERT INTO app_migrations (name) VALUES (${migrationName})`
    })
    console.log(`[migration] Applied ${migrationName}`)
  } else {
    console.log(`[migration] ${migrationName} already applied`)
  }
} finally {
  await sql.end({ timeout: 5 })
}
