import type { CombatProbe } from './harness.ts';

export async function runPlayerDeathChecks(probe: CombatProbe) {
  const { page, check: test, ok, fail } = probe;

  // Requirement 7: monster kills player, adds corruption, then normal respawn if below threshold.
  await test('REQ-7 — Defeat by monster adds corruption before normal respawn', async () => {
    const s = await page.evaluate(() => {
      window.__state.player.hp = 1;
      window.__state.player.maxHp = 42;
      window.__state.player.baseMaxHp = 42;
      window.__state.player.maxMp = 18;
      window.__state.player.baseMaxMp = 18;
      window.__state.player.invuln = 0;
      window.__state.player.blockTimer = 0;
      window.__state.player.def = 0;
      window.__state.player.gear = { weapon: 'trainingSword', head: null, body: null, legs: null, feet: null, accessory: null };
      window.__state.player.gearMods = {};
      window.__state.player.monsterForm = false;
      window.__state.player.corruption = 0;
      window.__state.player.corruptionHitCooldown = 0;
      window.__state.player.corruptionChoicePending = false;
      window.__state.player.deathFatigue = 0;
      window.__state.player.deathFatigueReliefCooldown = 0;
      window.__state.scene = 'forest';
      window.__api.damagePlayer(99, { name: '怪物', faction: 'monster', alive: true });
      return {
        hp: window.__state.player.hp,
        maxHp: window.__state.player.maxHp,
        mf: window.__state.player.monsterForm,
        corruption: window.__state.player.corruption,
        choice: window.__state.player.corruptionChoicePending,
        scene: window.__state.scene,
        fatigue: window.__state.player.deathFatigue
      };
    });
    if (!s.mf && !s.choice && s.fatigue === 1 && s.hp === Math.ceil(s.maxHp * 0.5) && s.scene === 'field' && s.corruption >= 41 && s.corruption <= 43) ok(`corruption=${s.corruption} hp=${s.hp}/${s.maxHp} scene=${s.scene}`);
    else fail(`monsterForm=${s.mf} choice=${s.choice} hp=${s.hp}/${s.maxHp} scene=${s.scene} corruption=${s.corruption} fatigue=${s.fatigue}`);
  });

  // Requirement 8: defeat in monsterForm respawns at shrine.
  await test('REQ-8 — Defeat in monsterForm → teleport to white shrine', async () => {
    const s = await page.evaluate(() => {
      window.__state.player.hp = 1;
      window.__state.player.maxHp = 42;
      window.__state.player.baseMaxHp = 42;
      window.__state.player.maxMp = 18;
      window.__state.player.baseMaxMp = 18;
      window.__state.player.invuln = 0;
      window.__state.player.blockTimer = 0;
      window.__state.player.def = 0;
      window.__state.player.gear = { weapon: 'trainingSword', head: null, body: null, legs: null, feet: null, accessory: null };
      window.__state.player.gearMods = {};
      window.__state.player.monsterForm = true;
      window.__state.player.deathFatigue = 0;
      window.__state.player.deathFatigueReliefCooldown = 0;
      window.__state.scene = 'forest';
      window.__api.damagePlayer(99, { name: '怪物', faction: 'monster', alive: true });
      return {
        hp: window.__state.player.hp,
        maxHp: window.__state.player.maxHp,
        scene: window.__state.scene,
        invuln: window.__state.player.invuln,
        fatigue: window.__state.player.deathFatigue
      };
    });
    if (s.hp === Math.ceil(s.maxHp * 0.5) && s.fatigue === 1 && s.scene === 'field' && s.invuln === 1.2) ok(`hp=${s.hp}/${s.maxHp} scene=${s.scene} invuln=${s.invuln}`);
    else fail(`hp=${s.hp}/${s.maxHp} scene=${s.scene} invuln=${s.invuln} fatigue=${s.fatigue}`);
  });
}
