import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors: string[] = [];
page.on('pageerror', e => errors.push(`PAGE: ${e.message}`));
page.on('console', m => { if (m.type() === 'error') errors.push(`CON: ${m.text()}`); });

function near(actual: number, expected: number) {
  return Math.abs(actual - expected) < 0.01;
}

function ok(message: string) {
  console.log(`  ✓ ${message}`);
}

function fail(message: string): never {
  throw new Error(`${message}${errors.length ? ` | ${errors.slice(-2).join(' | ')}` : ''}`);
}

async function bootGame() {
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.evaluate(() => document.querySelector('[data-menu-action="new"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  await page.waitForTimeout(200);
  await page.evaluate(() => document.querySelector('[data-menu-action="startRace"][data-race="人类"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  await page.waitForTimeout(1500);
}

async function prepareAt(scene: string, x: number, y: number) {
  await page.evaluate(({ scene, x, y }) => {
    window.__api.makeMap(scene);
    window.__api.spawnWorld(scene);
    window.__state.player.portalCooldown = 0;
    window.__state.player.x = x;
    window.__state.player.y = y;
    window.__api.rebuildDisplay();
    window.__api.teleportBody(window.__state.player);
  }, { scene, x, y });
  await page.waitForTimeout(100);
}

async function pressInteractAndRead() {
  await page.keyboard.press('E');
  await page.waitForTimeout(600);
  return page.evaluate(() => ({
    scene: window.__state.scene,
    x: window.__state.player.x,
    y: window.__state.player.y,
    portals: window.__state.objects
      .filter(obj => obj.kind === 'portal')
      .map(obj => ({
        name: obj.name,
        portalId: obj.portalId,
        sourceScene: obj.sourceScene,
        action: obj.action,
        targetMapId: obj.targetMapId,
        targetScene: obj.targetScene,
        targetSpawnId: obj.targetSpawnId
      }))
  }));
}

await bootGame();

console.log('\n▶ Runtime portal path uses target spawn points');

await prepareAt('field', 76.5, 26.2);
const fieldPortal = await page.evaluate(() => window.__state.objects.find(obj => obj.kind === 'portal' && obj.portalId === 'north_exit_to_forest'));
if (!fieldPortal) fail('field north_exit_to_forest portal exists');
if (fieldPortal.sourceScene !== 'field' || fieldPortal.targetMapId !== 'forest' || fieldPortal.targetSpawnId !== 'south_entry_from_village') {
  fail(`field portal metadata mismatch: ${JSON.stringify(fieldPortal)}`);
}
ok(`field portal metadata action=${fieldPortal.action}`);

const toForest = await pressInteractAndRead();
if (toForest.scene !== 'forest' || !near(toForest.x, 8.5) || !near(toForest.y, 35.5)) {
  fail(`field→forest landed at ${toForest.scene} (${toForest.x},${toForest.y})`);
}
ok(`field→forest landed at forest:south_entry_from_village (${toForest.x},${toForest.y})`);

await prepareAt('forest', 4.2, 34.4);
const forestPortal = await page.evaluate(() => window.__state.objects.find(obj => obj.kind === 'portal' && obj.portalId === 'south_exit_to_village'));
if (!forestPortal) fail('forest south_exit_to_village portal exists');
if (forestPortal.sourceScene !== 'forest' || forestPortal.targetMapId !== 'field' || forestPortal.targetSpawnId !== 'north_entry_from_forest') {
  fail(`forest portal metadata mismatch: ${JSON.stringify(forestPortal)}`);
}
ok(`forest portal metadata action=${forestPortal.action}`);

const toField = await pressInteractAndRead();
if (toField.scene !== 'field' || !near(toField.x, 74.5) || !near(toField.y, 25.5)) {
  fail(`forest→field landed at ${toField.scene} (${toField.x},${toField.y})`);
}
ok(`forest→field landed at field:north_entry_from_forest (${toField.x},${toField.y})`);

if (errors.length) fail('console errors should be empty');
console.log('\nPASS — runtime portal path matches unit portal logic');

await browser.close();
