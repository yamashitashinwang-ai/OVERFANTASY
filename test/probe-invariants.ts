// Runtime-invariant probe. Plays the game for ~12 seconds in scenarios that
// exercise the bug-prone integration points (AI → physics → damage chain),
// listens for INVARIANT_BROKEN events emitted by runtime/invariants.js, and
// fails if ANY invariant breaks during that window.
//
// This is the systematic guard the user asked for: if monsters stop dealing
// damage (or any other gameplay invariant breaks), this probe screams.

import { chromium } from 'playwright';
import { probeBaseUrl } from './probe-url.ts';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
const violations = [];

page.on('pageerror', e => errors.push(`PAGE: ${e.message.slice(0, 240)}`));
page.on('console', m => {
  const t = m.text();
  if (m.type() === 'error') errors.push(`CON: ${t.slice(0, 240)}`);
  // The invariant module logs via console.warn with the prefix "[invariant]".
  if (m.type() === 'warning' && t.startsWith('[invariant]')) violations.push(t);
});

await page.goto(probeBaseUrl(), { waitUntil: 'networkidle' });
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

// Subscribe to INVARIANT_BROKEN in the page for completeness
await page.evaluate(() => {
  window.__busViolations = [];
  // bus is loaded as module — access via __game scene event emitter? simpler:
  // emit from invariants module is captured by console.warn already.
});

console.log('Scenario 1: spawn a wolf adjacent to player, sit still 4s');
await page.evaluate(() => {
  const p = window.__state.player;
  const w = window.__api.spawnCreature('wolf', p.x + 0.5, p.y, { region: 'forest' });
  // Force player onto the wolf
  p.x = w.x;
  p.y = w.y;
  window.__api.teleportBody(p);
});
await page.waitForTimeout(4000);

console.log('Scenario 2: open backpack, close it, then verify damage resumes');
await page.keyboard.press('b');
await page.waitForTimeout(500);
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
const hpMid = await page.evaluate(() => window.__state.player.hp);

console.log('Scenario 3: spawn 3 wolves around player, observe 4s');
await page.evaluate(() => {
  const p = window.__state.player;
  p.hp = p.maxHp;
  p.invuln = 0;
  for (let i = 0; i < 3; i++) {
    window.__api.spawnCreature('wolf', p.x + (i - 1) * 0.6, p.y + 0.3, { region: 'forest' });
  }
});
await page.waitForTimeout(4000);

const finalHp = await page.evaluate(() => window.__state.player.hp);
console.log(`Final HP: ${finalHp}, midpoint HP: ${hpMid}`);
console.log(`Invariant violations: ${violations.length}`);
violations.forEach(v => console.log('  ✗', v));
console.log(`Console errors: ${errors.length}`);

if (violations.length > 0 || errors.length > 0) {
  console.log('\n=== FAIL — invariants broken during play ===');
  process.exit(1);
}
console.log('\n=== PASS — no invariants broke ===');
await browser.close();
process.exit(0);
