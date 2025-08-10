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
});
