#!/bin/sh

set -eu

# Production container entrypoint.
#
# - DATABASE_URL is injected by Coolify as a process env var, NOT as a file.
# - We run the full production migration runner (idempotent, handles
#   "already exists" gracefully) so the schema is correct on first boot
#   AND on every subsequent container restart.
# - Only after migrations succeed do we start the HTTP server.

echo "[startup] Running production migrations (create-db, drizzle SQL, custom SQL, admin seed)…"
node scripts/db/migrate-prod.mjs

echo "[startup] Starting production server on port ${PORT:-3000}…"
exec node server.prod.mjs
