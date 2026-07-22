export function normalizeDockerEnvValue(value: string | undefined): string | undefined {
  if (value === undefined) return undefined

  const normalized = value.replace(/\s+#.*$/, '').trim()
  return normalized || undefined
}
