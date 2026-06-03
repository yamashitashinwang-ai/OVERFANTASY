import type { DeepProbe } from './harness.ts';

export async function runEconomyChecks(probe: DeepProbe) {
  const { page, step, ok, fail } = probe;

  await step('addMaterial("魔狼牙", 3)', async () => {
    await page.evaluate(() => { window.__state.player.materials = {}; });
    await page.evaluate(() => window.__api.addMaterial('魔狼牙', 3));
    const m = await page.evaluate(() => window.__state.player.materials['魔狼牙']);
    if (m === 3) ok(`materials=${m}`); else fail(`got ${m}`);
  });

  await step('addResource("木材", 5) → wood', async () => {
    await page.evaluate(() => { window.__state.player.resources = {}; window.__state.player.wood = 0; });
    await page.evaluate(() => window.__api.addResource('木材', 5));
    const wood = await page.evaluate(() => window.__state.player.wood);
    if (wood === 5) ok(`wood=${wood}`); else fail(`got ${wood}`);
  });

  await step('forgeRing — needs 1 wood + 1 stone', async () => {
    await page.evaluate(() => {
      window.__state.player.resources = {};
      window.__api.addResource('木材', 5);
      window.__api.addResource('反重力石', 5);
      window.__state.player.rings = 0;
    });
    await page.evaluate(() => {
      const originalRandom = Math.random;
      try {
        Math.random = () => 0;
        window.__api.forgeRing();
      } finally {
        Math.random = originalRandom;
      }
    });
    const s = await page.evaluate(() => ({
      rings: window.__state.player.rings,
      wood: window.__state.player.wood,
      stone: window.__state.player.stone
    }));
    if (s.rings === 1 && s.wood === 4 && s.stone === 4) ok(`rings=${s.rings} wood=${s.wood} stone=${s.stone}`);
    else fail(`rings=${s.rings} wood=${s.wood} stone=${s.stone}`);
  });

  await step('buyPotion (near shop)', async () => {
    await page.evaluate(() => { window.__state.player.gold = 100; window.__state.player.potions = 0; });
    await page.evaluate(() => window.__api.buyPotion());
    const s = await page.evaluate(() => ({ gold: window.__state.player.gold, potions: window.__state.player.potions }));
    if (s.gold === 92 && s.potions === 1) ok(`gold=${s.gold} potions=${s.potions}`);
    else fail(`gold=${s.gold} potions=${s.potions}`);
  });

  await step('buyArrows(5)', async () => {
    await page.evaluate(() => { window.__state.player.gold = 100; window.__state.player.arrows = 0; });
    await page.evaluate(() => window.__api.buyArrows(5));
    const s = await page.evaluate(() => ({ gold: window.__state.player.gold, arrows: window.__state.player.arrows }));
    if (s.arrows === 5 && s.gold === 95) ok(`gold=${s.gold} arrows=${s.arrows}`);
    else fail(`gold=${s.gold} arrows=${s.arrows}`);
  });

  await step('sellMaterial("魔狼牙", 3) — 9G/each', async () => {
    await page.evaluate(() => {
      window.__state.player.materials = { '魔狼牙': 5 };
      window.__state.player.gold = 0;
    });
    const got = await page.evaluate(() => window.__api.sellMaterial('魔狼牙', 3));
    const s = await page.evaluate(() => ({ count: window.__state.player.materials['魔狼牙'] || 0, gold: window.__state.player.gold }));
    if (got === 27 && s.count === 2) ok(`sold ${got}G, left=${s.count}`);
    else fail(`sold ${got}G, left=${s.count}`);
  });
}
