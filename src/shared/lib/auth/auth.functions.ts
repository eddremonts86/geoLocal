import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

export const getAuthSession = createServerFn({ method: 'GET' }).handler(async () => {
  const { auth } = await import('./better-auth')
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })
  return session ?? null
})

export const ensureAdminSession = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await getAuthSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
})
