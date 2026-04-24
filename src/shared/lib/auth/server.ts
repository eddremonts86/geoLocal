import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { getDb } from '@/shared/lib/db'
import { users, sessions, accounts, verifications } from '@/shared/lib/db/schema'
import { getBetterAuthSecret, getBetterAuthUrl } from './config'

const db = getDb()

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  baseURL: getBetterAuthUrl(),
  secret: getBetterAuthSecret(),
  emailAndPassword: { enabled: true },
  plugins: [tanstackStartCookies()],
})
