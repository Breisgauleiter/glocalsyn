import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

describe('Map 3D Graph (flag)', () => {
  beforeEach(() => {
    (globalThis as any).__TEST_ENABLE_GRAPH_3D__ = true;
    (import.meta as any).env.VITE_GRAPH_URL = 'http://localhost:9999';
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading when enabled and awaiting data', async () => {
    (globalThis as any).fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
    const { Map } = await import('./Map');
    render(<MemoryRouter><Map /></MemoryRouter>);
    expect(screen.getByText(/Lade Graph/i)).toBeInTheDocument();
  });
});
