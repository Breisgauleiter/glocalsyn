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

  it('renders live recommendations from service (<=3 items)', async () => {
    const mockItems = [
      { node: { _key: 'qX', type: 'quest', name: 'Quest X' }, reasons: [ { code: 'bridge', explanation: 'Brücke' } ] },
      { node: { _key: 'qY', type: 'quest', name: 'Quest Y' }, reasons: [ { code: 'diversity', explanation: 'Diversität' } ] }
    ];
    (globalThis as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({ items: mockItems })
    });
    const { Home } = await import('./Home');
    render(<MemoryRouter><Home /></MemoryRouter>);
    // Wait for one of the network rec titles to appear
    const title = await screen.findByText('Quest X');
    expect(title).toBeInTheDocument();
  // Ensure placeholder quest title not rendered because backend returned items
  expect(screen.queryByText('Verbinde zwei Hubs')).not.toBeInTheDocument();
  expect(screen.queryByText(/nicht erreichbar/i)).not.toBeInTheDocument();
    const recCards = await screen.findAllByTestId('rec-item');
    expect(recCards.length).toBe(mockItems.length);
    // Validate reason mapping (bridge diversity codes mapped to i18n keys -> German strings)
    expect(screen.getByText(/Brücken/i)).toBeInTheDocument();
    expect(screen.getByText(/Vielfalt/i)).toBeInTheDocument();
    expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
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
