#!/usr/bin/env bash
# Run AI enrichment for all pending sources, detached-friendly, one at a time.
# Usage: ./scripts/scraping/run-enrich.sh <source>
set -u
SRC="${1:?usage: run-enrich.sh <source>}"
cd "$(dirname "$0")/../.."
export AI_BASE_URL="${AI_BASE_URL:-http://127.0.0.1:1234/v1}"
export AI_MODEL="${AI_MODEL:-google/gemma-4-e4b}"
export AI_TIMEOUT_MS="${AI_TIMEOUT_MS:-120000}"
export AI_MAX_RETRIES="${AI_MAX_RETRIES:-1}"
echo "[run-enrich] source=$SRC model=$AI_MODEL start=$(date -u +%FT%TZ)"
pnpm tsx scripts/scraping/backfill-ai-enrich.ts --source "$SRC"
echo "[run-enrich] source=$SRC end=$(date -u +%FT%TZ)"
