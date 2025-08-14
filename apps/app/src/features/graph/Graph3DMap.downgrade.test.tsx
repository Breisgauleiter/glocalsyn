import { render, screen, act } from '@testing-library/react';
import { Graph3DMap } from './Graph3DMap';
import { vi } from 'vitest';

describe('Graph3DMap auto downgrade on low FPS', () => {
  beforeEach(() => {
    (globalThis as any).__TEST_GRAPH_MAX_NODES__ = 9999; // ensure threshold not hit
  });
  afterEach(() => {
    delete (globalThis as any).__TEST_GRAPH_MAX_NODES__;
  });
  it('falls back with performance reason when FPS low', async () => {
    const origCreate = document.createElement.bind(document);
    document.createElement = ((tag: string) => {
      const el = origCreate(tag);
      if (tag === 'canvas') {
        (el as any).getContext = () => ({ getParameter: () => 1 });
      }
      return el;
    }) as any;
    const nodes = Array.from({ length: 10 }, (_, i) => ({ _key: String(i), type: 'user', name: 'N'+i, diversityTags: [], bridgeScore: 0, activityScore: 0 }));
    const edges: any[] = [];
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
  const rafs: Array<(t?: any) => void> = [];
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: any) => { rafs.push(cb); return rafs.length; });
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
    render(<Graph3DMap nodes={nodes as any} edges={edges} />);
    for (let i=0;i<5;i++) {
      now += 500; // 0.5s per frame => 2 FPS
      await act(async () => { rafs.splice(0).forEach(fn => fn()); });
    }
    const msg = await screen.findByText(/3D deaktiviert \(Performance\)/i, {}, { timeout: 3000 });
    expect(msg).toBeInTheDocument();
    (performance.now as any).mockRestore?.();
    (requestAnimationFrame as any).mockRestore?.();
    document.createElement = origCreate;
  });
});
