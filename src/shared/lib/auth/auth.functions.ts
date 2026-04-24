import { createServerFn } from '@tanstack/react-start'

export const getAuthSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    await import('./server')
    // TODO: read session from request headers
    return null
  },
)

export const ensureAdminSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await getAuthSession()
    if (!session) {
      throw new Error('Unauthorized')
    }
    return session
  },
)
