# glocalsyn
Syntopia / GLOCALSPIRIT monorepo (PWA + services). MIT-first, community-operated (12 roles + SCL 1–25).

## Quick Start
- Prerequisites: Node 18+, pnpm 9+
- Install deps: `pnpm install`
- Start app: `pnpm --filter @syntopia/app dev` then open http://localhost:5173

## How to run & test
- Unit tests (Vitest): `pnpm --filter @syntopia/app test`
- E2E (Playwright):
  - First time only: `pnpm --filter @syntopia/app e2e:install`
  - Run: `pnpm --filter @syntopia/app e2e`

More details in `docs/GETTING_STARTED.md`.
