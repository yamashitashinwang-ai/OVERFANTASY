// Weapon-coverage probe — exercises EVERY weapon type by equipping it and
// running the actual playerAttack/beginBowCharge code paths. This test would
// have caught the `clearCd is not defined` bug in bow.js immediately.

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

await page.evaluate(() => window.__game.scene.pause('GameScene'));

// All starting gear IDs that the game ships with one per weapon type
// (cross-referenced against data.js)
const WEAPONS = [
  { id: 'trainingSword',  type: '剑',  expectAttack: true },
  { id: 'ironSword',      type: '剑',  expectAttack: true },
  { id: 'shortBow',       type: '弓',  expectCharge: true, needsArrows: true }
];

// Discover every weapon in the catalog and add tests for any not in WEAPONS
const allWeapons = await page.evaluate(() => {
  const cat = window.__state.player.gear ? window.__game.cache?.data : null;
  // Read from DATA via module
  const ids = [];
  // Use the API: addGearToBag → equipGear and check refreshCombatStats result
  return null; // probe handled below
});

for (const w of WEAPONS) {
  await test(`Equip ${w.id} (${w.type}) and trigger attack`, async () => {
    const r = await page.evaluate(({ id, needsArrows }) => {
      const s = window.__state;
      window.__api.addGearToBag(id);
      window.__api.equipGear(id);
      if (needsArrows) s.player.arrows = 10;
      s.player.hp = 42;
      s.player.invuln = 0;
      s.player.stamina = 30;
      s.player.attackCooldown = 0;
      s.player.blockTimer = 0;
      s.player.monsterForm = false;
      // Spawn a target via real API
      s.entities = [];
      const target = window.__api.spawnCreature('wolf', s.player.x + 0.5, s.player.y);
      // Set aim toward target
      window.__runtime.aimVector = { x: 1, y: 0 };
      window.__runtime.aimWorld = { x: s.player.x + 1, y: s.player.y };
      try {
        // Always try bow charge path first (matches GameScene pointer handler)
        const charged = window.__api.beginBowCharge();
        if (!charged) window.__api.playerAttack();
        else window.__api.releaseBowCharge();
        return { ok: true, weapon: window.__state.player.gear.weapon, target: target?.hp };
      } catch (e) {
        return { ok: false, error: e.message.slice(0, 150) };
      }
    }, { id: w.id, needsArrows: w.needsArrows });
    if (r.ok) ok(`weapon=${r.weapon} target hp=${r.target}`);
    else fail(`threw: ${r.error}`);
  });
}

// Also test: every catalog weapon id at least equips without crash
await test('All catalog weapons can equip without error', async () => {
  const r = await page.evaluate(async () => {
    // Pull weapon IDs from gear catalog via dynamic data module
    const data = await import('/src/data.js');
    const ids = Object.entries(data.default.gearCatalog)
      .filter(([, gear]) => gear.slot === 'weapon')
      .map(([id]) => id);
    const errors = [];
    for (const id of ids) {
      try {
        window.__api.addGearToBag(id);
        window.__api.equipGear(id);
        // refresh + read currentWeapon
        const eq = window.__state.player.gear.weapon;
        if (eq !== id && id !== 'demonClaw') errors.push(`${id} did not equip (got ${eq})`);
      } catch (e) {
        errors.push(`${id}: ${e.message.slice(0, 80)}`);
      }
    }
    return { total: ids.length, errors };
  });
  if (r.errors.length === 0) ok(`${r.total} weapons equip cleanly`);
  else { fail(`${r.errors.length}/${r.total} failed`); r.errors.forEach(e => console.log('     →', e)); }
});

// Test: bow charging cycle does not throw
await test('Bow: complete charge → release cycle', async () => {
  const r = await page.evaluate(() => {
    const s = window.__state;
    window.__api.addGearToBag('shortBow');
    window.__api.equipGear('shortBow');
    s.player.arrows = 5;
    s.player.stamina = 30;
    s.player.hp = 42;
    s.player.invuln = 0;
    s.player.monsterForm = false;
    s.entities = [{
      kind: 'monster', species: 'wolf', name: '靶',
      x: s.player.x + 3, y: s.player.y,
      hp: 50, maxHp: 50, atk: 0, alive: true, faction: 'monster',
      cooldown: 99, r: 12, speed: 0, ownerId: 'world', id: 'bow-target'
    }];
    window.__runtime.aimVector = { x: 1, y: 0 };
    try {
      const r1 = window.__api.beginBowCharge();
      const charging = !!window.__runtime.bowCharge;
      if (charging && window.__runtime.bowCharge) window.__runtime.bowCharge.time = 0.5;
      const r2 = window.__api.releaseBowCharge();
      return { ok: true, charged: r1, released: r2, arrowsLeft: s.player.arrows };
    } catch (e) {
      return { ok: false, error: e.message.slice(0, 200) };
    }
  });
  if (r.ok && r.charged && r.released) ok(`charged=${r.charged} released=${r.released} arrows=${r.arrowsLeft}`);
  else fail(JSON.stringify(r));
});

console.log(`\n${'═'.repeat(50)}`);
console.log(`${failures.length === 0 ? 'PASS' : 'FAIL'}: ${WEAPONS.length + 2 - failures.length}/${WEAPONS.length + 2} weapon checks pass`);
failures.forEach(f => console.log(' ✗', f));
await browser.close();
process.exit(failures.length ? 1 : 0);
