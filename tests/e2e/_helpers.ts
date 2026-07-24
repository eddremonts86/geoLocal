import { type Page, type ConsoleMessage, type Request, type Response } from '@playwright/test'

/**
 * Audit helpers for geoLocal.
 *
 * Each helper returns a `problems` array so the test can decide whether
 * to fail (`expect(problems).toEqual([])`) or just report
 * (`console.warn(problems)`). The split lets us triage severity.
 */

export type Severity = 'error' | 'warn' | 'info'

export interface Problem {
  severity: Severity
  where: string
  message: string
  detail?: string
}

/**
 * Listen to console + page errors + failed network requests on a page.
 * Returns a getter that returns the accumulated problems + a cleanup fn.
 */
export function startMonitoring(page: Page, label: string) {
  const problems: Problem[] = []

  const onConsole = (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      problems.push({
        severity: 'error',
        where: `console[${label}]`,
        message: msg.text(),
        detail: msg.location()?.url,
      })
    } else if (msg.type() === 'warning') {
      // Filter out noisy React DevTools / TanStack Router dev warnings
      const txt = msg.text()
      if (txt.includes('React DevTools')) return
      problems.push({ severity: 'warn', where: `console[${label}]`, message: txt })
    }
  }

  const onPageError = (err: Error) => {
    problems.push({ severity: 'error', where: `page[${label}]`, message: err.message })
  }

  const onRequestFailed = (req: Request) => {
    // Ignore favicon misses and aborted requests
    const url = req.url()
    if (url.endsWith('/favicon.ico')) return
    const failure = req.failure()
    problems.push({
      severity: 'warn',
      where: `net[${label}]`,
      message: `request failed: ${req.method()} ${url}`,
      detail: failure?.errorText,
    })
  }

  const onResponse = (resp: Response) => {
    const status = resp.status()
    if (status >= 500) {
      problems.push({
        severity: 'error',
        where: `net[${label}]`,
        message: `5xx response: ${status} ${resp.request().method()} ${resp.url()}`,
      })
    } else if (status >= 400 && status !== 401 && status !== 403 && status !== 404) {
      // 401/403/404 can be legitimate (e.g. sign-in form posts wrong creds
      // on purpose, /api endpoints that need auth). 4xx we want to surface:
      // 400, 405, 408, 410, 429
      problems.push({
        severity: 'warn',
        where: `net[${label}]`,
        message: `4xx response: ${status} ${resp.request().method()} ${resp.url()}`,
      })
    }
  }

  page.on('console', onConsole)
  page.on('pageerror', onPageError)
  page.on('requestfailed', onRequestFailed)
  page.on('response', onResponse)

  return {
    problems: () => problems.slice(),
    stop: () => {
      page.off('console', onConsole)
      page.off('pageerror', onPageError)
      page.off('requestfailed', onRequestFailed)
      page.off('response', onResponse)
    },
  }
}

/** Take a full-page screenshot with a label, in the audit screenshots dir. */
export async function snap(page: Page, name: string) {
  await page.screenshot({
    path: `tests/e2e/screenshots/${name}.png`,
    fullPage: true,
  })
}

/** Pretty-print problems for test output. */
export function formatProblems(problems: Problem[]): string {
  if (problems.length === 0) return '  (no problems)'
  return problems
    .map((p) => `  [${p.severity.toUpperCase()}] ${p.where}: ${p.message}${p.detail ? `\n    ${p.detail}` : ''}`)
    .join('\n')
}
