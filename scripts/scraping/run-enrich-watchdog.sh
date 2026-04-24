#!/usr/bin/env bash
# Watchdog: runs the enrichment orchestrator until ALL sources report
# 0 remaining candidates (idempotent backfill takes care of skipping).
#
# Handles LMStudio crashes, OOMs, or transient errors by re-invoking the
# orchestrator after any exit. Gives up after MAX_PASSES consecutive passes
# with no forward progress to avoid infinite loops when rows genuinely
# have no signal the AI can use.
set -u
cd "$(dirname "$0")/../.."

LOG="${LOG:-/tmp/enrich-watchdog.log}"
MAX_PASSES="${MAX_PASSES:-5}"

export AI_BASE_URL="${AI_BASE_URL:-http://127.0.0.1:1234/v1}"
export AI_MODEL="${AI_MODEL:-google/gemma-4-e4b}"
export AI_TIMEOUT_MS="${AI_TIMEOUT_MS:-120000}"
export AI_MAX_RETRIES="${AI_MAX_RETRIES:-1}"

log()  { echo "[watchdog $(date -u +%FT%TZ)] $*" | tee -a "$LOG"; }

# Count rows with gaps that still need AI enrichment (no _aiEnrichedAt yet).
# A row has a gap if ANY of title/address/imageUrl/city is null.
count_remaining() {
  docker exec geo-dashboard-db-1 psql -U postgres -d geo_dashboard -tAc "
    SELECT COUNT(*) FROM scraped_raw
    WHERE (normalised->>'_aiEnrichedAt') IS NULL
      AND (
           (normalised->>'title')      IS NULL
        OR (normalised->>'address')    IS NULL
        OR (normalised->>'imageUrl')   IS NULL
        OR (normalised->>'city')       IS NULL
        OR (normalised->>'country')    IS NULL
        OR (normalised->>'bedrooms')   IS NULL
        OR (normalised->>'bathrooms')  IS NULL
        OR (normalised->>'areaSqm')    IS NULL
        OR (normalised->>'yearBuilt')  IS NULL
        OR (normalised->'tags')        IS NULL
        OR jsonb_array_length(COALESCE(normalised->'tags', '[]'::jsonb)) = 0
      );
  " 2>/dev/null | tr -d '[:space:]'
}

prev=""
stuck=0
pass=0

while : ; do
  pass=$((pass + 1))
  remaining="$(count_remaining)"
  [ -z "$remaining" ] && remaining="?"

  log "pass=$pass  remaining=$remaining  prev=$prev  stuck=$stuck"

  if [ "$remaining" = "0" ]; then
    log "DONE — no rows left with gaps. Exiting watchdog."
    break
  fi

  if [ "$remaining" = "$prev" ]; then
    stuck=$((stuck + 1))
    if [ "$stuck" -ge "$MAX_PASSES" ]; then
      log "STUCK — $stuck passes without progress (remaining=$remaining). Giving up."
      break
    fi
  else
    stuck=0
  fi
  prev="$remaining"

  log "launching orchestrator pass=$pass"
  bash scripts/scraping/run-enrich-all.sh >> "$LOG" 2>&1 || log "orchestrator exited nonzero — will retry"
  log "orchestrator pass=$pass finished"
  # short cooldown — lets LMStudio flush any stuck state between passes
  sleep 5
done

log "watchdog done — final remaining=$(count_remaining)"
