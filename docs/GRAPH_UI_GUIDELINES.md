## Graph-UI Guidelines (Draft – Task 10)

Focus: Interaction principles, color/type mapping, accessibility & performance fallback strategy.

### Interaction Contracts
- Click / Enter: focus node (emit telemetry `graph_node_focus` with method `click` or `keyboard`).
- Hover: lightweight highlight (DEV only telemetry for now – production sampling later).
- Long-press (mobile PENDING): open radial actions (expand, explain, related quests).
- Double-click: expand immediate neighbors (capped ≤ 25 new nodes per action).

### Node Types & Visual Encodings
| Type | Shape | Base Color | Size Modifiers |
|------|-------|-----------|----------------|
| user | sphere | #4F8BFF | activityScore influences glow intensity |
| quest | cube | #FF9F2D | bridgeScore adds halo ring |
| hub | octahedron | #6CCB5F | member count (future) adjusts scale |

Accessibility: All colors meet ≥ 4.5:1 contrast over dark background; alternative high contrast palette toggle planned.

### Fallback & Downgrade Flow
1. Pre-mount capability check (WebGL2 + GPU tier heuristic).
2. Start FPS sampler (threshold 45 mobile / 50 desktop). If average < threshold over 2 samples → trigger downgrade: dispose 3D, render list view.
3. Large graph (nodes > max threshold) → render list directly.

### Telemetry Integration
Events (spec added in shared/types):
- `graph_node_focus`: nodeId, nodeType, method.
- `recommendation_explained`: fired when user opens explanation popover (future UI) capturing reasonCode.

### Performance Budgets
- Initial 3D bundle < 70KB gzip (excluding three.js peer which is already present).
- Frame budget: maintain ≥ 50 FPS median on reference mid‑range mobile (throttled 6x CPU, WebGL).
- Avoid re-layout on each tick when static; freeze simulation after 5s idle.

### Testing Strategy
- Unit: sampler triggers downgrade under synthetic low FPS (see fpsSampler.test).
- Integration: Map route tests include success, error, threshold fallback (already present).
- Future: Add test ensuring list fallback after forced downgrade.

### Roadmap
- Legend / color-blind modes.
- Cluster aggregation (force-based or community detection) for >500 nodes.
- Delta animation between snapshots.
- Keyboard navigation ring + ARIA live summary of focus path.

Created 13.08.2025.
