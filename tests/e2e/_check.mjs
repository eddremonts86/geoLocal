import { chromium } from '@playwright/test'
const browser = await chromium.launch({
  headless: true,
  executablePath: '/Users/edd/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
})
const ctx = await browser.newContext({ locale: 'es-ES' })
const page = await ctx.newPage()

// Monitor i18n changes
await page.exposeFunction('logI18n', (msg) => console.log('CLIENT:', msg))

// Add init script that runs before page loads
await page.addInitScript(() => {
  // Capture if React errors happen
  window.__hydrationError = null
  const origError = console.error
  console.error = function(...args) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('418')) {
      window.__hydrationError = args.join(' ')
    }
    return origError.apply(console, args)
  }
  window.addEventListener('error', (e) => {
    if (e.message && e.message.includes('418')) {
      window.__hydrationError = e.message
    }
  })
})

const errors = []
page.on('pageerror', e => errors.push('PAGE: ' + e.message))
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()) })

await page.goto('https://geo.eduardoinerarte.dk/', { waitUntil: 'domcontentloaded' })

// Check at various times
for (const t of [0, 50, 100, 500, 1500, 3000]) {
  await page.waitForTimeout(t === 0 ? 100 : (t - (t === 50 ? 100 : 0)))
  const state = await page.evaluate(() => ({
    lang: document.documentElement.getAttribute('lang'),
    bodySample: document.body.innerText.slice(0, 80).replace(/\n/g, ' '),
    hydrationError: window.__hydrationError,
  }))
  console.log(`t=${t}ms:`, state)
}

console.log('\n=== console errors ===')
errors.forEach(e => console.log(' -', e))
await browser.close()
