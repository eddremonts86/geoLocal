# GeoLocal Audit Test Suite

End-to-end browser tests for geoLocal. Run against the live production site
(`https://geo.eduardoinerarte.dk`) or any local instance via `BASE_URL`.

## Quick start

```bash
# One-time: ensure Playwright is installed
pnpm install
npx playwright install chromium   # downloads the browser

# Run all tests against prod
pnpm test:e2e

# Run just one panel
npx playwright test tests/e2e/01-public-routes.spec.ts

# Run against a local dev server
pnpm dev   # in another terminal
BASE_URL=http://localhost:3003 pnpm test:e2e
```

## Layout

| File | What it tests |
|---|---|
| `_helpers.ts`            | Reusable `startMonitoring` (console + network + page error capture), screenshot helper, problem formatter |
| `01-public-routes.spec.ts` | Every public route returns 200, renders content, no console errors |
| `02-sign-in.spec.ts`     | Full sign-in flow: form renders, wrong creds rejected, right creds work, session cookie set, /account accessible |
| `03-images.spec.ts`      | Image health on /explore and listing details; no `ERR_BLOCKED_BY_ORB`; placeholder fallback works |
| `04-i18n.spec.ts`        | English default, Spanish via URL works, no hydration error with es-ES locale, cookie persists, language switcher toggles |
| `05-a11y-seo.spec.ts`    | Every page has `<title>`, `<meta description>`, `<h1>`; `<html lang>` set; all `<img>` have alt; form fields labeled; keyboard nav works |
| `06-mobile.spec.ts`      | iPhone 13 viewport: no horizontal scroll on any key page, mobile layout works |
| `07-api-and-data.spec.ts` | `/api/health` 200, no 5xx anywhere, CORS preflight doesn't 500, static SVGs load |

## What it catches

The audit is a **smoke + regression** suite. It runs in seconds and catches:

- **Hydration mismatches** (React error #418 — see `04-i18n.spec.ts`)
- **Image hosting failures** (Unsplash 404s → ORB blocks → `03-images.spec.ts`)
- **5xx responses** anywhere in the public surface
- **Console errors** (uncaught exceptions, missing keys, etc.)
- **Missing meta tags** (SEO regression)
- **Missing `alt` attributes** (a11y regression)
- **Horizontal scroll on mobile** (responsive regression)
- **Broken sign-in flow** (auth regression)
- **Translation key placeholders leaking** into the DOM

It does **not** catch:
- Business-logic bugs in queries
- Performance regressions (use a separate Lighthouse run for that)
- Visual regressions (use screenshot diffing)

## Re-running after a deploy

```bash
# Quick: just hit the critical paths
npx playwright test tests/e2e/01-public-routes.spec.ts tests/e2e/04-i18n.spec.ts

# Full audit (slower)
pnpm test:e2e
```

A red build means a regression hit prod. The HTML report shows which page,
which error, and a screenshot at the moment of failure.

## Adding a new panel

1. Create `tests/e2e/0N-feature.spec.ts` using `_helpers.ts` for
   `startMonitoring` + `snap`.
2. Use `startMonitoring(page, 'label')` at the top of every test that
   navigates — that's how console + network errors get captured and
   asserted.
3. End the test with `expect(problems, '...').toEqual([])` to enforce
   no console errors.
4. Use `snap(page, 'name')` to take a full-page screenshot for the report.

## Why a separate test layer (not just unit tests)

The bugs that hit geoLocal the hardest were all **client-side browser
issues** (hydration errors, image loading, layout shifts, ORB blocks) that
don't show up in any server-side test. A unit test for `useLanguageSync`
would pass green while the production browser shows React error #418. The
right place to catch them is a real browser, which is what this suite
does.
