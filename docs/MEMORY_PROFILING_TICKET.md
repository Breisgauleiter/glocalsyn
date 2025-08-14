# Memory Profiling Ticket (Draft)

Goal: Establish baseline memory usage for 3D graph & test harness; detect leaks from repeated mounts.

Scope:
- Measure heap snapshots after: initial load, post-graph mount, after 5 forced unmount/remount cycles.
- Target: No unbounded growth (>5% variance) between cycle 1 and 5.

Approach:
1. Add dev utility script invoking `performance.measureUserAgentSpecificMemory` (where available) or fallback to window.performance.memory (Chrome only heuristic).
2. Add automated Vitest integration test (skipped in CI if API unsupported) performing mount/unmount cycles of Graph3DMap with 200 nodes.
3. Log metrics to console with `[mem-prof]` prefix; later wire to telemetry sink.

Risks:
- Browser API availability inconsistent → test must be resilient and skip gracefully.
- WebGL resource cleanup relies on force-graph internals; may need explicit `.pauseAnimation()` or renderer dispose hook.

Acceptance Criteria:
- Script + test present.
- Documented instructions in TESTING.md for running memory profiling locally with Chrome.
- Follow-up issue created if variance >5%.

Created 13.08.2025.
