import type { E2eProbe } from './harness.ts';

export async function runBootAndNewGameChecks(probe: E2eProbe) {
  const { page, step, ok, fail, state: $state } = probe;

  // ─── BOOT ──────────────────────────────────────────────────────────────
  await step('Boot + main menu visible', async () => {
    const len = await page.evaluate(() => document.getElementById('mainMenu').innerHTML.length);
    if (len > 100) ok('menu rendered'); else fail('menu empty');
  });

  // ─── NEW GAME ──────────────────────────────────────────────────────────
  await step('Start new game (人类)', async () => {
    await page.evaluate(() => document.querySelector('[data-menu-action="new"]')?.click());
    await page.waitForTimeout(300);
    await page.evaluate(() => document.querySelector('[data-menu-action="startRace"][data-race="人类"]')?.click());
    await page.waitForTimeout(1500);
    const s = await $state();
    if (s.player.race === '人类' && s.player.hp === 42) ok(`race=${s.player.race} hp=${s.player.hp}`);
    else fail(`unexpected state: race=${s.player.race}, hp=${s.player.hp}`);
  });
}
