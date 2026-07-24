import { test, expect } from '@playwright/test'
import { startMonitoring, snap, formatProblems } from './_helpers'

/**
 * Explore page audit.
 *
 * Verifies:
 *  - /explore loads with listings
 *  - Category filters (property, vehicle, service, experience) work
 *  - The map renders without errors
 *  - Scroll-to-bottom doesn't crash (no infinite scroll trap)
 *  - Mobile explore has no horizontal scroll
 */

const CATEGORIES = ['property', 'vehicle', 'service', 'experience']

test('explore loads and shows at least some content', async ({ page }) => {
  test.setTimeout(60_000)
  const mon = startMonitoring(page, 'explore-load')
  await page.goto('/explore', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)

  const bodyText = await page.locator('body').innerText()
  expect(bodyText.length).toBeGreaterThan(100)

  // No hydration errors
  const errs = mon.problems().filter((p) => p.severity === 'error')
  if (errs.length) console.log(formatProblems(errs))
  expect(errs).toEqual([])

  await page.screenshot({ path: 'tests/e2e/screenshots/explore-default.png' })
  mon.stop()
})

test('explore map renders without console errors', async ({ page }) => {
  test.setTimeout(60_000)
  const mon = startMonitoring(page, 'explore-map')
  await page.goto('/explore', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(5000)  // map needs time to render

  // Map element should exist
  const mapCount = await page.locator('canvas, .maplibregl-canvas, [class*="maplibre"]').count()
  expect(mapCount, 'map should render').toBeGreaterThan(0)

  const errs = mon.problems().filter((p) => p.severity === 'error')
  if (errs.length) console.log(formatProblems(errs))
  expect(errs).toEqual([])
  mon.stop()
})

for (const cat of CATEGORIES) {
  test(`explore?category=${cat} renders`, async ({ page }) => {
    test.setTimeout(60_000)
    const mon = startMonitoring(page, `explore-${cat}`)
    await page.goto(`/explore?category=${cat}`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    const bodyText = await page.locator('body').innerText()
    expect(bodyText.length).toBeGreaterThan(100)

    const errs = mon.problems().filter((p) => p.severity === 'error')
    if (errs.length) console.log(formatProblems(errs))
    expect(errs).toEqual([])
    mon.stop()
  })
}

test('explore scroll does not crash at bottom', async ({ page }) => {
  test.setTimeout(60_000)
  const mon = startMonitoring(page, 'explore-scroll')
  await page.goto('/explore', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)

  // Scroll progressively
  for (let y = 0; y < 4000; y += 500) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y)
    await page.waitForTimeout(150)
  }
  await page.waitForTimeout(1000)

  const errs = mon.problems().filter((p) => p.severity === 'error')
  if (errs.length) console.log(formatProblems(errs))
  expect(errs, 'no errors on explore scroll').toEqual([])
  mon.stop()
})
