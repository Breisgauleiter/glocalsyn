import { useEffect, useState } from 'react';
import { fetchCachedJson } from '../features/graph/graphClient';
import { Graph3DMap } from '../features/graph/Graph3DMap';

// Allow test override via global (mirrors recommendations flag pattern)
declare global { // eslint-disable-line
  // test files can set: (globalThis as any).__TEST_ENABLE_GRAPH_3D__ = true/false
  // to bypass build-time env evaluation
  // eslint-disable-next-line no-var
  var __TEST_ENABLE_GRAPH_3D__: boolean | undefined;
}

function isGraph3DEnabled() {
  if (typeof (globalThis as any).__TEST_ENABLE_GRAPH_3D__ !== 'undefined') {
    return !!(globalThis as any).__TEST_ENABLE_GRAPH_3D__;
  }
  return (import.meta as any).env?.VITE_ENABLE_GRAPH_3D === '1';
}

interface SnapshotEdge { _from: string; _to: string; type: string; }
interface SnapshotData { nodes: any[]; edges: SnapshotEdge[]; }

export function Map() {
  const [data, setData] = useState<SnapshotData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const enabled = isGraph3DEnabled();

  useEffect(() => {
    if (!enabled) return;
  (async () => {
      try {
    const base = (import.meta as any).env?.VITE_GRAPH_URL || 'http://localhost:4050';
    const json = await fetchCachedJson(`${base}/graph/map-snapshot`);
        setData({ nodes: json.nodes || [], edges: json.edges || [] });
      } catch (e: any) {
        setError(e.message || 'Fehler');
      }
    })();
  }, [enabled]);

  return (
    <section aria-labelledby="map-title" style={{ padding: 16 }}>
      <h1 id="map-title">Map</h1>
      <p>Karte und Orte – first-class Flow.</p>
      {enabled && (
        <div className="stack" aria-label="Graph Visualisierung">
          <h2 className="h2">Netzwerk</h2>
          {!data && !error && <p role="status">Lade Graph…</p>}
          {error && <p role="alert" style={{ color: 'var(--danger,#b00)' }}>Graph nicht erreichbar – Fallback Liste.</p>}
          {data && <Graph3DMap nodes={data.nodes} edges={data.edges} />}
        </div>
      )}
    </section>
  );
}
