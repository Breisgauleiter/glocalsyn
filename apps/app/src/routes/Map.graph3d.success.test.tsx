import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

describe('Map 3D Graph (success path)', () => {
  beforeEach(() => {
    (globalThis as any).__TEST_ENABLE_GRAPH_3D__ = true;
    (import.meta as any).env.VITE_GRAPH_URL = 'http://localhost:9999';
    (globalThis as any).__TEST_GRAPH_MAX_NODES__ = 5; // ensure under threshold
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('renders 3D placeholder container when data arrives and below threshold (library may still fallback in jsdom)', async () => {
    (globalThis as any).fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ nodes: [ {_key:'a', name:'Alpha', type:'user'}, {_key:'b', name:'Beta', type:'user'} ], edges: [] }) });
    const { Map } = await import('./Map');
    render(<MemoryRouter><Map /></MemoryRouter>);
    await waitFor(() => expect(screen.queryByText(/Lade Graph/i)).not.toBeInTheDocument());
    // Either 3D container or fallback must show node names
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });
});
