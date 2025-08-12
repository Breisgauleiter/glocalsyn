import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

describe('Map 3D Graph (threshold fallback)', () => {
  beforeEach(() => {
    (globalThis as any).__TEST_ENABLE_GRAPH_3D__ = true;
    (import.meta as any).env.VITE_GRAPH_URL = 'http://localhost:9999';
    (globalThis as any).__TEST_GRAPH_MAX_NODES__ = 10; // threshold for test
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('forces fallback when node count exceeds threshold', async () => {
    const big = Array.from({ length: 15 }, (_, i) => ({ _key: 'n'+i, name: 'Node'+i, type: 'user' }));
    (globalThis as any).fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ nodes: big, edges: [] }) });
    const { Map } = await import('./Map');
    render(<MemoryRouter><Map /></MemoryRouter>);
  expect(await screen.findByTestId('graph-fallback')).toBeInTheDocument();
    expect(screen.getByText(/3D deaktiviert/)).toBeInTheDocument();
  });
});
