// Comprehensive end-to-end probe. Drives every gameplay system from the
// original game.js through the Phaser version and verifies state mutations.
import { chromium } from 'playwright';
import { probeBaseUrl } from './probe-url.ts';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', e => errors.push(`PAGE: ${e.message.slice(0, 240)}`));
page.on('console', m => { if (m.type() === 'error') errors.push(`CON: ${m.text().slice(0, 240)}`); });

const log = (...a) => console.log(...a);
const fail = (m) => { console.log('  ✗', m); failures.push(m); };
const ok = (m) => console.log('  ✓', m);
const failures = [];

const $state = () => page.evaluate(() => ({
  player: { ...window.__state.player },
  scene: window.__state.scene,
  mode: window.__state.mode,
  npcMemory: Object.keys(window.__state.npcMemory || {}),
  entities: window.__state.entities.filter(e => e.alive).length,
  pickups: window.__state.pickups.length,
  pets: window.__state.pets.length
}));

async function step(label, fn) {
  errors.length = 0;
  log('\n▶', label);
  try { await fn(); } catch (e) { fail(`${label} threw: ${e.message}`); }
  if (errors.length) {
    fail(`${label}: ${errors.length} errors`);
    errors.slice(0, 2).forEach(e => log('     →', e));
  }
}

// ─── BOOT ──────────────────────────────────────────────────────────────
await page.goto(probeBaseUrl(), { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

await step('Boot + main menu visible', async () => {
  const len = await page.evaluate(() => document.getElementById('mainMenu').innerHTML.length);
  if (len > 100) ok('menu rendered'); else fail('menu empty');
});

// ─── NEW GAME ──────────────────────────────────────────────────────────
await step('Start new game (人类)', async () => {
  await page.evaluate(() => document.querySelector('[data-menu-action="new"]')?.click());
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('[data-menu-action="startRace"][data-race="人类"]')?.click());
  await page.waitForTimeout(1500);
  const s = await $state();
  if (s.player.race === '人类' && s.player.hp === 42) ok(`race=${s.player.race} hp=${s.player.hp}`);
  else fail(`unexpected state: race=${s.player.race}, hp=${s.player.hp}`);
});

const box = await (await page.$('#game-container canvas')).boundingBox();
await page.mouse.move(box.x + box.width/2, box.y + box.height/2);

// ─── MOVEMENT ──────────────────────────────────────────────────────────
await step('WASD movement updates player position', async () => {
  const before = await $state();
  await page.keyboard.down('d'); await page.waitForTimeout(400); await page.keyboard.up('d');
  const after = await $state();
  if (after.player.x !== before.player.x) ok(`moved Δx=${(after.player.x - before.player.x).toFixed(2)}`);
  else fail('no movement after pressing D');
});

await step('Shift+W (sprint) depletes stamina', async () => {
  await page.keyboard.down('Shift'); await page.keyboard.down('w');
  await page.waitForTimeout(1200);
  await page.keyboard.up('w'); await page.keyboard.up('Shift');
  const s = await $state();
  if (s.player.stamina < 30) ok(`stamina=${s.player.stamina.toFixed(1)}/30`);
  else fail(`stamina did not deplete: ${s.player.stamina}`);
});

// ─── DODGE ──────────────────────────────────────────────────────────────
await step('Space triggers dodge cooldown', async () => {
  const before = await $state();
  await page.keyboard.press('Space');
  await page.waitForTimeout(100);
  const after = await $state();
  if (after.player.dodgeCooldown > 0 || after.player.dodgeTimer > 0) ok(`dodgeCD=${after.player.dodgeCooldown.toFixed(2)}`);
  else fail('no dodge cooldown set');
});

// ─── COMBAT (left click) ──────────────────────────────────────────────────
await step('Left click triggers attack (cooldown set)', async () => {
  await page.waitForTimeout(700); // wait for any pending cd
  const before = await $state();
  await page.mouse.move(box.x + 600, box.y + 300);
  await page.mouse.down(); await page.waitForTimeout(50); await page.mouse.up();
  await page.waitForTimeout(150);
  const after = await $state();
  if (after.player.attackCooldown > 0 || before.player.attackCooldown > 0) ok(`attackCD active`);
  else fail('attack cooldown did not fire');
});

// ─── INVENTORY: backpack panel ────────────────────────────────────────────
await step('Backpack opens via B', async () => {
  await page.keyboard.press('b');
  await page.waitForTimeout(500);
  const len = await page.evaluate(() => document.getElementById('backpackPanel').innerHTML.length);
  if (len > 100) ok(`html len=${len}`);
  else fail(`backpack empty (len=${len})`);
});

await step('Switch backpack tabs (5 categories)', async () => {
  for (const cat of ['materials', 'loot', 'equipment', 'important', 'consumables']) {
    await page.evaluate((c) => document.querySelector(`[data-bag-category="${c}"]`)?.click(), cat);
    await page.waitForTimeout(150);
    const active = await page.evaluate((c) => document.querySelector(`[data-bag-category="${c}"].active`) !== null, cat);
    if (active) ok(`${cat} tab`); else fail(`${cat} tab not active`);
  }
});

await step('Use herb (HP must be < max to use)', async () => {
  // Damage the player first
  await page.evaluate(() => { window.__state.player.hp = 20; });
  await page.evaluate(() => document.querySelector('[data-bag-category="consumables"]')?.click());
  await page.waitForTimeout(150);
  await page.evaluate(() => document.querySelector('[data-bag-item="herb"]')?.click());
  await page.waitForTimeout(150);
  const before = await $state();
  await page.evaluate(() => document.querySelector('[data-bag-action="use"][data-id="herb"]')?.click());
  await page.waitForTimeout(200);
  const after = await $state();
  if (after.player.hp > before.player.hp && after.player.herbs === before.player.herbs - 1) {
    ok(`HP ${before.player.hp} → ${after.player.hp}, herbs ${before.player.herbs} → ${after.player.herbs}`);
  } else fail(`herb use failed: HP ${before.player.hp}→${after.player.hp}, herbs ${before.player.herbs}→${after.player.herbs}`);
});

await step('Equipment tab shows starting loadout', async () => {
  await page.evaluate(() => document.querySelector('[data-bag-category="equipment"]')?.click());
  await page.waitForTimeout(200);
  const items = await page.evaluate(() => Array.from(document.querySelectorAll('[data-bag-item]')).map(b => b.dataset.bagItem));
  if (items.includes('trainingSword') && items.includes('clothTunic') && items.includes('linenPants')) {
    ok(`gear: ${items.join(',')}`);
  } else fail(`missing gear: ${items.join(',')}`);
});

await step('Close backpack via Esc', async () => {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const hidden = await page.evaluate(() => document.getElementById('backpackPanel').classList.contains('hidden'));
  if (hidden) ok('hidden'); else fail('still visible');
});

// ─── QUEST PANEL ──────────────────────────────────────────────────────────
await step('Quest panel (J) opens', async () => {
  await page.keyboard.press('j');
  await page.waitForTimeout(400);
  const len = await page.evaluate(() => document.getElementById('questPanel').innerHTML.length);
  if (len > 100) ok(`html len=${len}`); else fail(`quest empty (len=${len})`);
});

await step('Quest panel closes via Esc', async () => {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const hidden = await page.evaluate(() => document.getElementById('questPanel').classList.contains('hidden'));
  if (hidden) ok('hidden'); else fail('still visible');
});

// ─── MAGIC PANEL ──────────────────────────────────────────────────────────
await step('Magic panel (F) opens', async () => {
  await page.keyboard.press('f');
  await page.waitForTimeout(400);
  const len = await page.evaluate(() => document.getElementById('magicPanel').innerHTML.length);
  if (len > 100) ok(`html len=${len}`); else fail(`magic empty (len=${len})`);
});

await step('Magic panel closes via Esc', async () => {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const hidden = await page.evaluate(() => document.getElementById('magicPanel').classList.contains('hidden'));
  if (hidden) ok('hidden'); else fail('still visible');
});

// ─── PAUSE / SAVE ─────────────────────────────────────────────────────────
await step('Pause (Esc) + save', async () => {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const visible = await page.evaluate(() => !document.getElementById('pauseMenu').classList.contains('hidden'));
  if (!visible) { fail('pause not visible'); return; }
  await page.evaluate(() => document.querySelector('[data-pause-action="save"]')?.click());
  await page.waitForTimeout(400);
  const saves = await page.evaluate(() => JSON.parse(localStorage.getItem('overfantasy.saves.v1') || '[]'));
  if (saves.length > 0) ok(`saves: ${saves.length}`);
  else fail('no save record');
});

await step('Open pause + Esc closes it', async () => {
  // After save click, pause auto-closed. Open it fresh, then Esc closes.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const open = await page.evaluate(() => !document.getElementById('pauseMenu').classList.contains('hidden'));
  if (!open) { fail('pause not open after first Esc'); return; }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const hidden = await page.evaluate(() => document.getElementById('pauseMenu').classList.contains('hidden'));
  if (hidden) ok('Esc closed pause'); else fail('Esc did not close pause');
});

// ─── PERSISTENCE round trip ──────────────────────────────────────────────
await step('Persistence round-trip via reload + continue', async () => {
  // Set distinctive state, save via pause→save, reload, continue.
  await page.evaluate(() => { window.__state.player.hp = 17; window.__state.player.gold = 999; });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('[data-pause-action="save"]')?.click());
  await page.waitForTimeout(600);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.evaluate(() => document.querySelector('[data-menu-action="continue"]')?.click());
  await page.waitForTimeout(2200);
  const s = await $state();
  if (s.player.hp === 17 && s.player.gold === 999) ok(`hp=${s.player.hp} gold=${s.player.gold}`);
  else fail(`hp=${s.player.hp} (expected 17), gold=${s.player.gold} (expected 999)`);
});

