import { chromium } from '@playwright/test'
const browser = await chromium.launch({
  headless: true,
  executablePath: '/Users/edd/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
})
const ctx = await browser.newContext({ locale: 'es-ES' })
const page = await ctx.newPage()
const errors = []
const failed = []
page.on('pageerror', e => errors.push('PAGE: ' + e.message))
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()) })
page.on('response', r => { if (r.status() >= 500) failed.push(`5xx: ${r.status()} ${r.url()}`) })

await page.goto('https://geo.eduardoinerarte.dk/', { waitUntil: 'networkidle' })
await page.waitForTimeout(3000)

const hydrationErrors = errors.filter(e => e.includes('418') || e.includes('hydrat'))
console.log(`hydration errors: ${hydrationErrors.length}`)
hydrationErrors.forEach(e => console.log('  -', e))

const htmlLang = await page.evaluate(() => document.documentElement.getAttribute('lang'))
console.log(`html lang: ${htmlLang}`)

const bodyText = await page.locator('body').innerText()
const startsEs = bodyText.includes('INMUEBLES') || bodyText.includes('VEHÍCULOS') || bodyText.includes('Copenhague')
console.log(`content is Spanish: ${startsEs}`)
console.log(`first 200 chars: ${bodyText.slice(0, 200).replace(/\n/g, ' | ')}`)

console.log(`5xx errors: ${failed.length}`)
failed.forEach(f => console.log('  -', f))
console.log(`other console errors: ${errors.filter(e => !hydrationErrors.includes(e)).length}`)
errors.filter(e => !hydrationErrors.includes(e)).slice(0, 5).forEach(e => console.log('  -', e))

// Test the cookie path
console.log('\n=== with cookie set to es ===')
await ctx.clearCookies()
await ctx.addCookies([{ name: 'geolocal-locale', value: 'es', url: 'https://geo.eduardoinerarte.dk' }])
const page2 = await ctx.newPage()
const errors2 = []
page2.on('pageerror', e => errors2.push('PAGE: ' + e.message))
await page2.goto('https://geo.eduardoinerarte.dk/', { waitUntil: 'networkidle' })
await page2.waitForTimeout(2000)
const hydration2 = errors2.filter(e => e.includes('418') || e.includes('hydrat'))
console.log(`hydration errors with cookie=es: ${hydration2.length}`)
const langAttr2 = await page2.evaluate(() => document.documentElement.getAttribute('lang'))
console.log(`html lang: ${langAttr2}`)
const body2 = await page2.locator('body').innerText()
const isEs2 = body2.includes('INMUEBLES') || body2.includes('VEHÍCULOS')
console.log(`content is Spanish: ${isEs2}`)
console.log(`first 200 chars: ${body2.slice(0, 200).replace(/\n/g, ' | ')}`)

await browser.close()
