export const SOURCE_PAUSE_REASONS: Record<string, string> = {
  airbnb: 'Authorization required by source terms',
  facebook: 'Authorization required by source terms',
  'facebook-events': 'Authorization required by source terms',
  linkedin: 'Explicit crawl permission required',
  dba: 'Automated collection requires explicit permission',
  boligsiden: 'Current adapter uses a robots-disallowed API path; commercial API required',
  boliga: 'Current adapter depends on anti-bot circumvention and must be replaced',
}

export function isSourceRunnable(source: string): boolean {
  return !SOURCE_PAUSE_REASONS[source]
}
