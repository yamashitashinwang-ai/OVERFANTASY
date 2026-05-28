// Regression probe for the exact bug reported by the user:
//   dodge → invuln frozen at 0.34 → every enemy hit silently blocked.
// The pre-fix probe-stop-and-die.mjs missed this because it never called
// playerDodge before observing combat.

import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const violations = [];
page.on('console', m => {
  if (m.type() === 'warning' && m.text().startsWith('[invariant]')) violations.push(m.text());
});

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

// Step 1: dodge BEFORE meeting enemies → set invuln to 0.34
await page.evaluate(() => window.__api.playerDodge());
const t0 = await page.evaluate(() => window.__state.player.invuln);
console.log(`After dodge, invuln = ${t0}`);

// Step 2: wait long enough for invuln to expire (0.34s + buffer)
await page.waitForTimeout(1500);
const t1 = await page.evaluate(() => window.__state.player.invuln);
console.log(`1.5s after dodge, invuln = ${t1}  (should be 0)`);

if (t1 > 0) {
  console.log('FAIL — invuln did not tick down to 0. The dodge-invuln-stuck bug is back.');
  process.exit(1);
}

// Step 3: now teleport adjacent to a wolf and confirm damage actually lands
await page.evaluate(() => {
  const p = window.__state.player;
  const w = window.__state.entities.filter(e => e.alive && e.faction === 'monster')
    .sort((a,b) => Math.hypot(a.x-p.x,a.y-p.y) - Math.hypot(b.x-p.x,b.y-p.y))[0];
  p.x = w.x; p.y = w.y;
  window.__api.teleportBody(p);
});
const hpStart = await page.evaluate(() => window.__state.player.hp);
await page.waitForTimeout(3000);
const hpEnd = await page.evaluate(() => window.__state.player.hp);
console.log(`HP ${hpStart} → ${hpEnd} after 3s adjacent to wolf`);

const invariantBroken = violations.filter(v => v.includes('cooldown-must-tick-down') || v.includes('adjacent-monster-must-damage'));
if (invariantBroken.length > 0) {
  console.log('FAIL — invariant warnings:');
  invariantBroken.forEach(v => console.log('  ', v));
  process.exit(1);
}

if (hpEnd >= hpStart) {
  console.log('FAIL — wolf did not damage player');
  process.exit(1);
}
console.log('PASS — dodge invuln expires and combat resumes normally');
await browser.close();
