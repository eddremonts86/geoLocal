export async function loadDb() {
  const { getDb } = await import('@/shared/lib/db')
  return getDb()
}
