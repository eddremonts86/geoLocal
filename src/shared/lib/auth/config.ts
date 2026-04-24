const DEFAULT_BETTER_AUTH_URL = 'http://localhost:3001'
const DEFAULT_DEV_SECRET = 'dev-only-geo-dashboard-secret-change-me-1234567890'

function readEnvValue(name: string): string | undefined {
  if (typeof process !== 'undefined' && process.env[name]) {
    return process.env[name]
  }
  const meta = import.meta as ImportMeta & { env?: Record<string, string> }
  return meta.env?.[name]
}

export function getBetterAuthUrl(): string {
  return readEnvValue('BETTER_AUTH_URL') ?? readEnvValue('VITE_BETTER_AUTH_URL') ?? DEFAULT_BETTER_AUTH_URL
}

export function getBetterAuthSecret(): string {
  return readEnvValue('BETTER_AUTH_SECRET') ?? DEFAULT_DEV_SECRET
}
