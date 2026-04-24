#!/bin/sh
# ─── GeoLocal Scraper — Docker Entrypoint ────────────────────────────────────
#
# Modes:
#   SCRAPE_SCHEDULE=true  → runs every SCRAPE_INTERVAL_HOURS hours (default: 6)
#   (default)             → runs once and exits
#
# All arguments are forwarded to runner.ts:
#   --source all|airbnb|facebook|facebook-events|linkedin
#   --max N
#   --dry-run

set -e

INTERVAL_HOURS="${SCRAPE_INTERVAL_HOURS:-6}"
INTERVAL_SECONDS=$((INTERVAL_HOURS * 3600))

run_once() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  GeoLocal Scraper  |  $(date '+%Y-%m-%d %H:%M:%S')"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  node_modules/.bin/tsx scripts/scraping/runner.ts "$@"
}

if [ "$SCRAPE_SCHEDULE" = "true" ]; then
  echo "Scheduled mode — running every ${INTERVAL_HOURS}h"
  while true; do
    run_once "$@" || echo "Scraper run failed, will retry next cycle"
    echo ""
    echo "Next run in ${INTERVAL_HOURS}h  ($(date -d "+${INTERVAL_HOURS} hours" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -v+${INTERVAL_HOURS}H '+%Y-%m-%d %H:%M:%S'))"
    sleep "$INTERVAL_SECONDS"
  done
else
  run_once "$@"
fi
