import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

describe('Map 3D Graph (error path)', () => {
  beforeEach(() => {
    (globalThis as any).__TEST_ENABLE_GRAPH_3D__ = true;
    (import.meta as any).env.VITE_GRAPH_URL = 'http://localhost:9999';
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('renders alert and no 3D/fallback nodes when fetch 500', async () => {
    (globalThis as any).fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    const { Map } = await import('./Map');
    render(<MemoryRouter><Map /></MemoryRouter>);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByTestId('graph-3d')).not.toBeInTheDocument();
  });
});
