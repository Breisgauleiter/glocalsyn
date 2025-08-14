import { test, expect } from '@playwright/test';

// E2E: Magic link dev-token flow via intercepted network calls.
// This test stubs /auth/register to return a dev token and /auth/magic-link/consume to set a session.

const DEV_TOKEN = 'dev-123456';

test('magic link dev token login flow', async ({ page }) => {
  let loggedIn = false;

  await page.route('**/auth/register', async route => {
    const json = { token: DEV_TOKEN };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
  });
  await page.route('**/auth/magic-link/consume', async route => {
    loggedIn = true;
    const json = { user: { id: 'u-dev', displayName: 'Dev User' } };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json), headers: { 'set-cookie': 'sid=dev; Path=/; HttpOnly' } });
  });
  await page.route('**/me', async route => {
    if (loggedIn) {
      const json = { user: { id: 'u-dev', displayName: 'Dev User' } };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
    } else {
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'unauthenticated' }) });
    }
  });

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  await page.getByLabel('E-Mail').fill('dev@example.com');
  // Click the first form's submit button (robust across label changes)
  await page.locator('form[role="form"] button[type="submit"]').first().click();
  await expect(page.getByRole('status')).toHaveText(/Link gesendet/i);
  await page.getByLabel('Token (Dev)').fill(DEV_TOKEN);
  await page.getByRole('button', { name: 'Anmelden' }).click();

  // Should land on profile-setup
  await expect(page).toHaveURL(/\/profile-setup/);
  // Fill wizard quickly to complete onboarding
  await page.getByLabel('Name').fill('Dev User');
  await page.getByRole('button', { name: 'Weiter' }).click();
  await page.getByLabel('Region').fill('Teststadt');
  await page.getByRole('button', { name: 'Fertig' }).click();

  // Arrive at quests
  await expect(page).toHaveURL(/\/quests/);
});
