// UI-flow probe — drives the actual button clicks in each panel as a real
// user would, validating the click-handler → domain → render path end-to-end.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', e => errors.push(`PAGE: ${e.message.slice(0, 240)}`));
page.on('console', m => { if (m.type() === 'error') errors.push(`CON: ${m.text().slice(0, 240)}`); });

const failures = [];
const fail = (m) => { console.log('  ✗', m); failures.push(m); };
const ok = (m) => console.log('  ✓', m);

async function step(label, fn) {
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

// Pre-stage: give player materials + place shop/forge near them
await page.evaluate(() => {
  const p = window.__state.player;
  window.__api.addObject('shop', '测试商店', Math.floor(p.x), Math.floor(p.y), 2, 2, '#8fa0b2', 'shop');
  window.__api.addObject('forge', '测试锻造台', Math.floor(p.x) + 2, Math.floor(p.y), 2, 2, '#cc9966', 'forge');
  window.__state.player.gold = 200;
  window.__state.player.materials = { '魔狼牙': 5, '柔软毛皮': 3 };
  window.__api.addResource('木材', 10);
  window.__api.addResource('反重力石', 10);
});

// ─── Forge panel UI ────────────────────────────────────────────────────────
await step('Open forge panel via openForgePanel', async () => {
  await page.evaluate(() => window.__api.openForgePanel());
  await page.waitForTimeout(500);
  const html = await page.evaluate(() => document.getElementById('forgePanel').innerHTML.length);
  const tabs = await page.evaluate(() => Array.from(document.querySelectorAll('[data-forge-tab]')).map(b => b.dataset.forgeTab));
  if (html > 100 && tabs.length === 3) ok(`html=${html}, tabs=${tabs.join(',')}`);
  else fail(`html=${html}, tabs=${tabs}`);
});

await step('Click "戒指锻造" tab → forge ring button', async () => {
  await page.evaluate(() => document.querySelector('[data-forge-tab="ring"]')?.click());
  await page.waitForTimeout(200);
  const beforeRings = await page.evaluate(() => window.__state.player.rings || 0);
  await page.evaluate(() => document.querySelector('[data-forge-action="forgeRing"]')?.click());
  await page.waitForTimeout(200);
  const afterRings = await page.evaluate(() => window.__state.player.rings || 0);
  // 62% success per ring; just check resource was consumed
  const wood = await page.evaluate(() => window.__state.player.wood);
  if (wood < 10) ok(`wood ${10} → ${wood}, rings ${beforeRings} → ${afterRings}`);
  else fail(`wood=${wood} (expected <10)`);
});

await step('Switch to "武器锻造" tab', async () => {
  await page.evaluate(() => document.querySelector('[data-forge-tab="weapon"]')?.click());
  await page.waitForTimeout(300);
  const weapons = await page.evaluate(() => Array.from(document.querySelectorAll('[data-forge-weapon]')).map(b => b.dataset.forgeWeapon));
  if (weapons.length > 0) ok(`weapons available: ${weapons.length}`);
  else fail('no weapons listed');
});

await step('Close forge panel via close button', async () => {
  await page.evaluate(() => document.querySelector('[data-forge-action="close"]')?.click());
  await page.waitForTimeout(500);
  const hidden = await page.evaluate(() => document.getElementById('forgePanel').classList.contains('hidden'));
  if (hidden) ok('hidden'); else fail('still visible');
});

// ─── Shop panel UI ────────────────────────────────────────────────────────
await step('Open shop via openShopPanel', async () => {
  await page.evaluate(() => window.__api.openShopPanel());
  await page.waitForTimeout(500);
  const html = await page.evaluate(() => document.getElementById('shopPanel').innerHTML.length);
  if (html > 100) ok(`html=${html}`); else fail(`html=${html}`);
});

await step('Click buyPotion button via UI', async () => {
  const beforeGold = await page.evaluate(() => window.__state.player.gold);
  const beforePotions = await page.evaluate(() => window.__state.player.potions);
  await page.evaluate(() => document.querySelector('[data-shop-action="buyPotion"]')?.click());
  await page.waitForTimeout(200);
  const afterGold = await page.evaluate(() => window.__state.player.gold);
  const afterPotions = await page.evaluate(() => window.__state.player.potions);
  if (afterPotions === beforePotions + 1 && afterGold === beforeGold - 8) {
    ok(`gold ${beforeGold} → ${afterGold}, potions ${beforePotions} → ${afterPotions}`);
  } else fail(`gold=${beforeGold}→${afterGold} potions=${beforePotions}→${afterPotions}`);
});

await step('Switch to sell tab', async () => {
  await page.evaluate(() => document.querySelector('[data-shop-tab="sell"]')?.click());
  await page.waitForTimeout(200);
  const sellable = await page.evaluate(() => Array.from(document.querySelectorAll('[data-shop-action="sellOne"]')).map(b => b.dataset.material));
  if (sellable.length > 0) ok(`sellable: ${sellable.join(',')}`); else fail('nothing sellable');
});

await step('Sell one 魔狼牙 via UI', async () => {
  const before = await page.evaluate(() => ({
    count: window.__state.player.materials['魔狼牙'] || 0,
    gold: window.__state.player.gold
  }));
  await page.evaluate(() => document.querySelector('[data-shop-action="sellOne"][data-material="魔狼牙"]')?.click());
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => ({
    count: window.__state.player.materials['魔狼牙'] || 0,
    gold: window.__state.player.gold
  }));
  if (after.count === before.count - 1 && after.gold > before.gold) {
    ok(`count ${before.count} → ${after.count}, gold +${after.gold - before.gold}`);
  } else fail(`count=${before.count}→${after.count}, gold=${before.gold}→${after.gold}`);
});

