// Random play-through probe — simulates a real user playing for ~30 seconds:
// walks around, attacks, opens panels at random times, casts spells. Detects
// any console error fired during normal gameplay.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
const invariantBreaks = [];
page.on('pageerror', e => errors.push(`PAGE: ${e.message.slice(0, 240)}`));
page.on('console', m => {
  const t = m.text();
  if (m.type() === 'error') errors.push(`CON: ${t.slice(0, 240)}`);
  if (m.type() === 'warning' && t.startsWith('[invariant]')) invariantBreaks.push(t);
});

await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.evaluate(() => document.querySelector('[data-menu-action="new"]')?.click());
await page.waitForTimeout(300);
await page.evaluate(() => document.querySelector('[data-menu-action="startRace"][data-race="人类"]')?.click());
await page.waitForTimeout(2000);

const box = await (await page.$('#game-container canvas')).boundingBox();
await page.mouse.move(box.x + box.width/2, box.y + box.height/2);

const moveKeys = ['w', 'a', 's', 'd'];
const actionKeys = ['e', 'g', 'r', 'b', 'j', 'f'];

const startErrors = errors.length;
const startTime = Date.now();

// Run for ~25 seconds of random play
while (Date.now() - startTime < 25000) {
  const r = Math.random();
  if (r < 0.5) {
    // Move
    const k = moveKeys[Math.floor(Math.random() * 4)];
    await page.keyboard.down(k);
    await page.waitForTimeout(80 + Math.floor(Math.random() * 200));
    await page.keyboard.up(k);
  } else if (r < 0.65) {
    // Attack click
    await page.mouse.move(box.x + Math.random() * box.width, box.y + Math.random() * box.height);
    await page.mouse.down();
    await page.waitForTimeout(40);
    await page.mouse.up();
  } else if (r < 0.75) {
    // Dodge
    await page.keyboard.press('Space');
  } else if (r < 0.92) {
    // Open + close a random panel
    const k = actionKeys[Math.floor(Math.random() * actionKeys.length)];
    await page.keyboard.press(k);
    await page.waitForTimeout(200);
    if (Math.random() < 0.5) await page.keyboard.press('Escape');
  } else {
    // Esc (pause/close)
    await page.keyboard.press('Escape');
  }
  await page.waitForTimeout(40);
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
const totalErrors = errors.length - startErrors;
console.log(`\nPlayed ${elapsed}s, ${totalErrors} runtime errors.`);
if (totalErrors > 0) {
  console.log('Errors:');
  errors.slice(startErrors).slice(0, 10).forEach(e => console.log('  -', e));
}
const final = await page.evaluate(() => ({
  hp: window.__state.player.hp,
  pos: { x: window.__state.player.x.toFixed(2), y: window.__state.player.y.toFixed(2) },
  scene: window.__state.scene,
  mode: window.__state.mode,
  entities: window.__state.entities.filter(e => e.alive).length
}));
console.log('Final state:', final);
console.log(`Invariant violations during play: ${invariantBreaks.length}`);
invariantBreaks.slice(0, 5).forEach(v => console.log('  ✗', v));

await browser.close();
process.exit((totalErrors === 0 && invariantBreaks.length === 0) ? 0 : 1);
