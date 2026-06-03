import type { E2eProbe } from './harness.ts';

export async function runPanelChecks(probe: E2eProbe) {
  const { page, step, ok, fail } = probe;

  // ─── QUEST PANEL ──────────────────────────────────────────────────────────
  await step('Quest panel (J) opens', async () => {
    await page.keyboard.press('j');
    await page.waitForTimeout(400);
    const len = await page.evaluate(() => document.getElementById('questPanel').innerHTML.length);
    if (len > 100) ok(`html len=${len}`); else fail(`quest empty (len=${len})`);
  });

  await step('Quest panel closes via Esc', async () => {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const hidden = await page.evaluate(() => document.getElementById('questPanel').classList.contains('hidden'));
    if (hidden) ok('hidden'); else fail('still visible');
  });

  // ─── MAGIC PANEL ──────────────────────────────────────────────────────────
  await step('Magic panel (F) opens', async () => {
    await page.keyboard.press('f');
    await page.waitForTimeout(400);
    const len = await page.evaluate(() => document.getElementById('magicPanel').innerHTML.length);
    if (len > 100) ok(`html len=${len}`); else fail(`magic empty (len=${len})`);
  });

  await step('Magic panel closes via Esc', async () => {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const hidden = await page.evaluate(() => document.getElementById('magicPanel').classList.contains('hidden'));
    if (hidden) ok('hidden'); else fail('still visible');
  });
}
