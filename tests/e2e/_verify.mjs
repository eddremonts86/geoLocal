import { chromium } from '@playwright/test'
const browser = await chromium.launch({
  headless: true,
  executablePath: '/Users/edd/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
})
const ctx = await browser.newContext({ locale: 'es-ES' })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('PAGE: ' + e.message))
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()) })

await page.goto('https://geo.eduardoinerarte.dk/', { waitUntil: 'networkidle' })
await page.waitForTimeout(3000)
const hydrationErrors = errors.filter(e => e.includes('418') || e.includes('hydrat'))
console.log(`hydration errors: ${hydrationErrors.length}`)
hydrationErrors.forEach(e => console.log('  -', e))
const htmlLang = await page.evaluate(() => document.documentElement.getAttribute('lang'))
console.log(`html lang: ${htmlLang}`)
console.log(`other errors: ${errors.length - hydrationErrors.length}`)
errors.filter(e => !hydrationErrors.includes(e)).forEach(e => console.log('  -', e))
await browser.close()
