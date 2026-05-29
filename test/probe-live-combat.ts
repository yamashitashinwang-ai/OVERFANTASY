// Live combat probe — plays the game normally (no scene pause) and verifies
// the user-named scenarios actually work end-to-end:
//   1. Enemy AI movement (enemies move closer over real frames)
//   2. Damage dealt to player (enemy reaches player → HP drops)
//   3. Collision damage (touching enemy reduces HP via AI loop)
//
// This is the "play the game and check" test the user asked for.

import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', e => errors.push(`PAGE: ${e.message.slice(0, 240)}`));
page.on('console', m => { if (m.type() === 'error') errors.push(`CON: ${m.text().slice(0, 240)}`); });

const failures = [];
const ok = (m) => console.log('  ✓', m);
const fail = (m) => { console.log('  ✗', m); failures.push(m); };

async function test(label, fn) {
  errors.length = 0;
  console.log('\n▶', label);
  try { await fn(); } catch (e) { fail(`${label} threw: ${e.message.slice(0, 200)}`); }
  if (errors.length) {
    fail(`${label}: ${errors.length} errors`);
    errors.slice(0, 2).forEach(e => console.log('     →', e));
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

const box = await (await page.$('#game-container canvas')).boundingBox();
await page.mouse.move(box.x + box.width/2, box.y + box.height/2);

// ─── LIVE-1: Spawn a wolf via real API, let it damage player ──────────────
await test('LIVE-1 — spawnCreature wolf adjacent damages player in real frames', async () => {
  await page.evaluate(() => {
    // Use the REAL spawn API so the entity has every template field + display + physics body.
    const p = window.__state.player;
    p.hp = 42;
    p.invuln = 0;
    window.__api.spawnCreature('wolf', p.x + 1.5, p.y, { region: 'forest' });
  });
  await page.waitForTimeout(2500);
  const hp = await page.evaluate(() => window.__state.player.hp);
  if (hp < 42) ok(`HP 42 → ${hp} after 2.5s exposure`);
  else fail(`HP unchanged: ${hp}`);
});

// ─── LIVE-2: Enemy AI moves toward player over real frames ────────────────
await test('LIVE-2 — Enemy at distance walks toward player', async () => {
  await page.evaluate(() => {
    // remove previous test wolf
    window.__state.entities = window.__state.entities.filter(e => e.id !== 'live-test-wolf');
    const p = window.__state.player;
    p.invuln = 1.5; // give player invuln so no damage interferes
    window.__state.entities.push({
      kind: 'monster', species: 'wolf', name: '远狼',
      x: p.x + 6, y: p.y,
      hp: 999, maxHp: 999, atk: 3, alive: true, faction: 'monster',
      cooldown: 99, region: 'forest', r: 12, speed: 2.5,
      ownerId: 'world', id: 'live-test-wolf-2'
    });
  });
  const x0 = await page.evaluate(() => window.__state.entities.find(e => e.id === 'live-test-wolf-2').x);
  await page.waitForTimeout(1500);
  const x1 = await page.evaluate(() => window.__state.entities.find(e => e.id === 'live-test-wolf-2').x);
  if (x1 < x0 - 0.5) ok(`wolf x ${x0.toFixed(2)} → ${x1.toFixed(2)} (closed ${(x0-x1).toFixed(2)})`);
  else fail(`wolf did not approach: ${x0.toFixed(2)} → ${x1.toFixed(2)}`);
});

// ─── LIVE-3: Real combat — defeated player loses HP ───────────────────────
await test('LIVE-3 — Multiple hits in a row deplete HP', async () => {
  await page.evaluate(() => {
    window.__state.entities = window.__state.entities.filter(e => !e.id?.startsWith('live-test'));
    const p = window.__state.player;
    p.hp = 40;
    p.invuln = 0;
    p.monsterForm = false;
    p.corruption = 0;
    p.corruptionHitCooldown = 0;
    p.corruptionChoicePending = false;
    // Place several wolves stacked on top of player
    for (let i = 0; i < 3; i++) {
      window.__state.entities.push({
        kind: 'monster', species: 'wolf', name: `狼${i}`,
        x: p.x + 0.1 + i * 0.05, y: p.y,
        hp: 999, maxHp: 999, atk: 4, alive: true, faction: 'monster',
        cooldown: 0, region: 'forest', r: 12, speed: 0,
        ownerId: 'world', id: `live-test-pack-${i}`
      });
    }
  });
  await page.waitForTimeout(2500);
  const hp = await page.evaluate(() => window.__state.player.hp);
  // Should take multiple hits over 2.5s. With invuln 0.65s, at most ~4 hits.
  if (hp < 38) ok(`HP 40 → ${hp} after 2.5s under attack`);
  else fail(`HP only dropped to ${hp} (expected < 38)`);
});

// ─── LIVE-4: Death transitions cleanly after corruption is applied ────────
await test('LIVE-4 — Player at low HP killed → corruption then respawn or choice', async () => {
  await page.evaluate(() => {
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
  await page.waitForTimeout(1500);
  const s = await page.evaluate(() => ({
    hp: window.__state.player.hp,
    mf: window.__state.player.monsterForm,
    scene: window.__state.scene
  }));
  if (s.mf === true && s.hp > 5) ok(`died → monsterForm hp=${s.hp}`);
  else if (s.hp > 5) ok(`died → respawned hp=${s.hp} scene=${s.scene}`);
  else fail(`stuck at low HP: hp=${s.hp} mf=${s.mf}`);
});

// ─── Cleanup test wolves ──────────────────────────────────────────────────
await page.evaluate(() => {
  window.__state.entities = window.__state.entities.filter(e => !e.id?.startsWith('live-test'));
  window.__state.player.hp = window.__state.player.maxHp;
  window.__state.player.monsterForm = false;
});

console.log(`\n${'═'.repeat(50)}`);
console.log(`${failures.length === 0 ? 'PASS' : 'FAIL'}: ${4 - failures.length}/4 live-play checks pass`);
failures.forEach(f => console.log(' ✗', f));

await browser.close();
process.exit(failures.length ? 1 : 0);
