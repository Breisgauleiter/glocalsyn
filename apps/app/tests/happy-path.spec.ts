import { test, expect } from '@playwright/test';

// E2E Happy Path: Home -> Login -> Profile -> Quests (Dummy-Quest done)
test('happy path mobile 3-tap onboarding', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Jetzt starten' }).click();
  await page.getByLabel('Name').fill('Alex');
  await page.getByRole('button', { name: 'Weiter' }).click();
  await page.getByLabel('Region').fill('Freiburg');
  await page.getByRole('button', { name: 'Fertig' }).click();
  await page.getByRole('button', { name: 'Annehmen' }).click();
  await page.getByRole('button', { name: 'Erledigt' }).click();
  await expect(page.getByRole('status')).toHaveText(/Erledigt/);

  // Extra: Link GitHub and verify a GitHub-sourced quest appears
  await page.getByRole('link', { name: 'Ich' }).click();
  await page.getByRole('button', { name: 'GitHub verknüpfen' }).click();
  await page.getByRole('link', { name: 'Quests' }).click();
  await expect(page.getByRole('status')).toHaveText(/GitHub‑Quests freigeschaltet/i);
  await expect(page.getByRole('link', { name: /Breisgauleiter\/glocalsyn#1/ })).toBeVisible();

  // Toggle filter to GitHub and ensure local quest disappears
  await page.getByLabel('GitHub').click();
  await expect(page.getByRole('article', { name: /Begrüße deinen Hub/ })).toHaveCount?.(0);
  // Back to Alle
  await page.getByLabel('Alle').click();
});