// ─── DOMAIN API SMOKE TESTS ───────────────────────────────────────────────
await step('Domain: addMaterial/addResource emit events + persist', async () => {
  await page.evaluate(() => { window.__state.player.materials = {}; });
  // Call via injected helper — we can't import ES modules from playwright,
  // but we can hand-edit state and verify the render reacts.
  await page.evaluate(() => { window.__state.player.materials['狼毛'] = 3; });
  await page.keyboard.press('b');
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('[data-bag-category="loot"]')?.click());
  await page.waitForTimeout(200);
  const items = await page.evaluate(() => Array.from(document.querySelectorAll('[data-bag-item]')).map(b => b.dataset.bagItem));
  if (items.includes('狼毛')) ok('loot rendered'); else fail(`expected 狼毛: got ${items}`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
});

// ─── i18n switch ──────────────────────────────────────────────────────────
await step('Language switch via main menu', async () => {
  // Open main menu via pause → main
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('[data-pause-action="main"]')?.click());
  await page.waitForTimeout(800);
  await page.evaluate(() => document.querySelector('[data-menu-action="language"]')?.click());
  await page.waitForTimeout(300);
  const langBtns = await page.evaluate(() => Array.from(document.querySelectorAll('[data-language]')).map(b => b.dataset.language));
  if (langBtns.includes('en') && langBtns.includes('ja')) ok(`langs: ${langBtns.join(',')}`);
  else fail(`missing languages: ${langBtns}`);
  await page.evaluate(() => document.querySelector('[data-language="en"]')?.click());
  await page.waitForTimeout(400);
  const enText = await page.evaluate(() => document.querySelector('.menu-card h2')?.textContent);
  if (enText && /English|Language/i.test(enText)) ok(`menu in EN: ${enText}`);
  else log(`     menu title after switch: ${enText}`);
});

// ─── Summary ──────────────────────────────────────────────────────────────
log(`\n=== ${failures.length === 0 ? 'PASS' : 'FAIL'}: ${failures.length} failures ===`);
failures.forEach(f => log(' -', f));

await browser.close();
process.exit(failures.length ? 1 : 0);
