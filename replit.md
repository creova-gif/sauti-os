# SautiOS

Music management platform for East African artists — catalog, royalties, contracts, events, and airplay tracking in one place.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/sauti-os run dev` — run the frontend (port 22774)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Recharts, wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — Single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (artists, songs, royalties, contracts, events, airplay)
- `artifacts/api-server/src/routes/` — Express route handlers (one file per domain)
- `artifacts/sauti-os/src/` — React + Vite frontend (pages, components, theme)
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — Generated Zod validation schemas (do not edit)

## Architecture decisions

- Contract-first: OpenAPI spec gates all codegen; never write raw fetch calls on the frontend
- Single demo artist (`demo-artist-001`) hardcoded in all routes — multi-tenant auth can be added later
- Orval generates both React Query hooks and Zod response validators; api-zod index only re-exports `./generated/api` (not types) to avoid naming conflicts
- Dashboard summary and chart endpoints return pre-computed/seeded data; can be replaced with real aggregation queries
- Platform earnings colors are hardcoded to match each DSP's brand color

## Product

- **Dashboard** — Wallet balance, stream count, earnings chart (6-month area chart), per-platform breakdown (pie chart), uncollected airplay with claim button
- **Catalog** — Song list with COSOTA status badges; add and edit songs with platform selection
- **Royalties** — Transaction history with type, platform, amount; M-Pesa withdrawal flow
- **Contracts** — Full contract lifecycle (draft → pending signature → active → completed); side drawer with details
- **Events** — Event creation with M-Pesa ticketing; sell ticket modal with buyer details

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing `openapi.yaml`, always run codegen then fix `lib/api-zod/src/index.ts` to only export from `./generated/api` (codegen regenerates with extra exports that cause TS2308 conflicts)
- The orval `schemas` option in `orval.config.ts` is intentionally removed to avoid naming conflicts between Zod schemas and TypeScript interfaces

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
