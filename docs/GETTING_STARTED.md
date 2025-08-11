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

## Optional: GitHub adapter (read-only) flags

To enable read-only GitHub issues as a quest source (for users with SCL ≥ 4 and linked GitHub):

- VITE_USE_GITHUB_ADAPTER=true
- VITE_GITHUB_REPOS="owner1/repo1,owner2/repo2"  # comma-separated
- (optional) VITE_GITHUB_TOKEN=ghp_xxx            # increases rate limit
- (optional) VITE_GITHUB_PER_REPO_LIMIT=10        # default 10

Notes:
- Adapter is read-only and best-effort. On errors it falls back to the baseline mock.
- The dummy onboarding quest remains; when enabled, GitHub quests are added on top.
- Per-user Repo-Auswahl: Nach dem Verknüpfen kann jede:r in "Ich" eine Repo-Liste (owner/name, komma-separiert) speichern. Diese überschreibt `VITE_GITHUB_REPOS`. Leer lassen = Standard verwenden.
 - Zusätzlich pro Nutzer: Issue-Status (open/closed/all), Labels (komma-separiert) und optional ein persönliches Token können in "Ich" gesetzt werden. Diese Einstellungen beeinflussen nur den lokalen Client (read-only).
