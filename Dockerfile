FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# CI=true so pnpm's deps-status check can purge node_modules non-interactively
# (avoids ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY).
ENV CI=true

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

RUN pnpm install --frozen-lockfile

FROM base AS dev

WORKDIR /app

COPY . .

EXPOSE 3001

CMD ["pnpm", "dev"]

FROM base AS builder

ENV NODE_ENV=production

WORKDIR /app

COPY . .

RUN pnpm build

FROM node:22-bookworm-slim AS prod

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Reuse compiled node_modules from base — avoids re-running native binary builds
COPY --from=base /app/node_modules ./node_modules
RUN pnpm prune --prod

COPY --from=builder /app/dist ./dist
COPY server.prod.mjs ./server.prod.mjs

# Runtime files for drizzle-kit migrate + tsx seeds (executed at container start)
COPY drizzle ./drizzle
COPY drizzle.config.ts ./drizzle.config.ts
COPY tsconfig.json ./tsconfig.json
COPY scripts ./scripts
# `src/` is required by the seed scripts — they import schema definitions
# (listings, properties, etc.) from src/shared/lib/db/schema. The compiled
# server bundle already has its own copy under dist/server/, but the seeds
# run as plain tsx outside the bundle and need the raw source.
COPY src ./src

EXPOSE 3000

CMD ["sh", "scripts/docker-app-entrypoint.sh"]
