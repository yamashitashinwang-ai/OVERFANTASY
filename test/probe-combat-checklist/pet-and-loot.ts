import type { CombatProbe } from './harness.ts';

export async function runPetAndLootChecks(probe: CombatProbe) {
  const { page, check: test, ok, fail } = probe;

  // ─── Requirement 16: pet aggro routing ────────────────────────────────────
  await test('REQ-16 — Enemy with high pet aggro routes to pet (not player)', async () => {
    const r = await page.evaluate(() => {
      const s = window.__state;
      s.pets = [{
        id: 'pet1', name: 'Pup', hp: 20, maxHp: 20, alive: true, injured: false,
        x: s.player.x + 2, y: s.player.y, scene: s.scene, ownerId: 'player:local', partyId: 'party:local',
        atk: 4
      }];
      const enemy = {
        kind: 'monster', species: 'wolf', name: '狼',
        x: s.player.x + 2, y: s.player.y + 0.5,  // near pet
        hp: 10, atk: 3, alive: true, faction: 'monster',
        cooldown: 99, region: 'forest', r: 12, speed: 1.5,
        petAggro: { pet1: 100 },  // strong aggro on pet
        ownerId: 'world', id: 'aggro-test'
      };
      s.entities = [enemy];
      // strongestPetAggro is in api/scene exports
      const result = window.__api.strongestPetAggro?.(enemy);
      return { hasFn: typeof window.__api.strongestPetAggro === 'function', pet: result?.pet?.id, value: result?.value };
    });
    if (r.pet === 'pet1' && r.value === 100) ok(`pet routed: ${r.pet} (aggro=${r.value})`);
    else fail(`strongestPetAggro result: ${JSON.stringify(r)}`);
  });

  // ─── Requirement 17: dropLoot drops pickup on monster defeat ──────────────
  await test('REQ-17 — Defeated wolf spawns a pickup + grants gold', async () => {
    const r = await page.evaluate(() => {
      const s = window.__state;
      s.player.gold = 0;
      s.pickups = [];
      s.entities = [];
      // Try many times to get a drop (probabilistic)
      let success = false;
      for (let i = 0; i < 50; i++) {
        const w = {
          kind: 'monster', species: 'wolf', name: '小魔狼',
          x: s.player.x, y: s.player.y,
          hp: 1, atk: 3, alive: true, faction: 'monster',
          region: 'forest', r: 12, speed: 1.5,
          ownerId: 'world', id: 'drop-test-' + i
        };
        s.entities.push(w);
        window.__api.defeatEntity(w);
        if (s.pickups.length > 0) { success = true; break; }
      }
      return { pickupCount: s.pickups.length, gold: s.player.gold, success };
    });
    if (r.success && r.gold > 0) ok(`pickups=${r.pickupCount}, gold=${r.gold}`);
    else fail(`no pickup after 50 tries: ${JSON.stringify(r)}`);
  });
}
