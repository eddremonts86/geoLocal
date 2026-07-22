# Durable Scraping Flows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace repeated first-page scraping with resumable active-listing backfill and a separate six-hour incremental flow.

**Architecture:** PostgreSQL stores one checkpoint per source and flow plus an immutable run ledger. The runner leases a checkpoint, calls source adapters with a durable page cursor, writes items idempotently, and advances state only after successful persistence. A separate scheduler invokes incremental collection every six hours while backfill advances in bounded, rate-limited slices.

**Tech Stack:** TypeScript 6, PostgreSQL, Drizzle ORM, Vitest, TanStack Start, Docker Compose.

## Global Constraints

- Collect active listings only.
- Never bypass access controls, CAPTCHA, robots directives, or source terms.
- Preserve existing local Docker and default-admin changes.
- Store code, documentation, logs, and comments in English.
- Verify database migrations, unit tests, type checking, production build, containers, and the admin runtime.

---

### Task 1: Persistence and state-machine primitives

**Files:**
- Create: `drizzle/0010_scraping_orchestration.sql`
- Modify: `src/shared/lib/db/schema.ts`
- Create: `scripts/scraping/orchestration.ts`
- Test: `tests/scraping-orchestration.test.ts`

**Interfaces:**
- Produces: `ScrapeFlow`, `ScrapeCursor`, `decideIncrementalStop`, `nextBackoffMs`, checkpoint and run repository functions.

- [ ] Write failing tests for page advancement, known-item stopping, and exponential cooldown.
- [ ] Run `pnpm vitest run tests/scraping-orchestration.test.ts` and confirm missing-module failures.
- [ ] Add `scrape_checkpoints` and `scrape_runs`, including leases, cursor JSON, watermark JSON, counters, cooldown, and run status.
- [ ] Add a unique `(source, source_id)` constraint after a duplicate-safety check.
- [ ] Implement pure state-machine helpers and PostgreSQL repositories.
- [ ] Run the focused test and confirm it passes.

### Task 2: Idempotent storage and adapter contract

**Files:**
- Modify: `scripts/scraping/types.ts`
- Modify: `scripts/scraping/storage.ts`
- Test: `tests/scraping-storage.test.ts`

**Interfaces:**
- Produces: `ScrapeBatch`, `ScrapeContext`, `ScraperAdapter`, and atomic `upsertScrapeResults` behavior.
- Consumes: checkpoint and run identifiers from Task 1.

- [ ] Write failing tests for insert, duplicate skip, active-record refresh, and watermark extraction.
- [ ] Run the focused test and confirm the expected failures.
- [ ] Replace select-then-insert with conflict-safe upsert semantics.
- [ ] Add the adapter context and batch result types without changing listing normalization.
- [ ] Run the focused test and the existing unit suite.

### Task 3: Dual-flow runner and scheduler

**Files:**
- Modify: `scripts/scraping/runner.ts`
- Create: `scripts/scraping/scheduler.ts`
- Modify: `scripts/scraping/docker-entrypoint.sh`
- Modify: `docker-compose.yml`
- Modify: `package.json`
- Test: `tests/scraping-runner.test.ts`
- Test: `tests/scraper-schedule.test.mjs`

**Interfaces:**
- Produces CLI `--flow backfill|incremental`, bounded backfill slices, six-hour incremental cadence, leases, run metrics, and source cooldown.

- [ ] Write failing tests for CLI parsing, independent schedules, lease exclusion, and failed-run cursor preservation.
- [ ] Run focused tests and confirm failures.
- [ ] Make runner functions importable and remove unconditional `process.exit` from library paths.
- [ ] Implement scheduler ticks with `SCRAPE_BACKFILL_INTERVAL_MINUTES` and `SCRAPE_INCREMENTAL_INTERVAL_HOURS=6`.
- [ ] Preserve existing seed/admin startup behavior and remove the obsolete global 20-minute full sweep.
- [ ] Run scheduler and runner tests.

### Task 4: Source-aware pagination

**Files:**
- Modify: `scripts/scraping/scrapers/boligsiden.ts`
- Modify: `scripts/scraping/scrapers/boliga.ts`
- Modify: `scripts/scraping/scrapers/homestra.ts`
- Modify: `scripts/scraping/scrapers/bilbasen.ts`
- Modify: `scripts/scraping/scrapers/dba.ts`
- Modify: `scripts/scraping/scrapers/edc.ts`
- Modify: `scripts/scraping/scrapers/airbnb.ts`
- Modify: `scripts/scraping/scrapers/facebook.ts`
- Modify: `scripts/scraping/scrapers/facebook-events.ts`
- Modify: `scripts/scraping/scrapers/linkedin.ts`
- Test: `tests/scraper-adapters.test.ts`

**Interfaces:**
- Consumes: `ScrapeContext` with `flow`, `cursor`, and `watermark`.
- Produces: next page/partition cursor, active items, newest-first watermark candidates, and explicit exhaustion state.

- [ ] Write failing adapter tests using captured response fixtures for page selection and next-cursor output.
- [ ] Run focused tests and confirm failures.
- [ ] Add page offsets to paginated Danish sources and deterministic newest-first ordering for incremental runs.
- [ ] Repair EDC parsing so discovered active listing links yield records.
- [ ] Remove Cloudflare-bypass wording and disable adapters where authorization is required or robots disallow the used route.
- [ ] Make non-page sources return bounded partition cursors or a clear paused reason.
- [ ] Run adapter tests and dry-run one permitted source in each flow.

### Task 5: Domain protection and observability

**Files:**
- Create: `scripts/scraping/rate-policy.ts`
- Modify: `scripts/scraping/orchestration.ts`
- Modify: `src/modules/admin/api/scraping-sources.fn.ts`
- Modify: `src/modules/admin/ui/ScrapingSourcesPage.tsx`
- Test: `tests/scraping-rate-policy.test.ts`

**Interfaces:**
- Produces: per-domain delay, Retry-After parsing, circuit breaking, and admin run/checkpoint status.

- [ ] Write failing tests for jitter bounds, Retry-After, cooldown escalation, and reset after success.
- [ ] Run focused tests and confirm failures.
- [ ] Implement one in-flight request per domain and persisted cooldown decisions.
- [ ] Return checkpoint, coverage, latest run, next run, new/seen/error counts from the admin API.
- [ ] Display flow state, cursor, cooldown, last result, and next schedule in the existing source cards.
- [ ] Run unit tests, type checking, and production build.

### Task 6: Migration and runtime verification

**Files:**
- Modify as required by defects found during verification only.

**Interfaces:**
- Validates all outputs from Tasks 1–5 against the running PostgreSQL, scraper container, and admin application.

- [ ] Back up row counts and apply migration 0010.
- [ ] Verify `(source, source_id)` remains unique and existing rows are preserved.
- [ ] Start the rebuilt app and scheduler containers.
- [ ] Run one permitted backfill slice twice and verify the second begins at the persisted cursor.
- [ ] Run one incremental slice and verify its watermark and six-hour next-run time.
- [ ] Open `/admin/scraping` and verify checkpoint/run metrics render.
- [ ] Run `pnpm test`, `pnpm type-check`, `pnpm lint`, and `pnpm build`.
- [ ] Review the final diff for scope, security, and preservation of pre-existing changes.
