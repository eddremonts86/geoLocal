#!/usr/bin/env bash
# Run AI enrichment for all sources sequentially.
# Each invocation skips rows already tagged with `_aiEnrichedAt`, so this is
# safe to re-run. Writes a combined log to /tmp/enrich-all.log.
set -u
cd "$(dirname "$0")/../.."

export AI_SCRAPER_BASE_URL="${AI_SCRAPER_BASE_URL:-http://127.0.0.1:1234/v1}"
export AI_SCRAPER_MODEL="${AI_SCRAPER_MODEL:-google/gemma-4-e4b}"
export AI_SCRAPER_TIMEOUT_MS="${AI_SCRAPER_TIMEOUT_MS:-120000}"
export AI_SCRAPER_MAX_RETRIES="${AI_SCRAPER_MAX_RETRIES:-1}"

LOG="${LOG:-/tmp/enrich-all.log}"
# Smallest first so we see progress early; biggest last.
SOURCES=(linkedin facebook facebook-events edc boliga homestra boligsiden airbnb)

echo "[orchestrator] start=$(date -u +%FT%TZ) model=$AI_MODEL log=$LOG" | tee -a "$LOG"

for SRC in "${SOURCES[@]}"; do
  echo "" | tee -a "$LOG"
  echo "[orchestrator] --- $SRC start=$(date -u +%FT%TZ) ---" | tee -a "$LOG"
  pnpm tsx scripts/scraping/backfill-ai-enrich.ts --source "$SRC" 2>&1 | tee -a "$LOG"
  STATUS=${PIPESTATUS[0]}
  echo "[orchestrator] --- $SRC end=$(date -u +%FT%TZ) status=$STATUS ---" | tee -a "$LOG"
done

echo "" | tee -a "$LOG"
echo "[orchestrator] done=$(date -u +%FT%TZ)" | tee -a "$LOG"
