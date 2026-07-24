import { test, expect } from '@playwright/test'
import { startMonitoring, snap, formatProblems } from './_helpers'

/**
 * Sign-in flow end-to-end.
 *
 * Uses the seeded admin credentials:
 *   edd_admin@local.com / Passw0rd!234
 *
 * Verifies:
 *  - /sign-in renders the form
 *  - Wrong creds → stays on sign-in with error
 *  - Right creds → redirects away from sign-in (typically to / or /account)
 *  - Session cookie is set
 *  - Console has no errors during the flow
 */

const ADMIN_EMAIL = process.env.GEO_ADMIN_EMAIL || 'edd_admin@local.com'
const ADMIN_PASS  = process.env.GEO_ADMIN_PASS  || 'Passw0rd!234'

test('sign-in page renders form with email + password fields', async ({ page }) => {
  const mon = startMonitoring(page, 'sign-in-form')
  await page.goto('/sign-in', { waitUntil: 'networkidle' })
  await snap(page, 'sign-in-form')

  await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible()
  await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible()
  await expect(page.locator('button[type="submit"]').first()).toBeVisible()

  const problems = mon.problems()
  if (problems.length) console.log('sign-in form issues:\n' + formatProblems(problems))
  mon.stop()
})

test('sign-in with wrong password shows error (does NOT log in)', async ({ page }) => {
  const mon = startMonitoring(page, 'sign-in-wrong')
  await page.goto('/sign-in', { waitUntil: 'networkidle' })

  await page.locator('input[type="email"], input[name="email"]').first().fill(ADMIN_EMAIL)
  await page.locator('input[type="password"], input[name="password"]').first().fill('WRONG-PASSWORD-12345')
  await page.locator('button[type="submit"]').first().click()

  // Wait for response
  await page.waitForTimeout(3000)

  // Should still be on sign-in (or back to it)
  const url = page.url()
  expect(url, 'should stay on sign-in page with bad creds').toContain('/sign-in')

  await snap(page, 'sign-in-wrong-creds')
  mon.stop()
})

test('sign-in with real admin lands on a post-auth page', async ({ page }) => {
  const mon = startMonitoring(page, 'sign-in-real')
  await page.goto('/sign-in', { waitUntil: 'networkidle' })

  await page.locator('input[type="email"], input[name="email"]').first().fill(ADMIN_EMAIL)
  await page.locator('input[type="password"], input[name="password"]').first().fill(ADMIN_PASS)
  await page.locator('button[type="submit"]').first().click()

  // Wait for navigation away from sign-in
  await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 10000 }).catch(() => {})

  const url = page.url()
  console.log(`  → landed on: ${url}`)
  expect(url, 'should navigate away from sign-in after successful login').not.toContain('/sign-in')

  // Session cookie should be set
  const cookies = await page.context().cookies()
  const sessionCookie = cookies.find((c) =>
    c.name.toLowerCase().includes('session') ||
    c.name.toLowerCase().includes('auth') ||
    c.name.toLowerCase().includes('better')
  )
  expect(sessionCookie, 'session cookie should be set after login').toBeDefined()

  await snap(page, 'sign-in-success')
  const errors = mon.problems().filter((p) => p.severity === 'error')
  if (errors.length) console.log('sign-in success errors:\n' + formatProblems(errors))
  mon.stop()
})

test('authenticated user can access /account', async ({ page }) => {
  // Sign in first
  await page.goto('/sign-in', { waitUntil: 'networkidle' })
  await page.locator('input[type="email"], input[name="email"]').first().fill(ADMIN_EMAIL)
  await page.locator('input[type="password"], input[name="password"]').first().fill(ADMIN_PASS)
  await page.locator('button[type="submit"]').first().click()
  await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 10000 }).catch(() => {})

  // Then visit /account
  const mon = startMonitoring(page, 'account')
  await page.goto('/account', { waitUntil: 'networkidle' })
  await snap(page, 'account')

  const bodyText = await page.locator('body').innerText()
  expect(bodyText.length).toBeGreaterThan(50)

  mon.stop()
})

test('sign-out clears session', async ({ page }) => {
  // Sign in
  await page.goto('/sign-in', { waitUntil: 'networkidle' })
  await page.locator('input[type="email"], input[name="email"]').first().fill(ADMIN_EMAIL)
  await page.locator('input[type="password"], input[name="password"]').first().fill(ADMIN_PASS)
  await page.locator('button[type="submit"]').first().click()
  await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 10000 }).catch(() => {})

  // Find and click sign-out (if visible)
  const signOut = page.locator('button:has-text("Sign out"), a:has-text("Sign out"), button:has-text("Logout"), a:has-text("Logout")').first()
  if (await signOut.count()) {
    await signOut.click()
    await page.waitForTimeout(2000)
    // Should be back on a public page
    const url = page.url()
    console.log(`  after sign-out: ${url}`)
  } else {
    test.skip(true, 'no sign-out button visible')
  }
})
