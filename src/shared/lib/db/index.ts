import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null

export const getDb = () => {
  if (dbInstance) return dbInstance

  if (typeof window !== 'undefined') {
    throw new Error('Database connection cannot be initialized in the browser')
  }

  const connectionString =
    process.env.DATABASE_URL || (import.meta as unknown as { env?: Record<string, string> }).env?.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined')
  }

  const client = postgres(connectionString, { prepare: false })
  dbInstance = drizzle(client, { schema })
  return dbInstance
}
