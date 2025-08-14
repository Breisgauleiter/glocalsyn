# Getting Started

This repository is a pnpm + Turborepo monorepo. The app is a React + Vite project in `apps/app`.

## Prerequisites
- Node.js 18+
- pnpm 9+
- Docker (for local ArangoDB)

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

Auth proxy (dev): The app proxies /auth and /me to an auth service. Default target is http://localhost:4160.
You can override via env:
- VITE_AUTH_PORT=4170
- VITE_AUTH_TARGET=http://localhost:9999
This helps avoid port conflicts with other local services.

## Start local backend (Auth + DB)
To avoid proxy errors for /auth and /me in dev and E2E, run the local DB and Auth service:

1) Start ArangoDB via Docker Compose (no auth, local only) on port 8530:
```sh
pnpm db:up
```

2) Start the Auth service (Fastify on :4060):
```sh
pnpm auth:dev
```

Notes:
- ArangoDB listens on http://localhost:8530 (container 8529).
- Auth and Graph services will create the `syntopia` database on first run and ensure collections.
- In dev mode, it logs magic-link emails to the console and, when `AUTH_TEST_ALLOW_TOKEN_LEAK=1`, returns the token in /auth/register responses for tests.

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

Note on images/canvas in unit tests: jsdom lacks full Canvas APIs. Minimal mocks live in `apps/app/src/setupTests.ts` to avoid errors. Prefer seeding state for photo flows in unit tests and verify real uploads with Playwright E2E.

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

## Per-user GitHub settings (optional)

Nach dem Verknüpfen kann jede:r in "Ich" eine Repo-Liste (owner/name, komma-separiert) speichern. Diese überschreibt `VITE_GITHUB_REPOS`. Leer lassen = Standard verwenden.
Zusätzlich pro Nutzer: Issue-Status (open/closed/all), Labels (komma-separiert) und optional ein persönliches Token können in "Ich" gesetzt werden. Diese Einstellungen beeinflussen nur den lokalen Client (read-only).


---

# Quests & Proofs

- Types: `check_in` (alias `complete`), `text_note`, `link`, `photo`, `peer_confirm`, `github_pr`.
- Instant: `check_in/complete` completes a quest immediately on submit.
- Reviewed: others are submitted and appear in the Review Queue until approved.
- XP mapping: 5/8/8/9/10/15 (same order as above).

Photo proofs are downscaled client-side and stored as Data URLs in local storage (on-device). If sync is added later, document privacy and size constraints.

---

# Demo Guide: Syntopia Minimal Slice

This guide walks through the main flows for onboarding and demo purposes. Add screenshots (PNG/JPG) in the indicated places for visual reference.

## 1. App Shell & Navigation
- **Tabs:** Home, Quests, Map, Hubs, Ich (Profile) at the bottom.
- **Screenshot:**
	![App Shell Tabs](../apps/app/public/demo-app-shell.png)

## 2. Login & Profile Wizard
- On first launch, user is prompted to log in and set up profile (Name, Region).
- **Screenshot:**
	![Login & Profile Wizard](../apps/app/public/demo-profile-wizard.png)

## 3. Dummy Quest Flow
- Quests tab shows a dummy quest.
- User can view, accept, and mark quest as done.
- **Screenshot:**
	![Dummy Quest](../apps/app/public/demo-dummy-quest.png)

## 4. Me/Profile Settings
- "Ich" tab shows SCL, GitHub link status, and settings form for repos, issue state, labels, and token.
- Accessible labels, error handling, and cosmic style.
- **Screenshot:**
	![Profile Settings](../apps/app/public/demo-profile-settings.png)

## 5. GitHub Adapter (optional)
- If enabled, user can link GitHub and see issues as quests (SCL ≥ 4).
- Per-user repo selection, issue state, labels, and token can be set in "Ich".
- **Screenshot:**
	![GitHub Quests](../apps/app/public/demo-github-quests.png)

## 6. Accessibility & Mobile-first
- All forms have labels, focus states, and error messages.
- Layout adapts to mobile screens.
- **Screenshot:**
	![Mobile Accessibility](../apps/app/public/demo-mobile-accessibility.png)

---

## How to test

Unit tests:
```sh
pnpm --filter @syntopia/app test
```
E2E tests:
```sh
pnpm --filter @syntopia/app e2e
```
All tests should pass locally and in CI.
