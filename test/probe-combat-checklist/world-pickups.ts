import type { CombatProbe } from './harness.ts';

export async function runWorldPickupChecks(probe: CombatProbe) {
  const { page, check: test, ok, fail } = probe;

  // Requirement 12: pickup items.
  await test('REQ-12 — Walking over gold pickup adds to inventory', async () => {
    await page.evaluate(() => {
      const p = window.__state.player;
      p.gold = 0;
      window.__state.pickups = [{
        id: 'pickup-coin', kind: 'gold', name: '金币', value: 5,
        x: p.x, y: p.y, ownerId: 'world', reservedFor: null, takenBy: null
      }];
    });
    await page.evaluate(() => window.__api.pickupItems());
    const gold = await page.evaluate(() => window.__state.player.gold);
    if (gold === 5) ok(`gold picked up = ${gold}`);
    else fail(`gold=${gold} (expected 5)`);
  });
}
