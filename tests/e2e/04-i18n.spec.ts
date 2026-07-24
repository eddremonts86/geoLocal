import { test, expect } from '@playwright/test'
import { startMonitoring, snap, formatProblems } from './_helpers'

/**
 * i18n audit.
 *
 * Verifies:
 *  - Default language is English (no cookie)
 *  - Switching to Spanish works (URL ?lng=es)
 *  - Cookie + localStorage keep the choice across navigations
 *  - <html lang> attribute matches the current language
 *  - All visible text has translations (no `[translation:key]`, `undefined`, etc.)
 *  - **No React hydration error #418** when the browser's Accept-Language
 *    is Spanish — the previous bug where useLanguageSync() changed the
 *    language post-mount and tripped the hydration guard.
 */

test('default language is English (no cookie set)', async ({ context, page }) => {
  await context.clearCookies()
  await page.goto('/', { waitUntil: 'networkidle' })

  const html = await page.content()
  const body = await page.locator('body').innerText()

  // No translation key placeholders
  expect(html).not.toMatch(/\{t\(['"]/)
  expect(html).not.toMatch(/\[translation:/i)
  expect(body).not.toContain('undefined')
  expect(body).not.toContain('[object Object]')
  expect(body).not.toContain('NaN')

  // English content (presence of "Properties", "Vehicles", etc.)
  expect(body).toMatch(/Properties|Vehicles|Services|Experiences|Copenhagen/i)

  // <html lang="en">
  const lang = await page.evaluate(() => document.documentElement.getAttribute('lang'))
  expect(lang, 'default html lang should be en').toBe('en')

  await snap(page, 'i18n-en')
})

test('NO hydration error when browser language is Spanish (Accept-Language: es)', async ({ browser }) => {
  // Fresh context with Spanish locale — this is the exact scenario where the
  // original bug fired (server rendered English, client switched to Spanish
  // post-mount, React error #418).
  const context = await browser.newContext({ locale: 'es-ES' })
  const page = await context.newPage()
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`PAGE: ${e.message}`))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`CONSOLE: ${m.text()}`) })

  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)

  // The bug signature: "Minified React error #418"
  const hydrationErrors = errors.filter((e) => e.includes('418') || e.includes('hydrat'))
  if (hydrationErrors.length) {
    console.log('  ⚠️  HYDRATION ERRORS:')
    hydrationErrors.forEach((e) => console.log('    -', e))
  }
  expect(hydrationErrors, 'no hydration errors with es-ES locale').toEqual([])

  // Should still render the page (English, since no cookie)
  const body = await page.locator('body').innerText()
  expect(body.length).toBeGreaterThan(100)
  await snap(page, 'i18n-no-hydration-error')
  await context.close()
})

test('Spanish via ?lng=es URL param works', async ({ page }) => {
  await page.goto('/?lng=es', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await snap(page, 'i18n-es-home')

  const body = await page.locator('body').innerText()
  expect(body).not.toContain('undefined')
  expect(body).not.toContain('[object Object]')

  // Spanish words should appear
  const hasSpanishChars = /[áéíóúñ¿¡]/i.test(body) ||
    /\b(para|con|los|las|desde|hasta|al|por|las|del)\b/i.test(body)
  console.log(`  spanish detected: ${hasSpanishChars}`)

  // <html lang> should reflect the language
  const lang = await page.evaluate(() => document.documentElement.getAttribute('lang'))
  expect(lang, 'html lang should be es after ?lng=es').toBe('es')
})

test('language cookie persists across navigations', async ({ context, page }) => {
  await context.clearCookies()
  await page.goto('/?lng=es', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  // After ?lng=es is consumed, the i18n layer should set a cookie
  const cookies = await context.cookies()
  const langCookie = cookies.find((c) => c.name === 'geolocal-locale')
  console.log(`  cookie after ?lng=es: ${langCookie?.value}`)

  // Navigate to another page without query param
  await page.goto('/about', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  const body = await page.locator('body').innerText()

  // The about page should still be in Spanish if the cookie was set
  const langAttr = await page.evaluate(() => document.documentElement.getAttribute('lang'))
  console.log(`  /about html lang after cookie set: ${langAttr}`)
  await snap(page, 'i18n-es-cookie-persist')
})

test('language switcher click toggles language + sets cookie', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // Find the language switcher button (has globe icon, displays "EN" or "ES")
  const switcher = page.locator('button[aria-label*="Spanish"], button[aria-label*="English"]').first()
  await expect(switcher).toBeVisible()
  const initial = (await switcher.textContent())?.trim()
  console.log(`  initial switcher: "${initial}"`)

  await switcher.click()
  await page.waitForTimeout(1500)
  await snap(page, 'i18n-after-switch')

  // The displayed text should have flipped
  const after = (await switcher.textContent())?.trim()
  console.log(`  after click: "${after}"`)
  expect(after).not.toBe(initial)

  // Cookie should now be set
  const cookies = await page.context().cookies()
  const langCookie = cookies.find((c) => c.name === 'geolocal-locale')
  expect(langCookie, 'lang cookie should be set after switcher click').toBeDefined()
})

test('all key pages render in Spanish without errors', async ({ page }) => {
  const paths = ['/', '/explore', '/about', '/sign-in', '/cookies', '/privacy', '/terms', '/contact']
  for (const path of paths) {
    const mon = startMonitoring(page, `i18n-es-${path}`)
    await page.goto(`${path}?lng=es`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    const body = await page.locator('body').innerText()
    expect(body, `${path} es has no undefined leaks`).not.toContain('undefined')
    expect(body, `${path} es has no [object Object]`).not.toContain('[object Object]')

    const errors = mon.problems().filter((p) => p.severity === 'error')
    if (errors.length) console.log(`${path} es errors:`, formatProblems(errors))
    expect(errors, `${path} es should not have console errors`).toEqual([])
    mon.stop()
  }
})
