import type { CombatProbe } from './harness.ts';

export async function runWorldSystemChecks(probe: CombatProbe) {
  const { page, check: test, ok, fail } = probe;

  // ─── Requirement 22: Pet AI ────────────────────────────────────────────────
  await test('REQ-22 — updatePets moves pet toward player when far', async () => {
    const r = await page.evaluate(() => {
      const s = window.__state;
      // Build a complete pet with all required fields (mirror makePet shape)
      s.pets = [{
        id: 'pet1', name: 'Pup', hp: 20, maxHp: 20, atk: 5, alive: true,
        injured: false, lost: false, dead: false, carried: false,
        x: s.player.x + 5, y: s.player.y, scene: s.scene,
        ownerId: 'player:local', partyId: 'party:local',
        speed: 2, cooldown: 1.0, cooldownTimer: 0,
        wanderTimer: 0, wanderX: 0, wanderY: 0,
        guardRange: 6, attackRange: 0.9, roamRadius: 4,
        rescueTimer: 0
      }];
      s.entities = [];
      const x0 = s.pets[0].x;
      window.__api.updatePets(1.0);
      return { x0, x1: s.pets[0].x };
    });
    if (r.x1 < r.x0) ok(`pet x ${r.x0.toFixed(2)} → ${r.x1.toFixed(2)} (closer)`);
    else fail(`pet did not follow: ${r.x0.toFixed(2)} → ${r.x1.toFixed(2)}`);
  });

  // ─── Requirement 23: MP regen ─────────────────────────────────────────────
  await test('REQ-23 — MP regen ticks up over time', async () => {
    const r = await page.evaluate(() => {
      window.__state.player.mp = 5;
      window.__state.player.maxMp = 20;
      window.__state.player.mpRegenLock = 0;
      const mp0 = window.__state.player.mp;
      window.__api.updateMpRegen(2.0);
      return { mp0, mp1: window.__state.player.mp };
    });
    if (r.mp1 > r.mp0) ok(`MP ${r.mp0} → ${r.mp1.toFixed(2)}`);
    else fail(`no regen: ${r.mp0} → ${r.mp1}`);
  });

  // ─── Requirement 24: Portal loads new scene ───────────────────────────────
  await test('REQ-24 — loadScene("forest") changes state.scene', async () => {
    const r = await page.evaluate(() => {
      window.__state.scene = 'field';
      window.__api.loadScene('forest', 5, 5, '探索森林');
      return { scene: window.__state.scene, x: window.__state.player.x, y: window.__state.player.y };
    });
    if (r.scene === 'forest' && r.x === 5 && r.y === 5) ok(`scene=${r.scene} pos=(${r.x},${r.y})`);
    else fail(`scene=${r.scene} pos=(${r.x},${r.y})`);
  });
}
