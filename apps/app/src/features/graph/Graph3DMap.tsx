import { Suspense, useEffect, useRef, useState } from 'react';
import { FpsSampler } from '../../utils/fpsSampler';
import { emit as emitTelemetry } from '../../utils/telemetry';
import type { GraphObject } from '@syntopia/types';

// Test / override hooks (optional)
declare global { // eslint-disable-line
  // eslint-disable-next-line no-var
  var __TEST_GRAPH_MAX_NODES__ : number | undefined;
}

let ForceGraph3D: any;
async function loadLib() {
  if (!ForceGraph3D) {
    const mod = await import('react-force-graph-3d');
    ForceGraph3D = mod.default;
  }
  return ForceGraph3D;
}

export interface Graph3DMapProps {
  nodes: GraphObject[];
  edges: { _from: string; _to: string; type: string }[];
  height?: number;
}

export function Graph3DMap(props: Graph3DMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ReadyComp, setReadyComp] = useState<any>(null);
  const [webgl, setWebgl] = useState<boolean>(false);
  const threshold = (globalThis as any).__TEST_GRAPH_MAX_NODES__ ?? parseInt(((import.meta as any).env?.VITE_GRAPH_MAX_NODES_BEFORE_FALLBACK) || '300', 10);
  const overThreshold = props.nodes.length > threshold;

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) setWebgl(true);
    } catch {/* ignore */}
    loadLib().then(setReadyComp).catch(() => setReadyComp(null));
  }, []);

  // Dev instrumentation hook (always declared, internal early return inside)
  useEffect(() => {
    if (!(import.meta as any).env?.DEV) return;
    let mounted = true;
    let frames = 0;
    let last = performance.now();
    function loop() { frames++; if (mounted) requestAnimationFrame(loop); }
    const interval = setInterval(() => {
      const now = performance.now();
      const fps = frames * 1000 / (now - last);
      if (frames > 0) console.log('[graph3d][fps]', fps.toFixed(1));
      frames = 0; last = now;
    }, 2000);
    requestAnimationFrame(loop);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const [downgraded, setDowngraded] = useState(false);
  useEffect(() => {
    if (overThreshold) return; // already list
    if (!webgl || !ReadyComp) return; // wait for ready
    let sampler: FpsSampler | null = null;
    // only run in browser and not already downgraded
    sampler = new FpsSampler({ downgradeThresholdFps: 45, onDowngrade: () => setDowngraded(true) });
    sampler.start();
    return () => { sampler?.stop(); };
  }, [webgl, ReadyComp, overThreshold]);

  const fallbackNeeded = overThreshold || !webgl || !ReadyComp || downgraded;

  if (fallbackNeeded) {
    return (
      <div ref={containerRef} data-testid="graph-fallback" style={{ maxHeight: props.height || 360, overflow: 'auto' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {props.nodes.slice(0, 50).map(n => (
            <li key={n._key} style={{ padding: 0, borderBottom: '1px solid #2223' }}>
              <button
                type="button"
                onFocus={() => emitTelemetry({ ts: Date.now(), type: 'graph_node_focus', nodeId: `${n.type}/${n._key}`, nodeType: n.type, method: 'keyboard' })}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  padding: '4px 8px',
                  color: 'inherit',
                  font: 'inherit',
                  cursor: 'pointer'
                }}
              >
                {n.name}
              </button>
            </li>
          ))}
        </ul>
        {(overThreshold || downgraded) && (
          <p style={{ fontSize: 12, opacity: 0.7, padding: '4px 8px' }}>
            3D deaktiviert {overThreshold ? `(>${threshold} Knoten)` : '(Performance)'} – Fallback Liste.
          </p>
        )}
      </div>
    );
  }

  const graphData = {
    nodes: props.nodes.map(n => ({ id: `${n.type}/${n._key}`, name: n.name, val: 1 + (n.activityScore || 0) })),
    links: props.edges.map(e => ({ source: e._from, target: e._to, type: e.type }))
  };

  return (
    <div data-testid="graph-3d" style={{ height: props.height || 360 }}>
      <Suspense fallback={<div>3D lädt…</div>}>
        <ReadyComp
          graphData={graphData}
          backgroundColor="transparent"
          nodeLabel={(n: any) => n.name}
          enableNodeDrag={false}
          warmupTicks={30}
          cooldownTicks={60}
          onNodeHover={(n: any) => {
            if ((import.meta as any).env?.DEV) console.log('[graph3d][hover]', n?.id);
            if (n?.id) emitTelemetry({ ts: Date.now(), type: 'graph_node_focus', nodeId: n.id, nodeType: String(n.id).split('/')[0], method: 'hover' });
          }}
        />
      </Suspense>
    </div>
  );
}
