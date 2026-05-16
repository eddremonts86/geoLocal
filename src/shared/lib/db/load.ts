export async function loadDb() {
  const { getDb } = await import('@/shared/lib/db/index')
  return getDb()
}
