import type { E2eProbe } from './harness.ts';

export async function runBackpackChecks(probe: E2eProbe) {
  const { page, step, ok, fail, state: $state } = probe;

  // ─── INVENTORY: backpack panel ────────────────────────────────────────────
  await step('Backpack opens via B', async () => {
    await page.keyboard.press('b');
    await page.waitForTimeout(500);
    const len = await page.evaluate(() => document.getElementById('backpackPanel').innerHTML.length);
    if (len > 100) ok(`html len=${len}`);
    else fail(`backpack empty (len=${len})`);
  });

  await step('Switch backpack tabs (5 categories)', async () => {
    for (const cat of ['materials', 'loot', 'equipment', 'important', 'consumables']) {
      await page.evaluate((c) => document.querySelector(`[data-bag-category="${c}"]`)?.click(), cat);
      await page.waitForTimeout(150);
      const active = await page.evaluate((c) => document.querySelector(`[data-bag-category="${c}"].active`) !== null, cat);
      if (active) ok(`${cat} tab`); else fail(`${cat} tab not active`);
    }
  });

  await step('Use herb (HP must be < max to use)', async () => {
    // Damage the player first
    await page.evaluate(() => { window.__state.player.hp = 20; });
    await page.evaluate(() => document.querySelector('[data-bag-category="consumables"]')?.click());
    await page.waitForTimeout(150);
    await page.evaluate(() => document.querySelector('[data-bag-item="herb"]')?.click());
    await page.waitForTimeout(150);
    const before = await $state();
    await page.evaluate(() => document.querySelector('[data-bag-action="use"][data-id="herb"]')?.click());
    await page.waitForTimeout(200);
    const after = await $state();
    if (after.player.hp > before.player.hp && after.player.herbs === before.player.herbs - 1) {
      ok(`HP ${before.player.hp} → ${after.player.hp}, herbs ${before.player.herbs} → ${after.player.herbs}`);
    } else fail(`herb use failed: HP ${before.player.hp}→${after.player.hp}, herbs ${before.player.herbs}→${after.player.herbs}`);
  });

  await step('Equipment tab shows starting loadout', async () => {
    await page.evaluate(() => document.querySelector('[data-bag-category="equipment"]')?.click());
    await page.waitForTimeout(200);
    const items = await page.evaluate(() => Array.from(document.querySelectorAll('[data-bag-item]')).map(b => b.dataset.bagItem));
    if (items.includes('trainingSword') && items.includes('clothTunic') && items.includes('linenPants')) {
      ok(`gear: ${items.join(',')}`);
    } else fail(`missing gear: ${items.join(',')}`);
  });

  await step('Close backpack via Esc', async () => {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const hidden = await page.evaluate(() => document.getElementById('backpackPanel').classList.contains('hidden'));
    if (hidden) ok('hidden'); else fail('still visible');
  });
}
