import type { DeepProbe } from './harness.ts';

export async function runWorldAndCombatChecks(probe: DeepProbe) {
  const { page, step, ok, fail } = probe;

  await step('enterDungeon → leaveDungeon', async () => {
    await page.evaluate(() => window.__api.enterDungeon());
    const m1 = await page.evaluate(() => window.__state.mode);
    await page.evaluate(() => window.__api.leaveDungeon());
    const m2 = await page.evaluate(() => window.__state.mode);
    if (m1 === 'dungeon' && m2 === 'world') ok(`${m1} → ${m2}`); else fail(`${m1} → ${m2}`);
  });

  await step('defeatEntity marks entity dead', async () => {
    await page.evaluate(() => {
      const p = window.__state.player;
      window.__state.entities.push({
        kind: 'monster', species: 'wolf', x: p.x, y: p.y, hp: 1, maxHp: 1,
        r: 12, alive: true, faction: 'monster', name: '小魔狼',
        playerAggro: 100, ownerId: 'test', id: 'test-mob'
      });
    });
    await page.evaluate(() => {
      const mob = window.__state.entities.find(e => e.id === 'test-mob');
      window.__api.defeatEntity(mob);
    });
    const alive = await page.evaluate(() => window.__state.entities.find(e => e.id === 'test-mob')?.alive);
    if (alive === false) ok('marked dead'); else fail(`alive=${alive}`);
  });

  await step('chatWithNpc adjusts memory (after game time elapses)', async () => {
    await page.evaluate(() => {
      window.__state.time = 100;
      const p = window.__state.player;
      window.__state.entities.push({
        kind: 'friendly', name: '测试村民', x: p.x + 0.3, y: p.y,
        hp: 10, maxHp: 10, r: 12, alive: true, ownerId: 'world',
        id: 'test-npc', relationId: '测试村民'
      });
    });
    await page.evaluate(() => {
      const n = window.__state.entities.find(e => e.id === 'test-npc');
      window.__api.chatWithNpc(n, 'hello');
    });
    const mem = await page.evaluate(() => window.__state.npcMemoryByPlayer?.[window.__state.player.id]?.['测试村民']);
    if (mem) ok(`memory: ${JSON.stringify(mem).slice(0, 80)}`); else fail('no memory recorded');
  });

  await step('damagePlayer reduces HP', async () => {
    await page.evaluate(() => {
      window.__state.player.hp = 42;
      window.__state.player.invuln = 0;
      window.__state.player.blockTimer = 0;
    });
    await page.evaluate(() => window.__api.damagePlayer(7, { source: 'test' }));
    const hp = await page.evaluate(() => window.__state.player.hp);
    if (hp < 42) ok(`HP 42 → ${hp}`); else fail(`HP=${hp}`);
  });
}
