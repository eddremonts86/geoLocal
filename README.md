# GeoLocal — Geo Dashboard

A location-based listings platform for Denmark built with TanStack Start, Drizzle ORM, and PostGIS.

## Stack

- **Framework**: TanStack Start (SSR React)
- **Database**: PostgreSQL 16 + PostGIS via Drizzle ORM
- **Scraping**: Playwright (Chromium headless)
- **Auth**: Clerk / Better Auth
- **Styling**: Tailwind CSS v4

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose

### Install dependencies

```bash
pnpm install
```

### Environment

Copy the example env and fill in your values:

```bash
cp .env.example .env.development
```

---

## Database

The database runs in Docker and **data is fully persistent** — stopping or restarting Docker never loses data.  
Data is only lost if you explicitly run `docker compose down -v`.

```bash
# Start database only
pnpm db:up
# or
docker compose up -d db

# Run migrations
pnpm db:migrate

# Seed with sample data
pnpm db:seed

# Backup the database
docker exec geo-dashboard-db-1 pg_dump -U postgres geo_dashboard > backup.sql
```

---

## Development

```bash
pnpm dev        # starts on http://localhost:3001
pnpm build
pnpm type-check
pnpm lint
```

---

## Scraping

Scrapers collect listings from Airbnb, Facebook Marketplace, Facebook Events, and LinkedIn into the `scraped_raw` staging table. Items can then be reviewed and approved at `/admin/scraping`.

### Run locally (host machine)

```bash
pnpm scrape                          # all sources, 100 items each
pnpm scrape:airbnb                   # Airbnb only
pnpm scrape:facebook                 # Facebook Marketplace only
pnpm scrape:linkedin                 # LinkedIn only
pnpm tsx scripts/scraping/runner.ts --source facebook-events --max 50
pnpm scrape:dry                      # dry-run (no DB writes)
```

### Run with Docker (recommended)

The scraper container uses the same Playwright version as local dev and connects to the database via Docker's internal network.

#### Build the image (first time or after code changes)

```bash
pnpm scrape:docker:build
# or
docker compose --profile scraping build scraper
```

#### Scheduled scraper (auto-starts with docker compose up)

`scraper-cron` starts automatically alongside the database, scrapes all sources immediately, then repeats every 6 hours.

```bash
# Start DB + scheduled scraper together
docker compose up -d

# View live scraper logs
pnpm scrape:docker:cron:logs
# or
docker compose logs -f scraper-cron

# Stop the scheduled scraper
pnpm scrape:docker:cron:stop

# Restart it
pnpm scrape:docker:cron:start
```

#### One-shot scraper (manual, on demand)

```bash
# Run all sources once
pnpm scrape:docker

# Run a specific source
pnpm scrape:docker:airbnb
pnpm scrape:docker:facebook
pnpm scrape:docker:events
pnpm scrape:docker:linkedin

# Custom options
docker compose --profile scraping run --rm scraper --source airbnb --max 50
docker compose --profile scraping run --rm scraper --source facebook-events --dry-run
```

#### Scheduled scraper environment variables

| Variable | Default | Description |
|---|---|---|
| `SCRAPE_SCHEDULE` | `false` | Set to `true` to enable the repeat loop |
| `SCRAPE_INTERVAL_HOURS` | `6` | Hours between each full scrape run |
| `DATABASE_URL` | `postgresql://postgres:postgres@db:5432/geo_dashboard` | DB connection (uses internal Docker network) |

#### Facebook cookies (optional — improves event coverage)

Without cookies the Facebook Events scraper works as a guest (~7 events per city). With saved cookies it gets significantly more:

```bash
# Save your Facebook session cookies to a local file
pnpm scrape:cookies

# The file is mounted read-only into the container automatically
# Location: scripts/scraping/.fb-cookies.json  (gitignored)
```

---

## Admin

Review and approve scraped items at:

```
http://localhost:3001/admin/scraping
```

---

## Testing

```bash
pnpm test          # unit tests (vitest)
pnpm test:e2e      # e2e tests (playwright)
```

---

## Docker — all services

```bash
docker compose up -d          # DB + scraper-cron
docker compose down           # stop (data preserved)
docker compose down -v        # stop AND delete all data ⚠️
docker compose ps             # check running containers
```

## Scraping v2

Ingests listings from Airbnb, Facebook, LinkedIn, EDC, Homestra, Boligsiden, Boliga.
An optional AI pass normalises raw data to a single schema before items reach the
admin review queue.

```bash
# Run all configured scrapers
pnpm scrape

# Run only the Danish real-estate sources
pnpm scrape:dk

# Discover new candidate sources (domains appear in /admin/scraping/sources)
pnpm scrape:discover

# Dry-run without DB writes
pnpm scrape:dry
```

**AI config (OpenAI-compatible)** — set in `.env`:

```bash
AI_BASE_URL=http://127.0.0.1:1234/v1   # LMStudio / Ollama / OpenAI / vLLM
AI_API_KEY=                             # empty for local
AI_MODEL=                               # empty = first loaded model
```

Leave `AI_BASE_URL` empty to skip AI and use the rules-based fallback only.
