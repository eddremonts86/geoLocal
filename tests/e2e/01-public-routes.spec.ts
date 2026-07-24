import { test, expect } from '@playwright/test'
import { startMonitoring, snap, formatProblems, type Problem } from './_helpers'

const PUBLIC_ROUTES: { path: string; label: string; expectH1?: RegExp }[] = [
  { path: '/',         label: 'home',     expectH1: /discover|copenhagen|denmark|city|local|marketplace|search|looking/i },
  { path: '/explore',  label: 'explore',  expectH1: /explore|browse|listings|search|results|properties|vehicles|services|experiences/i },
  { path: '/about',    label: 'about',    expectH1: /marketplace|about|copenhagen|local|map|neighbourhood/i },
  { path: '/sign-in',  label: 'sign-in',  expectH1: /sign|log|enter|account/i },
  { path: '/cookies',  label: 'cookies' },
  { path: '/privacy',  label: 'privacy' },
  { path: '/terms',    label: 'terms' },
  { path: '/contact',  label: 'contact' },
  { path: '/press',    label: 'press' },
  { path: '/journal',  label: 'journal' },
  { path: '/favorites',label: 'favorites'},
]

for (const { path, label, expectH1 } of PUBLIC_ROUTES) {
  test(`public route ${path} renders 200 + no console errors`, async ({ page }) => {
    test.setTimeout(60_000)
    const mon = startMonitoring(page, label)
    const resp = await page.goto(path, { waitUntil: 'networkidle' })

    expect(resp, `no response for ${path}`).not.toBeNull()
    expect(resp!.status(), `${path} should return 200`).toBe(200)

    // Basic page structure
    await expect(page.locator('body')).toBeVisible()
    const html = await page.content()
    expect(html.length, `${path} has empty body`).toBeGreaterThan(1000)

    // No blank pages
    const bodyText = (await page.locator('body').innerText()).trim()
    expect(bodyText.length, `${path} has empty text content`).toBeGreaterThan(50)

    // No "[object Object]", undefined, NaN leaks
    expect(bodyText, `${path} should not have [object Object]`).not.toContain('[object Object]')
    expect(bodyText, `${path} should not have undefined`).not.toContain('undefined')
    expect(bodyText, `${path} should not have NaN`).not.toContain('NaN')

    // H1 sanity check if expected
    if (expectH1) {
      const h1 = await page.locator('h1').first().textContent().catch(() => null)
      if (h1) expect(h1, `${path} H1 should match`).toMatch(expectH1)
    }

    // Snapshot for the report — skip fullPage on /explore (virtualized list with 25k items)
    if (path === '/explore') {
      await page.screenshot({ path: `tests/e2e/screenshots/route-${label}.png` })
    } else {
      await snap(page, `route-${label}`)
    }

    const problems = mon.problems().filter((p: Problem) => p.severity === 'error')
    if (problems.length) {
      console.log(`\n[${label}] errors:\n${formatProblems(problems)}`)
    }
    expect(problems, `${path} has console/page errors`).toEqual([])
    mon.stop()
  })
}

test('home page shows actual listings and stats', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })

  // The landing page should show some stats (listings count, neighborhoods)
  const bodyText = await page.locator('body').innerText()
  // Look for digit-containing numbers
  const hasNumbers = /\d{2,}/.test(bodyText)
  expect(hasNumbers, 'home page should show some numbers (stats)').toBeTruthy()

  await snap(page, 'home-stats')
})

test('favicon.svg loads with 200 and is SVG', async ({ page }) => {
  const resp = await page.request.get('/favicon.svg')
  expect(resp.status()).toBe(200)
  expect(resp.headers()['content-type']).toContain('image/svg+xml')
  const body = await resp.text()
  expect(body).toContain('<svg')
})

test('no 5xx for any public route (smoke)', async ({ request }) => {
  const paths = ['/', '/explore', '/about', '/sign-in', '/cookies', '/privacy', '/terms', '/contact', '/press', '/journal', '/favorites']
  for (const p of paths) {
    const r = await request.get(p)
    expect.soft(r.status(), `${p} should not be 5xx`).toBeLessThan(500)
  }
})
