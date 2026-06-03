import type { LiveCombatProbe } from './harness.ts';

export async function runAdjacentWolfDamageCheck(probe: LiveCombatProbe): Promise<void> {
  await probe.test('LIVE-1 — spawnCreature wolf adjacent damages player in real frames', async () => {
    await probe.page.evaluate(() => {
      const p = window.__state.player;
      p.hp = 42;
      p.invuln = 0;
      window.__api.spawnCreature('wolf', p.x + 1.5, p.y, { region: 'forest' });
    });
    await probe.page.waitForTimeout(2500);
    const hp = await probe.page.evaluate(() => window.__state.player.hp);
    if (hp < 42) probe.ok(`HP 42 → ${hp} after 2.5s exposure`);
    else probe.fail(`HP unchanged: ${hp}`);
  });
}

export async function runEnemyApproachCheck(probe: LiveCombatProbe): Promise<void> {
  await probe.test('LIVE-2 — Enemy at distance walks toward player', async () => {
    await probe.page.evaluate(() => {
      window.__state.entities = window.__state.entities.filter(e => e.id !== 'live-test-wolf');
      const p = window.__state.player;
      p.invuln = 1.5;
      window.__state.entities.push({
        kind: 'monster', species: 'wolf', name: '远狼',
        x: p.x + 6, y: p.y,
        hp: 999, maxHp: 999, atk: 3, alive: true, faction: 'monster',
        cooldown: 99, region: 'forest', r: 12, speed: 2.5,
        ownerId: 'world', id: 'live-test-wolf-2'
      });
    });
    const x0 = await probe.page.evaluate(() => window.__state.entities.find(e => e.id === 'live-test-wolf-2').x);
    await probe.page.waitForTimeout(1500);
    const x1 = await probe.page.evaluate(() => window.__state.entities.find(e => e.id === 'live-test-wolf-2').x);
    if (x1 < x0 - 0.5) probe.ok(`wolf x ${x0.toFixed(2)} → ${x1.toFixed(2)} (closed ${(x0 - x1).toFixed(2)})`);
    else probe.fail(`wolf did not approach: ${x0.toFixed(2)} → ${x1.toFixed(2)}`);
  });
}

export async function runRepeatedHitCheck(probe: LiveCombatProbe): Promise<void> {
  await probe.test('LIVE-3 — Multiple hits in a row deplete HP', async () => {
    await probe.page.evaluate(() => {
      window.__state.entities = window.__state.entities.filter(e => !e.id?.startsWith('live-test'));
      const p = window.__state.player;
      p.hp = 40;
      p.invuln = 0;
      p.monsterForm = false;
      p.corruption = 0;
      p.corruptionHitCooldown = 0;
      p.corruptionChoicePending = false;
      for (let i = 0; i < 3; i += 1) {
        window.__state.entities.push({
          kind: 'monster', species: 'wolf', name: `狼${i}`,
          x: p.x + 0.1 + i * 0.05, y: p.y,
          hp: 999, maxHp: 999, atk: 4, alive: true, faction: 'monster',
          cooldown: 0, region: 'forest', r: 12, speed: 0,
          ownerId: 'world', id: `live-test-pack-${i}`
        });
      }
    });
    await probe.page.waitForTimeout(2500);
    const hp = await probe.page.evaluate(() => window.__state.player.hp);
    if (hp < 38) probe.ok(`HP 40 → ${hp} after 2.5s under attack`);
    else probe.fail(`HP only dropped to ${hp} (expected < 38)`);
  });
}

export async function runDeathTransitionCheck(probe: LiveCombatProbe): Promise<void> {
  await probe.test('LIVE-4 — Player at low HP killed → corruption then respawn or choice', async () => {
    await probe.page.evaluate(() => {
      window.__state.entities = window.__state.entities.filter(e => !e.id?.startsWith('live-test'));
      const p = window.__state.player;
      p.hp = 5;
      p.invuln = 0;
      p.maxHp = 42;
      p.monsterForm = false;
      p.corruption = 0;
      p.corruptionHitCooldown = 0;
      p.corruptionChoicePending = false;
      p.gear = { weapon: 'trainingSword', head: null, body: null, legs: null, feet: null, accessory: null };
      p.gearMods = {};
      window.__state.entities.push({
        kind: 'monster', species: 'wolf', name: '杀手狼',
        x: p.x + 0.1, y: p.y,
        hp: 999, maxHp: 999, atk: 99, alive: true, faction: 'monster',
        cooldown: 0, region: 'forest', r: 12, speed: 0,
        ownerId: 'world', id: 'live-test-killer'
      });
    });
    await probe.page.waitForTimeout(1500);
    const s = await probe.page.evaluate(() => ({
      hp: window.__state.player.hp,
      mf: window.__state.player.monsterForm,
      scene: window.__state.scene
    }));
    if (s.mf === true && s.hp > 5) probe.ok(`died → monsterForm hp=${s.hp}`);
    else if (s.hp > 5) probe.ok(`died → respawned hp=${s.hp} scene=${s.scene}`);
    else probe.fail(`stuck at low HP: hp=${s.hp} mf=${s.mf}`);
  });
}

export async function runLiveCombatChecks(probe: LiveCombatProbe): Promise<void> {
  await runAdjacentWolfDamageCheck(probe);
  await runEnemyApproachCheck(probe);
  await runRepeatedHitCheck(probe);
  await runDeathTransitionCheck(probe);
}
