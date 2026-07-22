#!/bin/sh
# ─── GeoLocal Scraper — Docker Entrypoint ────────────────────────────────────
#
# Modes:
#   SCRAPE_SCHEDULE=true  → runs resumable backfill and six-hour incremental flows
#   (default)             → runs once and exits
#
# All arguments are forwarded to runner.ts:
#   --source all|airbnb|facebook|facebook-events|linkedin
#   --max N
#   --dry-run

set -e

run_once() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  GeoLocal Scraper  |  $(date '+%Y-%m-%d %H:%M:%S')"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  node_modules/.bin/tsx scripts/scraping/runner.ts "$@"
}

if [ "$SCRAPE_SCHEDULE" = "true" ]; then
  exec node_modules/.bin/tsx scripts/scraping/scheduler.ts
else
  run_once "$@"
fi