await step('Close shop via close button', async () => {
  await page.evaluate(() => document.querySelector('[data-shop-action="close"]')?.click());
  await page.waitForTimeout(500);
  const hidden = await page.evaluate(() => document.getElementById('shopPanel').classList.contains('hidden'));
  if (hidden) ok('hidden'); else fail('still visible');
});

// ─── Backpack equip / unequip ─────────────────────────────────────────────
await step('Backpack: equip a new gear via UI button', async () => {
  // Add an unequipped gear to bag
  await page.evaluate(() => window.__api.addGearToBag('ironSword'));
  await page.keyboard.press('b');
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('[data-bag-category="equipment"]')?.click());
  await page.waitForTimeout(200);
  await page.evaluate(() => document.querySelector('[data-bag-item="ironSword"]')?.click());
  await page.waitForTimeout(200);
  await page.evaluate(() => document.querySelector('[data-bag-action="gearToggle"][data-id="ironSword"]')?.click());
  await page.waitForTimeout(300);
  const eq = await page.evaluate(() => window.__state.player.gear.weapon);
  if (eq === 'ironSword') ok(`equipped: ${eq}`); else fail(`weapon=${eq}`);
});

await step('Close backpack via close button', async () => {
  await page.evaluate(() => document.querySelector('[data-bag-action="close"]')?.click());
  await page.waitForTimeout(500);
  const hidden = await page.evaluate(() => document.getElementById('backpackPanel').classList.contains('hidden'));
  if (hidden) ok('hidden'); else fail('still visible');
});

// ─── Magic panel cast spell via UI ────────────────────────────────────────
await step('Magic panel: learn + cast via UI buttons', async () => {
  // Pre-learn for this test
  await page.evaluate(() => {
    window.__state.player.magicKnown = ['littleCold'];
    window.__state.player.mp = 50;
  });
  await page.keyboard.press('f');
  await page.waitForTimeout(400);
  const castBtns = await page.evaluate(() => Array.from(document.querySelectorAll('[data-magic-action="cast"]')).map(b => ({ spell: b.dataset.spell, disabled: b.disabled })));
  if (!castBtns.length) { fail('no cast buttons'); return; }
  ok(`cast buttons: ${JSON.stringify(castBtns).slice(0, 80)}`);
  // Click the first cast button
  const spell = castBtns[0].spell;
  await page.evaluate((s) => document.querySelector(`[data-magic-action="cast"][data-spell="${s}"]`)?.click(), spell);
  await page.waitForTimeout(300);
  const pending = await page.evaluate(() => window.__runtime.pendingMagicCast);
  if (pending) ok(`pending: ${pending.spellId}`); else fail('no pending cast');
});

await step('Close magic panel via close button', async () => {
  await page.evaluate(() => document.querySelector('[data-magic-action="close"]')?.click());
  await page.waitForTimeout(500);
  const hidden = await page.evaluate(() => document.getElementById('magicPanel').classList.contains('hidden'));
  if (hidden) ok('hidden'); else fail('still visible');
});

// ─── Quest panel: accept + settle via UI ──────────────────────────────────
await step('Quest panel: accept major quest via UI', async () => {
  // Open guild quest panel (need to call openGuildPanel manually since no NPC available)
  await page.evaluate(() => window.__state.quests = { major: null, small: [] });
  await page.evaluate(() => window.__api.openGuildPanel?.());
  await page.waitForTimeout(400);
  const visible = await page.evaluate(() => !document.getElementById('questPanel').classList.contains('hidden'));
  if (!visible) { fail('quest panel not visible'); return; }
  const acceptBtns = await page.evaluate(() => Array.from(document.querySelectorAll('[data-quest-action="acceptMajor"]')).map(b => b.dataset.questId));
  if (acceptBtns.length === 0) { fail('no accept major buttons'); return; }
  await page.evaluate((id) => document.querySelector(`[data-quest-action="acceptMajor"][data-quest-id="${id}"]`)?.click(), acceptBtns[0]);
  await page.waitForTimeout(300);
  const major = await page.evaluate(() => window.__state.quests.major);
  if (major && major.id === acceptBtns[0]) ok(`accepted: ${major.name}`);
  else fail(`expected ${acceptBtns[0]}, got ${JSON.stringify(major)?.slice(0, 100)}`);
});

await step('Close quest panel via UI', async () => {
  await page.evaluate(() => document.querySelector('[data-quest-action="close"]')?.click());
  await page.waitForTimeout(500);
  const hidden = await page.evaluate(() => document.getElementById('questPanel').classList.contains('hidden'));
  if (hidden) ok('hidden'); else fail('still visible');
});

// ─── Summary ──────────────────────────────────────────────────────────────
console.log(`\n=== ${failures.length === 0 ? 'PASS' : 'FAIL'}: ${failures.length} failures ===`);
failures.forEach(f => console.log(' -', f));
await browser.close();
process.exit(failures.length ? 1 : 0);
