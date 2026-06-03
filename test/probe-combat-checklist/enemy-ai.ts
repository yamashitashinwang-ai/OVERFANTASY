import type { CombatProbe } from './harness.ts';

export async function runEnemyAiChecks(probe: CombatProbe) {
  const { page, check: test, ok, fail } = probe;

  // ─── Requirement 1: enemy melee damages player ────────────────────────────
  await test('REQ-1 — Enemy adjacent to player deals damage in one AI tick', async () => {
    const result = await page.evaluate(() => {
      const s = window.__state;
      s.entities = [];
      s.player.hp = 42;
      s.player.invuln = 0;
      s.player.blockTimer = 0;
      s.player.def = 0;
      s.player.monsterForm = false;
      s.player.gear = { weapon: 'trainingSword', head: null, body: null, legs: null, feet: null, accessory: null };
      s.player.gearMods = {};
      s.entities.push({
        kind: 'monster', species: 'wolf', name: '小魔狼',
        x: s.player.x + 0.4, y: s.player.y,
        hp: 10, maxHp: 10, atk: 5, alive: true, faction: 'monster',
        cooldown: 0, region: 'forest', r: 12, speed: 1.5, ownerId: 'world', id: 'm1'
      });
      const hp0 = s.player.hp;
      window.__api.updateEntities(0.1);
      return { hp0, hp1: s.player.hp };
    });
    if (result.hp1 < result.hp0) ok(`HP ${result.hp0} → ${result.hp1}`);
    else fail(`HP unchanged: ${result.hp0} → ${result.hp1}`);
  });

  // ─── Requirement 2: ranged enemy hits player ─────────────────────────────
  await test('REQ-2 — Ranged enemy at d<4.6 fires and damages player', async () => {
    const result = await page.evaluate(() => {
      const s = window.__state;
      s.entities = [];
      s.player.hp = 42;
      s.player.invuln = 0;
      s.player.blockTimer = 0;
      s.player.def = 0;
      s.player.monsterForm = false;
      s.entities.push({
        kind: 'monster', species: 'wisp', name: '幽光', ranged: true,
        x: s.player.x + 3, y: s.player.y,
        hp: 10, maxHp: 10, atk: 5, alive: true, faction: 'monster',
        cooldown: 0, region: 'forest', r: 12, speed: 1.5, ownerId: 'world', id: 'm2'
      });
      const hp0 = s.player.hp;
      window.__api.updateEntities(0.1);
      return { hp0, hp1: s.player.hp };
    });
    if (result.hp1 < result.hp0) ok(`HP ${result.hp0} → ${result.hp1}`);
    else fail(`ranged miss: HP ${result.hp0} → ${result.hp1}`);
  });

  // ─── Requirement 3: enemy AI moves toward player ─────────────────────────
  await test('REQ-3 — Hostile monster within 11.5 tiles moves toward player', async () => {
    const result = await page.evaluate(() => {
      const s = window.__state;
      s.entities = [];
      s.player.monsterForm = false;
      s.entities.push({
        kind: 'monster', species: 'wolf', name: '小魔狼',
        x: s.player.x + 5, y: s.player.y,
        hp: 10, maxHp: 10, atk: 5, alive: true, faction: 'monster',
        cooldown: 99, region: 'forest', r: 12, speed: 1.5, ownerId: 'world', id: 'm3'
      });
      const x0 = s.entities[0].x;
      window.__api.updateEntities(0.5);
      return { x0, x1: s.entities[0].x };
    });
    if (result.x1 < result.x0) ok(`enemy x ${result.x0.toFixed(2)} → ${result.x1.toFixed(2)}`);
    else fail(`enemy did not move closer: ${result.x0.toFixed(2)} → ${result.x1.toFixed(2)}`);
  });
}
