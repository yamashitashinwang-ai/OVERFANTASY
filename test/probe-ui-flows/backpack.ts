import type { UiFlowProbe } from './harness.ts';

export async function runBackpackFlows(probe: UiFlowProbe) {
  const { page, step, ok, fail } = probe;

  // ─── Backpack equip / unequip ─────────────────────────────────────────────
  await step('Backpack: equip a new gear via UI button', async () => {
    // Add an unequipped gear to bag
    await page.evaluate(() => window.__api.addGearToBag('ironSword'));
    await page.keyboard.press('b');
    await page.waitForTimeout(400);
    await page.evaluate(() => document.querySelector('[data-bag-category="equipment"]')?.click());
    await page.waitForTimeout(200);
    await page.evaluate(() => document.querySelector('[data-bag-item="ironSword"]')?.click());
    await page.waitForTimeout(200);
    await page.evaluate(() => document.querySelector('[data-bag-action="gearToggle"][data-id="ironSword"]')?.click());
    await page.waitForTimeout(300);
    const eq = await page.evaluate(() => window.__state.player.gear.weapon);
    if (eq === 'ironSword') ok(`equipped: ${eq}`); else fail(`weapon=${eq}`);
  });

  await step('Close backpack via close button', async () => {
    await page.evaluate(() => document.querySelector('[data-bag-action="close"]')?.click());
    await page.waitForTimeout(500);
    const hidden = await page.evaluate(() => document.getElementById('backpackPanel').classList.contains('hidden'));
    if (hidden) ok('hidden'); else fail('still visible');
  });
}
