// ─── Cookie saver helper ──────────────────────────────────────────────────────
// Opens a visible browser window so you can log in manually.
// After login, press Enter in the terminal to save cookies to a local file.
//
// Usage:
//   npx tsx scripts/scraping/helpers/save-cookies.ts --source facebook
//   npx tsx scripts/scraping/helpers/save-cookies.ts --source linkedin

import { chromium } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as readline from 'node:readline'

const SOURCE_URLS: Record<string, string> = {
  facebook: 'https://www.facebook.com/login',
  linkedin: 'https://www.linkedin.com/login',
}

const COOKIE_FILES: Record<string, string> = {
  facebook: path.join(import.meta.dirname, '../.fb-cookies.json'),
  linkedin: path.join(import.meta.dirname, '../.linkedin-cookies.json'),
}

async function main() {
  const sourceArg = process.argv.find((a) => a.startsWith('--source=') || a === '--source')
  const source = sourceArg?.includes('=')
    ? sourceArg.split('=')[1]!
    : process.argv[process.argv.indexOf('--source') + 1]

  if (!source || !SOURCE_URLS[source]) {
    console.error('Usage: npx tsx save-cookies.ts --source facebook|linkedin')
    process.exit(1)
  }

  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  console.log(`\nOpening ${source} login page...`)
  console.log('Log in manually in the browser window that opens.')
  console.log('Once logged in, come back here and press Enter to save cookies.\n')

  await page.goto(SOURCE_URLS[source]!, { waitUntil: 'domcontentloaded' })

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  await new Promise<void>((resolve) => {
    rl.question('Press Enter after you are logged in... ', () => {
      rl.close()
      resolve()
    })
  })

  const cookies = await context.cookies()
  const filePath = COOKIE_FILES[source]!
  fs.writeFileSync(filePath, JSON.stringify(cookies, null, 2))
  console.log(`\nCookies saved to: ${filePath}`)
  console.log(`Total cookies: ${cookies.length}`)

  await browser.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
