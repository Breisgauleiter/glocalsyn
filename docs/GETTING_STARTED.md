# Getting Started

This repository is a pnpm + Turborepo monorepo. The app is a React + Vite project in `apps/app`.

## Prerequisites
- Node.js 18+
- pnpm 9+

## Install dependencies
At the repo root:

```sh
pnpm install
```

## Run the app (Vite dev server)
```sh
pnpm --filter @syntopia/app dev
```

App runs at http://localhost:5173.

## Run E2E tests (Playwright)
First time only (downloads browsers):
```sh
pnpm --filter @syntopia/app e2e:install
```
Run tests:
```sh
pnpm --filter @syntopia/app e2e
```
The Playwright config will auto-start the dev server if needed.

## Run unit tests (Vitest)
```sh
pnpm --filter @syntopia/app test
```

## Scripts reference (apps/app)
- `dev` – start Vite
- `build` – build for production
- `preview` – preview the production build on port 5173
- `e2e` – run Playwright tests
- `e2e:install` – install Playwright browsers
- `test` – run Vitest (jsdom)
