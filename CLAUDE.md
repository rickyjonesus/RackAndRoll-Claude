# RackAndRoll — Dev Guidelines

## Structure

- `apps/api` — NestJS backend
- `apps/web` — Angular frontend
- `apps/api-e2e` — API integration tests (Jest)
- `apps/web-e2e` — E2E tests (Playwright)
- `libs/shared` — shared types/utilities

## Common Commands

```bash
# Dev servers
pnpm dev:api    # NestJS with SWC hot-reload
pnpm dev:web    # Angular dev server

# Build
pnpm build:api  # webpack → dist/apps/api/main.js
pnpm build:web  # Angular CLI → dist/apps/web

# Database (runs from apps/api where prisma.config.ts lives)
pnpm db:push     # push schema to Supabase
pnpm db:migrate  # run pending migrations
pnpm db:generate # regenerate Prisma client
pnpm db:studio   # open Prisma Studio

# Test & lint
pnpm test        # jest (api) + ng test (web)
pnpm lint        # eslint (api) + ng lint (web)
```

## Docker

```bash
# Supabase as DB (default)
docker compose up

# Local Postgres
docker compose --profile local up
```

## API build

webpack bundles all node_modules into `dist/apps/api/main.js` — no `npm install` needed in the production image. Prisma uses `@prisma/adapter-pg` (no native binary), so bundling is safe.
