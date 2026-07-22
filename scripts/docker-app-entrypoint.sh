#!/bin/sh

set -eu

echo "[startup] Applying database migrations..."
pnpm exec tsx scripts/db/apply-scraping-orchestration-migration.ts

echo "[startup] Ensuring the default admin user exists..."
pnpm exec tsx scripts/db/seed-admin.ts

exec node server.prod.mjs
