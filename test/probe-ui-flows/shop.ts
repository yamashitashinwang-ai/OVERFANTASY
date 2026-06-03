import type { UiFlowProbe } from './harness.ts';

export async function runShopPanelFlows(probe: UiFlowProbe) {
  const { page, step, ok, fail } = probe;

  // ─── Shop panel UI ────────────────────────────────────────────────────────
  await step('Open shop via openShopPanel', async () => {
    await page.evaluate(() => window.__api.openShopPanel());
    await page.waitForTimeout(500);
    const html = await page.evaluate(() => document.getElementById('shopPanel').innerHTML.length);
    if (html > 100) ok(`html=${html}`); else fail(`html=${html}`);
  });

  await step('Click buyPotion button via UI', async () => {
    const beforeGold = await page.evaluate(() => window.__state.player.gold);
    const beforePotions = await page.evaluate(() => window.__state.player.potions);
    await page.evaluate(() => document.querySelector('[data-shop-action="buyPotion"]')?.click());
    await page.waitForTimeout(200);
    const afterGold = await page.evaluate(() => window.__state.player.gold);
    const afterPotions = await page.evaluate(() => window.__state.player.potions);
    if (afterPotions === beforePotions + 1 && afterGold === beforeGold - 8) {
      ok(`gold ${beforeGold} → ${afterGold}, potions ${beforePotions} → ${afterPotions}`);
    } else fail(`gold=${beforeGold}→${afterGold} potions=${beforePotions}→${afterPotions}`);
  });

  await step('Switch to sell tab', async () => {
    await page.evaluate(() => document.querySelector('[data-shop-tab="sell"]')?.click());
    await page.waitForTimeout(200);
    const sellable = await page.evaluate(() => Array.from(document.querySelectorAll('[data-shop-action="sellOne"]')).map(b => b.dataset.material));
    if (sellable.length > 0) ok(`sellable: ${sellable.join(',')}`); else fail('nothing sellable');
  });

  await step('Sell one 魔狼牙 via UI', async () => {
    const before = await page.evaluate(() => ({
      count: window.__state.player.materials['魔狼牙'] || 0,
      gold: window.__state.player.gold
    }));
    await page.evaluate(() => document.querySelector('[data-shop-action="sellOne"][data-material="魔狼牙"]')?.click());
    await page.waitForTimeout(200);
    const after = await page.evaluate(() => ({
      count: window.__state.player.materials['魔狼牙'] || 0,
      gold: window.__state.player.gold
    }));
    if (after.count === before.count - 1 && after.gold > before.gold) {
      ok(`count ${before.count} → ${after.count}, gold +${after.gold - before.gold}`);
    } else fail(`count=${before.count}→${after.count}, gold=${before.gold}→${after.gold}`);
  });

  await step('Close shop via close button', async () => {
    await page.evaluate(() => document.querySelector('[data-shop-action="close"]')?.click());
    await page.waitForTimeout(500);
    const hidden = await page.evaluate(() => document.getElementById('shopPanel').classList.contains('hidden'));
    if (hidden) ok('hidden'); else fail('still visible');
  });
}
