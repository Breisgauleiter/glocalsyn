# Graph UI & 3D Visualization Guidelines

Status: POC (Sprint 03) – incremental hardening planned.

## Goals
- Graph-first mental model: even lists derive from underlying graph.
- Progressive enhancement: Small, accessible fallback first; 3D only when capable & within budgets.
- Transparency: Users can see why nodes are recommended (separate feature – recs already expose reasons).

## Components
| Component | Purpose |
|-----------|---------|
| `Graph3DMap` | Lazy 3D force-directed view (WebGL + dynamic import) with automatic fallback list. |
| `Home` recommendations | Shows graph-derived suggestions (feature flagged). |

## Feature Flags & Overrides
| Flag | Env / Global | Default | Description |
|------|--------------|---------|-------------|
| `VITE_ENABLE_RECS` | build env / `__TEST_ENABLE_RECS__` | off | Enables live recommendation fetch on Home. |
| `VITE_ENABLE_GRAPH_3D` | build env / `__TEST_ENABLE_GRAPH_3D__` | off | Enables Map route graph snapshot section. |
| `VITE_GRAPH_MAX_NODES_BEFORE_FALLBACK` | build env / `__TEST_GRAPH_MAX_NODES__` | 300 | Node count threshold forcing list fallback instead of 3D. |

### Test Overrides
During Vitest, static `import.meta.env` is not re-bundled per test. We expose global overrides to flip features without rebuilding:
```ts
(globalThis as any).__TEST_ENABLE_GRAPH_3D__ = true;
(globalThis as any).__TEST_GRAPH_MAX_NODES__ = 25;
```
Use minimally; integration tests cover flag off/on, error, success, and threshold fallback paths.

## Fallback Logic
1. If node count exceeds threshold → list fallback with explanatory note.
2. If WebGL unavailable → list fallback.
3. If dynamic import of 3D lib fails → list fallback.
4. Otherwise render 3D.

List shows up to 50 node names; future: add mini badges (activity / bridge).

## Instrumentation (Dev Only)
`Graph3DMap` emits every 2s: `[graph3d][fps] <value>` and node hover events `[graph3d][hover] <node-id>` in `DEV` to console. This is a lightweight placeholder; production telemetry will hook into a metrics adapter later.

## Accessibility & Performance Notes
- Always ensure keyboard access: fallback list is plain semantic elements; 3D canvas currently non-interactive (drag disabled) – plan: alternative textual summary & focusable node legend.
- Threshold prevents heavy WebGL for large graphs on low-end devices.
- Future budget flags: max edges before fallback, dynamic LOD (level-of-detail) scaling.

## Roadmap Follow-ups
- Expose node metadata (activityScore, bridgeScore) visually (size/halo) with legend.
- Add reason badges overlay when hovering recommended nodes.
- Capture real FPS + memory into metrics store behind opt-in.
- Snapshot diff (delta animations) between fetch intervals.

## Development Tips
- Keep PRs small: add one enhancement (e.g., legend) + tests.
- Avoid hardcoding WebGL assumptions in tests; rely on fallback semantics.
- When adding new graph flags, replicate pattern: build env + global override.

MIT © Syntopia
