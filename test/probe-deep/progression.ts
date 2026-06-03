import type { DeepProbe } from './harness.ts';

export async function runProgressionChecks(probe: DeepProbe) {
  const { page, step, ok, fail } = probe;

  await step('addGearToBag + equipGear', async () => {
    await page.evaluate(() => window.__api.addGearToBag('ironSword'));
    await page.evaluate(() => window.__api.equipGear('ironSword'));
    const eq = await page.evaluate(() => window.__state.player.gear.weapon);
    if (eq === 'ironSword') ok(`equipped: ${eq}`); else fail(`weapon=${eq}`);
  });

  await step('learnMagicFromInput (with clue)', async () => {
    await page.evaluate(() => {
      window.__api.addMagicClue('fireball');
      window.__state.player.magicKnown = [];
    });
    await page.evaluate(() => window.__api.learnMagicFromInput('fireball'));
    const known = await page.evaluate(() => window.__state.player.magicKnown);
    if (known.includes('fireball')) ok(`learned: ${known.join(',')}`);
    else fail(`known=${JSON.stringify(known)}`);
  });

  await step('beginMagicCast sets pendingMagicCast', async () => {
    await page.evaluate(() => {
      window.__state.player.mp = 50;
      if (!window.__state.player.magicKnown.includes('fireball')) window.__state.player.magicKnown.push('fireball');
      window.__runtime.pendingMagicCast = null;
    });
    await page.evaluate(() => window.__api.beginMagicCast('fireball'));
    const pending = await page.evaluate(() => window.__runtime.pendingMagicCast);
    if (pending) ok(`pending: ${pending.spellId}`); else fail('no pending cast');
  });

  await step('acceptMajorQuest("major_wolf_hunt")', async () => {
    await page.evaluate(() => { window.__state.quests = { major: null, small: [] }; });
    await page.evaluate(() => window.__api.acceptMajorQuest('major_wolf_hunt'));
    const q = await page.evaluate(() => window.__state.quests.major);
    if (q && q.id === 'major_wolf_hunt') ok(`major: ${q.name}`);
    else fail(`major=${JSON.stringify(q)?.slice(0, 100)}`);
  });
}
