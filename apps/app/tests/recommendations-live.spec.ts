import { test, expect } from '@playwright/test';

// E2E: Live recommendations rendering (flag enabled) using fetch stub.
// Keeps network isolated; relies on Home using global __TEST_ENABLE_RECS__ flag.

test('live recommendations render with reasons', async ({ page }) => {
  await page.addInitScript(() => {
    // @ts-ignore
    window.__TEST_ENABLE_RECS__ = true;
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/graph/recommendations/')) {
        return Promise.resolve(new Response(JSON.stringify({ items: [
          { node: { _key: 'rx1', type: 'quest', name: 'Quest Alpha' }, reasons: [{ code: 'bridge', explanation: 'Bridge' }] },
          { node: { _key: 'rx2', type: 'quest', name: 'Quest Beta' }, reasons: [{ code: 'diversity', explanation: 'Diversity' }] }
        ] }), { status: 200, headers: { 'Content-Type': 'application/json', 'ETag': 'W/"r1"' } }));
      }
      return originalFetch(input as any, init);
    };
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Heute dran/ })).toBeVisible();
  const cards = page.getByTestId('rec-item');
  await expect(cards).toHaveCount(2);
  await expect(page.getByText('Quest Alpha')).toBeVisible();
  await expect(page.getByText('Quest Beta')).toBeVisible();
  await expect(page.getByText(/Brücken/i)).toBeVisible();
  await expect(page.getByText(/Vielfalt/i)).toBeVisible();
});
