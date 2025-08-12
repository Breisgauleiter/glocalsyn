import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

describe('Home live recommendations (flag on)', () => {
  beforeEach(() => {
    (globalThis as any).__TEST_ENABLE_RECS__ = true;
  });
  afterEach(() => {
    delete (globalThis as any).__TEST_ENABLE_RECS__;
    vi.restoreAllMocks();
  });

  it('renders live recommendations from service', async () => {
    (globalThis as any).fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [ { node: { _key: 'qX', type: 'quest', name: 'Quest X' }, reasons: [ { code: 'bridge', explanation: 'Brücke' } ] } ] }) });
    const { Home } = await import('./Home');
    render(<MemoryRouter><Home /></MemoryRouter>);
  const first = await screen.findByTestId('rec-item');
  expect(first).toBeInTheDocument();
    expect(screen.getByText('Quest X')).toBeInTheDocument();
    expect(screen.getByText(/Brücke/)).toBeInTheDocument();
  });

  it('falls back to placeholder on fetch error', async () => {
    (globalThis as any).fetch = vi.fn().mockRejectedValue(new Error('network'));
    const { Home } = await import('./Home');
    render(<MemoryRouter><Home /></MemoryRouter>);
  const items = await screen.findAllByTestId('rec-item');
  expect(items.length).toBeGreaterThan(0);
    expect(screen.getByText(/Verbinde zwei Hubs/)).toBeInTheDocument();
    expect(screen.getByText(/nicht erreichbar/i)).toBeInTheDocument();
  });
});
