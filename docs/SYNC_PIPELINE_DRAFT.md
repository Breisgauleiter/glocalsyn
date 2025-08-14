# Sync Pipeline v1 Draft (Polling + ETag)

Status: Draft – Sprint 03 Task 7.

## Goal
Provide a resilient, bandwidth-light synchronization mechanism for client -> server data snapshots (graph, recommendations, profile) using HTTP caching primitives (ETag / If-None-Match) before introducing streaming or websockets.

## Scope (v1)
- Read-only snapshot endpoints adopt ETag contract.
- Client caches last ETag per resource & sends `If-None-Match`.
- Server returns 304 when unchanged, 200 + JSON + new ETag when changed.
- Minimal change detection strategy (hash of canonical JSON serialization).

Non-Goals (v1):
- Push/real-time updates.
- Delta patch format (JSON Patch / CRDT). (Document stub only.)
- Conflict resolution for concurrent writes (write endpoints remain standard optimistic updates later).

## Resources & Endpoints (Candidate Set)
| Resource | Endpoint | Notes |
|----------|----------|-------|
| Profile  | `GET /profile` | Already exists? add ETag wrapper. |
| Graph Map Snapshot | `GET /graph/map` | Build on existing map snapshot builder. |
| Recommendations | `GET /graph/recommendations` | Recompute or serve cached with per-user key. |

## ETag Generation
Algorithm: Stable SHA-256 over canonical JSON string (sorted object keys + arrays as-is) of response payload without whitespace.
Pseudo:
```ts
function canonicalString(data: unknown): string { /* stable stringify */ }
function computeEtag(data: unknown): string { return 'W/"' + sha256(canonicalString(data)).slice(0, 32) + '"'; }
```
Use Weak ETags (`W/`) since semantic equivalence tolerated.

## Server Handling Pattern
```ts
async function sendWithEtag(reply, key: string, build: () => Promise<any>) {
  const cached = await cache.get(key); // { etag, data }
  const ifNoneMatch = reply.request.headers['if-none-match'];
  if (cached && ifNoneMatch === cached.etag) {
    return reply.code(304).header('ETag', cached.etag).send();
  }
  const data = await build();
  const etag = computeEtag(data);
  if (ifNoneMatch === etag) {
    // race: just changed but same etag
    return reply.code(304).header('ETag', etag).send();
  }
  await cache.set(key, { etag, data }, { ttl: 60 }); // short TTL; recompute opportunistically
  reply.header('ETag', etag).send(data);
}
```

## Client Pattern
```ts
async function fetchCached(path: string, cache: Map<string, any>) {
  const entry = cache.get(path); // { etag, data }
  const headers = entry?.etag ? { 'If-None-Match': entry.etag } : {};
  const res = await fetch(path, { headers });
  if (res.status === 304) return entry.data; // unchanged
  if (!res.ok) throw new Error('sync_failed');
  const data = await res.json();
  const etag = res.headers.get('ETag') ?? undefined;
  cache.set(path, { etag, data });
  return data;
}
```

## Caching Strategy
- Server short TTL (e.g., 60s) for map & recommendations; profile recomputed on mutation events.
- Avoid storing large arrays multiple times: consider storing hash-only, rebuild on 304? (Future optimization.)

## Telemetry
Events:
- `sync.request` (resource, hadEtag, status304, latencyMs)
- `sync.cache.invalidate` (resource, reason)

## Future Extensions
- Delta: Provide `GET /graph/map?since=<cursor>` returning appended nodes/edges when small; fallback full snapshot.
- Push: SSE or WebSocket channel broadcasting invalidation topics (`graph.map.invalidate:<userId>`).
- Conflict: For write endpoints, adopt `If-Match` with version field.

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| High recompute cost for large map | Latency | Background refresh & pre-hash store |
| Hash collisions (improbable) | Stale data undetected | SHA-256 truncated 32 hex – acceptable | 
| Client clock skew | None (unused) | N/A |
| Over-caching intermediate errors | Clients stuck | Do not cache non-200 responses |

## Acceptance Criteria
- Endpoints return ETag + honor If-None-Match.
- 304 path covered by unit test (server util) + integration test (map snapshot).
- Client util test: returns cached data on 304.
- Telemetry events emitted.

## Implementation Plan
1. Shared util `canonicalString` + `computeEtag` in `shared/utils`.
2. Graph service: wrap map + recommendations responses with helper.
3. Auth/profile service: wrap profile get.
4. Client `fetchCached` util + tests.
5. Add telemetry events.
6. Tests: unit (etag util), service integration (304), client fetch util.

## Open Questions
- Should we differentiate user-specific vs global etags? (For now include userId in key.)
- TTL appropriate? Might adapt dynamic TTL based on response size or change frequency.

---
Created 13.08.2025.
