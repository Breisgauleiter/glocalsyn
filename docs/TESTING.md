# Testing Strategy

Memory-efficient, mobile-first validation aligned with Sprint goals.

## Layers

1. Fast Unit/Light Route Tests (`pnpm --filter @syntopia/app test:fast`)
   - Runs each test file in isolation (fresh process) to avoid cumulative jsdom heap growth.
   - Excludes the heaviest composite route flows and badge/review enhancements.
2. Integration / Heavy UI (`pnpm --filter @syntopia/app test:integration`)
   - Quest multi-proof flows, enhanced review queue, badge aggregation.
3. E2E (Playwright) (`pnpm --filter @syntopia/app e2e`)
4. Coverage (sequential, low memory) (`pnpm --filter @syntopia/app test:coverage`)
   - Smoke / happy path plus reviewer badge scenario.

## Rationale

Previous monolithic vitest run hit >4GB retained heap (jsdom + repeated complex mounts) leading to OOM despite GC hooks. Splitting per file:
- Releases process memory fully after each file.
- Keeps parallelism = 1 to preserve determinism and reduce transient spikes.

## Key Conventions

- New heavy route flows: prefer extending `QuestDetail.flows.test.tsx` over creating multiple granular files.
- If a test mounts >3 nested routers or simulates multi-step quest proof flows, classify it as integration.
- Keep skipped placeholder tests minimal; delete when consolidated.

## Adding Tests

1. Default: place under existing feature or route with `.test.tsx`.
2. If it increases median runtime >600ms or creates large DOM trees, move/merge into an integration file and add to integration list in `scripts/run-test-per-file.mjs`.
3. Avoid global state; rely on localStorage keys cleared in `setupTests.ts`.

## Troubleshooting

| Symptom | Action |
|---------|--------|
| OOM returns | Ensure new file not excluded from per-file runner; consider splitting large test into focused assertions. |
| Test passes alone, fails in suite | Check for missing cleanup or reliance on preserved localStorage; add explicit setup in `beforeEach`. |
| Slow single test (>2s) | Add `test.fails` or refactor to reduce waits; investigate unnecessary re-renders. |

## CI Entry Point

Use `pnpm test:ci` at repo root: runs fast tests, integration tests, then e2e.

## Coverage

Run sequential to avoid OOM:
`pnpm --filter @syntopia/app test:coverage`

Coverage thresholds only enforced when `COVERAGE_STRICT=1`. Default run aggregates without failing build.

## Future Improvements

- Investigate jsdom alternative (happy-dom) for lighter DOM flows.
- Snapshot minimal HTML for route screens after major refactors to catch regressions.
- Add coverage collection on fast tier only (avoid inflating integration runtime).
