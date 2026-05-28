import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', e => errors.push(`PAGE: ${e.message.slice(0, 240)}`));
page.on('console', m => { if (m.type() === 'error') errors.push(`CON: ${m.text().slice(0, 240)}`); });

const log = (...a) => console.log(...a);
const failures = [];
const fail = (m) => { console.log('  ✗', m); failures.push(m); };
const ok = (m) => console.log('  ✓', m);

async function step(label, fn) {
  errors.length = 0;
  log('\n▶', label);
  try { await fn(); } catch (e) { fail(`${label} threw: ${e.message.slice(0, 200)}`); }
  if (errors.length) {
    fail(`${label}: ${errors.length} errors`);
    errors.slice(0, 2).forEach(e => log('     →', e));
  }
}

await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.evaluate(() => document.querySelector('[data-menu-action="new"]')?.click());
await page.waitForTimeout(300);
await page.evaluate(() => document.querySelector('[data-menu-action="startRace"][data-race="人类"]')?.click());
await page.waitForTimeout(2000);

for (let i = 0; i < 30; i++) {
  if (await page.evaluate(() => !!window.__api)) break;
  await page.waitForTimeout(100);
}
const hasApi = await page.evaluate(() => !!window.__api);
log(hasApi ? '✓ domain API loaded' : '✗ domain API missing');

// Place a shop + forge object near the player for shop/forge tests
await page.evaluate(() => {
  const p = window.__state.player;
  window.__api.addObject('shop', '测试商店', Math.floor(p.x), Math.floor(p.y), 2, 2, '#8fa0b2', 'shop');
  window.__api.addObject('forge', '测试锻造台', Math.floor(p.x) + 2, Math.floor(p.y), 2, 2, '#cc9966', 'forge');
});

await step('addMaterial("魔狼牙", 3)', async () => {
  await page.evaluate(() => { window.__state.player.materials = {}; });
  await page.evaluate(() => window.__api.addMaterial('魔狼牙', 3));
  const m = await page.evaluate(() => window.__state.player.materials['魔狼牙']);
  if (m === 3) ok(`materials=${m}`); else fail(`got ${m}`);
});

await step('addResource("木材", 5) → wood', async () => {
  await page.evaluate(() => { window.__state.player.resources = {}; window.__state.player.wood = 0; });
  await page.evaluate(() => window.__api.addResource('木材', 5));
  const wood = await page.evaluate(() => window.__state.player.wood);
  if (wood === 5) ok(`wood=${wood}`); else fail(`got ${wood}`);
});

await step('forgeRing — needs 1 wood + 1 stone', async () => {
  await page.evaluate(() => {
    window.__state.player.resources = {};
    window.__api.addResource('木材', 5);
    window.__api.addResource('反重力石', 5);
    window.__state.player.rings = 0;
  });
  // forgeRing has 38% failure chance, try multiple times
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.__api.forgeRing());
    const r = await page.evaluate(() => window.__state.player.rings);
    if (r > 0) { ok(`rings=${r} after ${i+1} attempts`); return; }
  }
  fail('forgeRing never succeeded in 10 attempts');
});

await step('buyPotion (near shop)', async () => {
  await page.evaluate(() => { window.__state.player.gold = 100; window.__state.player.potions = 0; });
  await page.evaluate(() => window.__api.buyPotion());
  const s = await page.evaluate(() => ({ gold: window.__state.player.gold, potions: window.__state.player.potions }));
  if (s.gold === 92 && s.potions === 1) ok(`gold=${s.gold} potions=${s.potions}`);
  else fail(`gold=${s.gold} potions=${s.potions}`);
});

await step('buyArrows(5)', async () => {
  await page.evaluate(() => { window.__state.player.gold = 100; window.__state.player.arrows = 0; });
  await page.evaluate(() => window.__api.buyArrows(5));
  const s = await page.evaluate(() => ({ gold: window.__state.player.gold, arrows: window.__state.player.arrows }));
  if (s.arrows === 5 && s.gold === 95) ok(`gold=${s.gold} arrows=${s.arrows}`);
  else fail(`gold=${s.gold} arrows=${s.arrows}`);
});

await step('sellMaterial("魔狼牙", 3) — 9G/each', async () => {
  await page.evaluate(() => {
    window.__state.player.materials = { '魔狼牙': 5 };
    window.__state.player.gold = 0;
  });
  const got = await page.evaluate(() => window.__api.sellMaterial('魔狼牙', 3));
  const s = await page.evaluate(() => ({ count: window.__state.player.materials['魔狼牙'] || 0, gold: window.__state.player.gold }));
  if (got === 27 && s.count === 2) ok(`sold ${got}G, left=${s.count}`);
  else fail(`sold ${got}G, left=${s.count}`);
});

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
    window.__state.time = 100; // skip lastTalk freshness gate
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

log(`\n=== ${failures.length === 0 ? 'PASS' : 'FAIL'}: ${failures.length} failures ===`);
failures.forEach(f => log(' -', f));
await browser.close();
process.exit(failures.length ? 1 : 0);
