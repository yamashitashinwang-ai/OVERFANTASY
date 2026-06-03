import type { CombatProbe } from './harness.ts';

export async function runPetAndEntityOutcomeChecks(probe: CombatProbe) {
  const { page, check: test, ok, fail } = probe;

  // Requirement 13: damagePet downs pet at 0 HP.
  await test('REQ-13 — damagePet at 0 HP sets injured + rescueTimer', async () => {
    await page.evaluate(() => {
      window.__state.pets = [{
        id: 'p1', name: 'Pup', hp: 5, maxHp: 10, alive: true, injured: false,
        x: 10, y: 10, scene: 'field', ownerId: 'player:local', partyId: 'party:local'
      }];
    });
    await page.evaluate(() => {
      const pet = window.__state.pets[0];
      window.__api.damagePet(pet, 99, null);
    });
    const s = await page.evaluate(() => ({
      hp: window.__state.pets[0].hp,
      alive: window.__state.pets[0].alive,
      injured: window.__state.pets[0].injured,
      rescue: window.__state.pets[0].rescueTimer
    }));
    if (s.alive === false && s.injured === true && s.rescue > 0) ok(`alive=false injured=true rescue=${s.rescue}`);
    else fail(JSON.stringify(s));
  });

  // Requirement 14: slime split on defeat.
  await test('REQ-14 — Defeated slime (gen<3) spawns 2 children', async () => {
    const result = await page.evaluate(() => {
      const p = window.__state.player;
      window.__state.entities = [{
        kind: 'monster', species: 'slime', name: '史莱姆',
        x: p.x, y: p.y, hp: 1, maxHp: 8, atk: 2, alive: true,
        faction: 'monster', split: true, slimeGen: 1, region: 'ruins',
        id: 'slime-parent', ownerId: 'world', r: 12, cooldown: 0
      }];
      const before = window.__state.entities.length;
      const slime = window.__state.entities.find(e => e.id === 'slime-parent');
      window.__api.defeatEntity(slime);
      const children = window.__state.entities.filter(e =>
        e.id !== 'slime-parent' && e.species === 'slime' && e.slimeGen === 2
      );
      return {
        before,
        after: window.__state.entities.length,
        parentAlive: slime?.alive,
        childCount: children.length,
        childSplit: children.map(e => e.split),
        childRegions: children.map(e => e.region)
      };
    });
    if (
      result.before === 1 &&
      result.parentAlive === false &&
      result.childCount === 2 &&
      result.childSplit.every(Boolean) &&
      result.childRegions.every(region => region === 'ruins')
    ) {
      ok(`children=${result.childCount}, entities ${result.before} → ${result.after}`);
    } else {
      fail(`unexpected slime split: ${JSON.stringify(result)}`);
    }
  });
}
