// One-shot diagnostic dump. Plays the game through specific scenarios and
// writes EVERYTHING (logs, invariant violations, errors, state snapshots,
// screenshots) to ./test-output/ — so the user can read one folder instead
// of re-running 5 different probes.
//
// Usage:
//   PROBE_BASE_URL=http://server:5175/ npx tsx test/probe-dump.ts [scenario...]
//
// Scenarios: dodge | wolves | save-load | all   (default: all)

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { probeBaseUrl } from './probe-url.ts';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'test-output');
mkdirSync(OUT, { recursive: true });

const arg = process.argv[2] || 'all';
const SCENARIOS = arg === 'all' ? ['dodge', 'wolves', 'save-load'] : [arg];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const consoleLog = [];
const errors = [];
const invariantBreaks = [];

page.on('pageerror', e => errors.push({ t: Date.now(), msg: e.message }));
page.on('console', m => {
  const text = m.text();
  consoleLog.push({ t: Date.now(), type: m.type(), text });
  if (m.type() === 'error') errors.push({ t: Date.now(), msg: text });
  if (text.startsWith('[invariant]')) invariantBreaks.push({ t: Date.now(), msg: text });
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

async function snap(label) {
  const box = await (await page.$('#game-container canvas')).boundingBox();
  await page.screenshot({ path: join(OUT, `${label}.png`), clip: box });
  const state = await page.evaluate(() => ({
    player: {
      hp: window.__state.player.hp, maxHp: window.__state.player.maxHp,
      pos: [window.__state.player.x, window.__state.player.y],
      invuln: window.__state.player.invuln,
      attackCooldown: window.__state.player.attackCooldown,
      dodgeCooldown: window.__state.player.dodgeCooldown,
      dodgeTimer: window.__state.player.dodgeTimer,
      blockTimer: window.__state.player.blockTimer,
      stamina: window.__state.player.stamina,
      monsterForm: window.__state.player.monsterForm,
      _cd_invuln: window.__state.player.__cd_invuln,
      _cd_dodgeCooldown: window.__state.player.__cd_dodgeCooldown,
    },
    scene: window.__state.scene,
    mode: window.__state.mode,
    nearest_monsters: window.__state.entities
      .filter(e => e.alive && e.faction === 'monster')
      .map(e => ({ name: e.name, dist: Math.hypot(e.x - window.__state.player.x, e.y - window.__state.player.y), cd: e.cooldown }))
      .sort((a, b) => a.dist - b.dist).slice(0, 5)
  }));
  return state;
}

const report = { scenarios: {} };
const box = await (await page.$('#game-container canvas')).boundingBox();
await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
await page.mouse.click(box.x + box.width/2, box.y + box.height/2);

if (SCENARIOS.includes('dodge')) {
  console.log('▶ Scenario: dodge');
  const before = await snap('dodge-before');
  await page.keyboard.press('Space');
  await page.waitForTimeout(50);
  const t50 = await snap('dodge-50ms');
  await page.waitForTimeout(500);
  const t500 = await snap('dodge-500ms');
  await page.waitForTimeout(1500);
  const t2000 = await snap('dodge-2000ms');
  report.scenarios.dodge = { before, t50ms: t50, t500ms: t500, t2000ms: t2000 };
}

if (SCENARIOS.includes('wolves')) {
  console.log('▶ Scenario: wolves');
  await page.evaluate(() => {
    const p = window.__state.player;
    const w = window.__state.entities.filter(e => e.alive && e.faction === 'monster')
      .sort((a,b) => Math.hypot(a.x-p.x,a.y-p.y) - Math.hypot(b.x-p.x,b.y-p.y))[0];
    p.x = w.x; p.y = w.y;
    window.__api.teleportBody(p);
  });
  const wolfBefore = await snap('wolves-touched');
  await page.waitForTimeout(4000);
  const wolfAfter = await snap('wolves-after-4s');
  report.scenarios.wolves = { before: wolfBefore, after_4s: wolfAfter };
}

if (SCENARIOS.includes('save-load')) {
  console.log('▶ Scenario: save-load');
  await page.evaluate(() => { window.__state.player.hp = 11; window.__state.player.gold = 777; });
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('[data-pause-action="save"]')?.click());
  await page.waitForTimeout(600);
  const before = await snap('save-before');
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(2000);
  await page.evaluate(() => document.querySelector('[data-menu-action="continue"]')?.click());
  await page.waitForTimeout(2000);
  const after = await snap('save-after');
  report.scenarios.save_load = { before, after };
}

// Pull the in-game log buffer (the debug-package timeline)
const ingameLog = await page.evaluate(() => window.__dumpLogs?.(400) || '');

writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2));
writeFileSync(join(OUT, 'browser-console.log'), consoleLog.map(c => `[${c.type}] ${c.text}`).join('\n'));
writeFileSync(join(OUT, 'errors.log'),        errors.map(e => e.msg).join('\n\n'));
writeFileSync(join(OUT, 'invariants.log'),    invariantBreaks.map(v => v.msg).join('\n'));
writeFileSync(join(OUT, 'ingame-debug.log'),  ingameLog);

const summary = [
  '# Probe dump',
  '',
  `scenarios: ${SCENARIOS.join(', ')}`,
  `console errors: ${errors.length}`,
  `invariant violations: ${invariantBreaks.length}`,
  '',
  '## Files',
  '- report.json — per-scenario state snapshots (HP, cooldowns, positions, etc.)',
  '- browser-console.log — every browser console message',
  '- errors.log — only the errors / pageerrors',
  '- invariants.log — only [invariant] warnings',
  '- ingame-debug.log — the structured-log timeline (Markdown-friendly)',
  '- *.png — per-scenario screenshots',
];
writeFileSync(join(OUT, 'README.md'), summary.join('\n'));

console.log(`\nDump written to ${OUT}`);
console.log(`Console errors: ${errors.length} | Invariant breaks: ${invariantBreaks.length}`);
await browser.close();
