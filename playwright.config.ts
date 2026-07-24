import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for geoLocal audit.
 *
 * Runs against the live production site (https://geo.eduardoinerarte.dk) for
 * smoke tests, and against any BASE_URL for fast dev-loop tests.
 *
 * IMPORTANT: this project has a local Chrome-for-Testing 1228 build that
 * the npm `playwright` package doesn't know about (it expects 1217). We
 * override `executablePath` so tests work without re-downloading browsers.
 */
const CHROME_PATH = '/Users/edd/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: ['**/_helpers.ts', '**/_smoke.mjs', '**/README.md'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list']],

  use: {
    baseURL: process.env.BASE_URL || 'https://geo.eduardoinerarte.dk',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { executablePath: CHROME_PATH },
      },
    },
    {
      name: 'mobile-iphone',
      use: {
        ...devices['iPhone 13'],
        launchOptions: { executablePath: CHROME_PATH },
      },
    },
  ],
})
