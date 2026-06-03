import type { UiFlowProbe } from './harness.ts';

export async function runForgePanelFlows(probe: UiFlowProbe) {
  const { page, step, ok, fail } = probe;

  // ─── Forge panel UI ────────────────────────────────────────────────────────
  await step('Open forge panel via openForgePanel', async () => {
    await page.evaluate(() => window.__api.openForgePanel());
    await page.waitForTimeout(500);
    const html = await page.evaluate(() => document.getElementById('forgePanel').innerHTML.length);
    const tabs = await page.evaluate(() => Array.from(document.querySelectorAll('[data-forge-tab]')).map(b => b.dataset.forgeTab));
    if (html > 100 && tabs.length === 3) ok(`html=${html}, tabs=${tabs.join(',')}`);
    else fail(`html=${html}, tabs=${tabs}`);
  });

  await step('Click "戒指锻造" tab → forge ring button', async () => {
    await page.evaluate(() => document.querySelector('[data-forge-tab="ring"]')?.click());
    await page.waitForTimeout(200);
    const beforeRings = await page.evaluate(() => window.__state.player.rings || 0);
    await page.evaluate(() => document.querySelector('[data-forge-action="forgeRing"]')?.click());
    await page.waitForTimeout(200);
    const afterRings = await page.evaluate(() => window.__state.player.rings || 0);
    // 62% success per ring; just check resource was consumed
    const wood = await page.evaluate(() => window.__state.player.wood);
    if (wood < 10) ok(`wood ${10} → ${wood}, rings ${beforeRings} → ${afterRings}`);
    else fail(`wood=${wood} (expected <10)`);
  });

  await step('Switch to "武器锻造" tab', async () => {
    await page.evaluate(() => document.querySelector('[data-forge-tab="weapon"]')?.click());
    await page.waitForTimeout(300);
    const weapons = await page.evaluate(() => Array.from(document.querySelectorAll('[data-forge-weapon]')).map(b => b.dataset.forgeWeapon));
    if (weapons.length > 0) ok(`weapons available: ${weapons.length}`);
    else fail('no weapons listed');
  });

  await step('Close forge panel via close button', async () => {
    await page.evaluate(() => document.querySelector('[data-forge-action="close"]')?.click());
    await page.waitForTimeout(500);
    const hidden = await page.evaluate(() => document.getElementById('forgePanel').classList.contains('hidden'));
    if (hidden) ok('hidden'); else fail('still visible');
  });
}
