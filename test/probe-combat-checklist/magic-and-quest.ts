import type { CombatProbe } from './harness.ts';

export async function runMagicAndQuestChecks(probe: CombatProbe) {
  const { page, check: test, ok, fail } = probe;

  // ─── Requirement 18: Magic cast resolves ──────────────────────────────────
  await test('REQ-18 — beginMagicCast + resolveMagicCast applies damage', async () => {
    const r = await page.evaluate(() => {
      const s = window.__state;
      s.player.mp = 50;
      s.player.maxMp = 50;
      s.player.magicKnown = ['fireball'];
      s.player.monsterForm = false;
      s.entities = [{
        kind: 'monster', species: 'wolf', name: '靶',
        x: s.player.x + 2, y: s.player.y,
        hp: 100, atk: 0, alive: true, faction: 'monster',
        region: 'forest', r: 12, speed: 0, cooldown: 99,
        ownerId: 'world', id: 'spell-target'
      }];
      window.__runtime.aimVector = { x: 1, y: 0 };
      window.__runtime.aimWorld = { x: s.player.x + 2, y: s.player.y };
      window.__api.beginMagicCast('fireball');
      const cast = window.__runtime.pendingMagicCast;
      if (!cast) return { error: 'no pending cast' };
      const hp0 = s.entities[0].hp;
      window.__api.resolveMagicCast(cast);
      return { hp0, hp1: s.entities[0].hp, pending: !!window.__runtime.pendingMagicCast };
    });
    if (r.error) fail(r.error);
    else if (r.hp1 < r.hp0) ok(`target HP ${r.hp0} → ${r.hp1}`);
    else fail(`spell didn't damage: ${JSON.stringify(r)}`);
  });

  // ─── Requirement 19: monsterForm blocks casting ──────────────────────────
  await test('REQ-19 — monsterForm prevents beginMagicCast', async () => {
    const r = await page.evaluate(() => {
      window.__state.player.monsterForm = true;
      window.__state.player.mp = 50;
      window.__state.player.magicKnown = ['fireball'];
      window.__runtime.pendingMagicCast = null;
      window.__api.beginMagicCast('fireball');
      return { pending: !!window.__runtime.pendingMagicCast };
    });
    if (!r.pending) ok('monsterForm blocked cast');
    else fail('cast went through in monsterForm');
  });

  // ─── Requirement 20: Quest kill progress ──────────────────────────────────
  await test('REQ-20 — Defeating quest target increments quest progress', async () => {
    const r = await page.evaluate(() => {
      const s = window.__state;
      s.player.monsterForm = false;
      s.quests = { major: null, small: [] };
      window.__api.acceptMajorQuest('major_wolf_hunt');
      const q0 = s.quests.major;
      if (!q0) return { error: 'quest not accepted' };
      const wolf = {
        kind: 'monster', species: 'wolf', name: '小魔狼',
        x: s.player.x, y: s.player.y,
        hp: 1, atk: 3, alive: true, faction: 'monster',
        region: 'forest', r: 12, speed: 1.5,
        ownerId: 'world', id: 'quest-wolf'
      };
      s.entities = [wolf];
      window.__api.defeatEntity(wolf);
      return { progress: s.quests.major?.progress, count: q0.count };
    });
    if (r.error) fail(r.error);
    else if (r.progress >= 1) ok(`progress ${r.progress}/${r.count}`);
    else fail(`progress=${r.progress}`);
  });

  // ─── Requirement 21: Settle quest pays reward ─────────────────────────────
  await test('REQ-21 — settleMajorQuest pays gold/potions reward', async () => {
    const r = await page.evaluate(() => {
      const s = window.__state;
      s.player.gold = 0;
      s.player.potions = 0;
      s.quests = { major: null, small: [] };
      // Use the proper API so rollQuestReward converts tuples to single ints.
      window.__api.acceptMajorQuest('major_wolf_hunt');
      const q = s.quests.major;
      if (!q) return { error: 'quest not accepted' };
      q.progress = q.count;
      q.goalDone = true;
      window.__api.settleMajorQuest(false);
      return { gold: s.player.gold, potions: s.player.potions, hadQuest: !!s.quests.major };
    });
    if (r.error) fail(r.error);
    else if (r.gold > 0 && !r.hadQuest) ok(`reward paid: gold=${r.gold} potions=${r.potions}`);
    else fail(JSON.stringify(r));
  });
}
