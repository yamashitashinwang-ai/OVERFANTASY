import type { WeaponProbe } from './harness.ts';

export async function runBowChargeCycleCheck(probe: WeaponProbe) {
  const { page, test, ok, fail } = probe;

  await test('Bow: complete charge → release cycle', async () => {
    const result = await page.evaluate(() => {
      const s = window.__state;
      window.__api.addGearToBag('shortBow');
      window.__api.equipGear('shortBow');
      s.player.arrows = 5;
      s.player.stamina = 30;
      s.player.hp = 42;
      s.player.invuln = 0;
      s.player.attackCooldown = 0;
      s.player.blockTimer = 0;
      s.player.monsterForm = false;
      window.__api.setBowCharge?.(null);
      window.__api.setHitStopTimer?.(0);
      s.entities = [{
        kind: 'monster', species: 'wolf', name: '靶',
        x: s.player.x + 3, y: s.player.y,
        hp: 50, maxHp: 50, atk: 0, alive: true, faction: 'monster',
        cooldown: 99, r: 12, speed: 0, ownerId: 'world', id: 'bow-target'
      }];
      window.__runtime.aimVector = { x: 1, y: 0 };
      try {
        const charged = window.__api.beginBowCharge();
        const charging = !!window.__runtime.bowCharge;
        if (charging && window.__runtime.bowCharge) window.__runtime.bowCharge.time = 0.5;
        const released = window.__api.releaseBowCharge();
        return { ok: true, charged, released, arrowsLeft: s.player.arrows };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { ok: false, error: message.slice(0, 200) };
      }
    });

    if (result.ok && result.charged && result.released) ok(`charged=${result.charged} released=${result.released} arrows=${result.arrowsLeft}`);
    else fail(JSON.stringify(result));
  });
}
