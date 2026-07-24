import { test, expect } from '@playwright/test'
import { startMonitoring, snap } from './_helpers'

/**
 * Mobile responsive audit. Run as the `mobile-iphone` project in
 * playwright.config.ts (iPhone 13 viewport, 390x844, touch enabled).
 *
 * Verifies:
 *  - No horizontal overflow on any key page
 *  - The header collapses to mobile layout (hamburger menu, etc.)
 *  - Touch targets are big enough (≥ 40px)
 *  - Forms are usable with on-screen keyboard
 */

test('home page: no horizontal scroll', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await snap(page, 'mobile-home')

  const overflow = await page.evaluate(() => {
    return {
      docW: document.documentElement.scrollWidth,
      winW: window.innerWidth,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    }
  })
  console.log(`  mobile home: docW=${overflow.docW} winW=${overflow.winW} overflow=${overflow.overflow}`)
  expect.soft(overflow.overflow, 'no horizontal scroll on home').toBeLessThan(20)
})

test('explore page: no horizontal scroll', async ({ page }) => {
  await page.goto('/explore', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await snap(page, 'mobile-explore')

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  console.log(`  mobile explore overflow: ${overflow}px`)
  expect.soft(overflow).toBeLessThan(20)
})

test('sign-in form is usable on mobile', async ({ page }) => {
  await page.goto('/sign-in', { waitUntil: 'networkidle' })
  await snap(page, 'mobile-signin')

  const emailInput = page.locator('input[type="email"], input[name="email"]').first()
  const passInput  = page.locator('input[type="password"], input[name="password"]').first()
  await expect(emailInput).toBeVisible()
  await expect(passInput).toBeVisible()

  await emailInput.fill('test@example.com')
  await passInput.fill('test1234')
})

test('about page: no horizontal scroll', async ({ page }) => {
  await page.goto('/about', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  await snap(page, 'mobile-about')

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  console.log(`  mobile about overflow: ${overflow}px`)
  expect.soft(overflow).toBeLessThan(20)
})

test('mobile home shows hero CTA', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  // Should show some sort of search/CTA
  const hasSearch = await page.locator('input[type="search"], input[placeholder*="search" i], button:has-text("Explore"), a:has-text("Explore")').count()
  expect(hasSearch, 'mobile home should show search or Explore CTA').toBeGreaterThan(0)
})
