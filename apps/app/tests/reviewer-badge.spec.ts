import { test, expect } from '@playwright/test';

// E2E: Submit a text_note proof (q2) and approve it via review queue to earn reviewer badge
// Covers multi-step quest lifecycle for non-complete proof + badge awarding path.
test('reviewer badge after approving a submitted proof', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Jetzt starten' }).click();
  await page.getByLabel('Name').fill('Reviewer');
  await page.getByRole('button', { name: 'Weiter' }).click();
  await page.getByLabel('Region').fill('Teststadt');
  await page.getByRole('button', { name: 'Fertig' }).click();

  // Ensure quests list loaded
  const q2 = page.getByRole('article', { name: /Teile eine kurze Lern-Notiz/ });
  await q2.getByRole('button', { name: 'Annehmen' }).click();
  await q2.getByRole('button', { name: 'Starten' }).click();
  const submitBtn = q2.getByRole('button', { name: 'Nachweis einreichen' });
  await expect(submitBtn).toBeVisible();
  await submitBtn.click();
  // Wait until status note appears inside quest card
  await expect(q2.getByRole('status')).toHaveText(/Eingereicht/);
  // Ensure persistence (proof saved to localStorage) before navigating away
  await page.waitForFunction(() => {
    const raw = localStorage.getItem('quests.state');
    if (!raw) return false;
    try { const j = JSON.parse(raw); return !!j.proofs && !!j.proofs.q2 && j.proofs.q2.status === 'pending'; } catch { return false; }
  }, { timeout: 10000 });
  await expect(page.getByRole('status')).toHaveText(/Eingereicht/);

  // Open review queue directly and approve
  // Use navigation bar to go to review queue if available (direct nav kept as fallback)
  await page.goto('/review');
  // Wait for pending proof to surface
  // Poll for approve button (mount effect loads proofs from localStorage)
  await page.waitForFunction(() => !!document.querySelector('button[aria-label="Nachweis akzeptieren"]') || document.querySelector('[role="status"]')?.textContent?.includes('Keine offenen') === false, { timeout: 10000 });
  // If still not found, try a soft reload once (SPA navigation keeps state ephemeral otherwise)
  if (!(await page.$('button[aria-label="Nachweis akzeptieren"]'))) {
    await page.reload();
    await page.waitForFunction(() => !!document.querySelector('button[aria-label="Nachweis akzeptieren"]'), { timeout: 5000 });
  }
  let approveBtn = page.getByRole('button', { name: /Nachweis akzeptieren/i });
  await approveBtn.click();

  // Navigate to profile and assert reviewer badge
  await page.getByRole('link', { name: 'Ich' }).click();
  await expect(page.getByTestId('badge-list')).toContainText(/reviewer/);
});
