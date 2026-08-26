# CLAUDE.md — sauti-os

## Project Overview
Infrastructure/platform monorepo (pnpm workspace) — referenced in `EAST-AFRICA-FINTECH-THESIS.md` (see the `creova` repo) as a potential middle layer between artists and Kultr-Hub's payout system for royalty disbursement. That integration is not yet built — treat the thesis as a proposal, not existing architecture.

## Technology Stack
pnpm workspace monorepo. Use `pnpm install --frozen-lockfile` and `pnpm build`.

## CI
`pnpm install --frozen-lockfile && pnpm build`.

## AI Agent Rules
- Add dependencies to the specific workspace package that needs them, not the root.
- If asked to build toward the fintech thesis's proposed Sauti-Os → Kultr-Hub integration, check Kultr-Hub's actual `payouts.ts` API contract first (it's real) rather than inventing an interface.

## Definition of Done
`pnpm build` passes across the whole workspace.
