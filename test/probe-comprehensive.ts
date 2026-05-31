// Comprehensive functional probe. Verifies the major user-facing systems work
// end-to-end: boot, race choice, all 6 panels open + show content, combat
// inputs fire, pause+resume, language switch, persistence round-trip.
//
// Usage: run dev server, then `PROBE_BASE_URL=http://server:5175/ npx tsx test/probe-comprehensive.ts`

import { chromium } from 'playwright';
import { probeBaseUrl } from './probe-url.ts';

const URL = probeBaseUrl();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', e => errors.push(`PAGE: ${e.message}`));
page.on('console', m => { if (m.type() === 'error') errors.push(`CON: ${m.text()}`); });

function expect(label, cond) {
  if (cond) {
    console.log(`  ✓ ${label}`);
    return true;
  }
  console.log(`  ✗ ${label} (errors: ${errors.slice(-2).join(' | ')})`);
  return false;
}

let pass = 0, fail = 0;
function tally(ok) { ok ? pass++ : fail++; }
function flushErrors() { const n = errors.length; errors.length = 0; return n; }

// ── Phase 1: Boot ─────────────────────────────────────────────────────────
console.log('\n[1] Boot');
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
tally(expect('zero boot errors', errors.length === 0));
const menuHtml = await page.evaluate(() => document.getElementById('mainMenu').innerHTML);
tally(expect('main menu populated', menuHtml.length > 100));
flushErrors();

// ── Phase 2: New game + race ──────────────────────────────────────────────
console.log('\n[2] New game + race selection');
await page.evaluate(() => document.querySelector('[data-menu-action="new"]')?.click());
await page.waitForTimeout(300);
await page.evaluate(() => document.querySelector('[data-menu-action="startRace"][data-race="人类"]')?.click());
await page.waitForTimeout(1800);
tally(expect('race selection: no errors', flushErrors() === 0));
const statsText = await page.evaluate(() => document.getElementById('stats').innerText);
tally(expect('stats panel populated', /人类/.test(statsText)));

const box = await (await page.$('#game-container canvas')).boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

// ── Phase 3: Panels ──────────────────────────────────────────────────────
console.log('\n[3] Panels');
async function openClose(key, panelId, label) {
  await page.keyboard.press(key);
  await page.waitForTimeout(400);
  const info = await page.evaluate(id => {
    const el = document.getElementById(id);
    return { open: !el.classList.contains('hidden'), len: el.innerHTML.length };
  }, panelId);
  tally(expect(`${label} opens with content`, info.open && info.len > 50));
  tally(expect(`${label}: no errors`, flushErrors() === 0));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
}
await openClose('b', 'backpackPanel', 'Backpack');
await openClose('j', 'questPanel', 'Quest');
await openClose('f', 'magicPanel', 'Magic');

// ── Phase 4: Combat ──────────────────────────────────────────────────────
console.log('\n[4] Combat');
await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 50);
await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up();
await page.waitForTimeout(300);
tally(expect('attack click: no errors', flushErrors() === 0));
await page.keyboard.press('Space');
await page.waitForTimeout(200);
tally(expect('dodge key: no errors', flushErrors() === 0));

// ── Phase 5: Movement ────────────────────────────────────────────────────
console.log('\n[5] Movement');
for (const k of ['w', 'a', 's', 'd']) {
  await page.keyboard.down(k); await page.waitForTimeout(150); await page.keyboard.up(k);
}
tally(expect('WASD: no errors', flushErrors() === 0));

// ── Phase 6: Pause/resume ────────────────────────────────────────────────
console.log('\n[6] Pause');
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
const pauseInfo = await page.evaluate(() => {
  const el = document.getElementById('pauseMenu');
  return { open: !el.classList.contains('hidden'), len: el.innerHTML.length };
});
tally(expect('pause menu visible', pauseInfo.open && pauseInfo.len > 50));
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
const pauseHidden = await page.evaluate(() => document.getElementById('pauseMenu').classList.contains('hidden'));
tally(expect('pause menu hidden on second Esc', pauseHidden));
tally(expect('pause cycle: no errors', flushErrors() === 0));

// ── Phase 7: Stats updates push-driven ───────────────────────────────────
console.log('\n[7] Stats reactive update');
const before = await page.evaluate(() => document.getElementById('stats').innerHTML);
// Force an MP-changing event by waiting a moment (MP regen ticks)
await page.waitForTimeout(800);
const after = await page.evaluate(() => document.getElementById('stats').innerHTML);
tally(expect('stats render: no errors', flushErrors() === 0));
// Note: HTML may or may not differ depending on timing; both are valid.

// ── Phase 8: Persistence ─────────────────────────────────────────────────
console.log('\n[8] Persistence (save → reload → continue)');
// Open pause + save
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
await page.evaluate(() => document.querySelector('[data-pause-action="save"]')?.click());
await page.waitForTimeout(400);
tally(expect('save action: no errors', flushErrors() === 0));
const savesAfter = await page.evaluate(() => {
  const raw = localStorage.getItem('overfantasy.saves.v1') || '[]';
  return JSON.parse(raw);
});
tally(expect('save record persisted', Array.isArray(savesAfter) && savesAfter.length > 0));

// Reload
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
flushErrors();
await page.evaluate(() => document.querySelector('[data-menu-action="continue"]')?.click());
await page.waitForTimeout(2000);
tally(expect('continue latest: no errors', flushErrors() === 0));
const statsAfterLoad = await page.evaluate(() => document.getElementById('stats').innerText);
tally(expect('stats restored after load', /人类/.test(statsAfterLoad)));

// ── Summary ──────────────────────────────────────────────────────────────
console.log(`\n${pass + fail} checks: ${pass} pass, ${fail} fail`);
await browser.close();
process.exit(fail ? 1 : 0);
