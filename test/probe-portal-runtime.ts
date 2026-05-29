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

async function prepareAt(scene: string, x: number, y: number, settleMs = 100) {
  await page.evaluate(({ scene, x, y }) => {
    window.__api.makeMap(scene);
    window.__api.spawnWorld(scene);
    window.__state.player.portalCooldown = 0;
    window.__state.player.x = x;
    window.__state.player.y = y;
    window.__api.rebuildDisplay();
    window.__api.teleportBody(window.__state.player);
  }, { scene, x, y });
  if (settleMs > 0) await page.waitForTimeout(settleMs);
}

async function waitForAutoExitAndRead() {
  await page.waitForTimeout(600);
  return page.evaluate(() => ({
    scene: window.__state.scene,
    x: window.__state.player.x,
    y: window.__state.player.y,
    portals: window.__state.objects
      .filter(obj => obj.kind === 'mapExit' || obj.kind === 'roadSign')
      .map(obj => ({
        kind: obj.kind,
        name: obj.name,
        portalId: obj.portalId,
        signForPortalId: obj.signForPortalId,
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

await prepareAt('field', 76.5, 24.5);
const nearSign = await waitForAutoExitAndRead();
if (nearSign.scene !== 'field') fail(`standing by the road sign should not teleport: ${JSON.stringify(nearSign)}`);
ok('standing near the old road sign does not trigger teleport');

const fieldPortal = await page.evaluate(() => window.__state.objects.find(obj => obj.kind === 'mapExit' && obj.portalId === 'north_exit_to_forest'));
const fieldSign = await page.evaluate(() => window.__state.objects.find(obj => obj.kind === 'roadSign' && obj.signForPortalId === 'north_exit_to_forest'));
if (!fieldPortal) fail('field north_exit_to_forest map exit exists');
if (!fieldSign || fieldSign.action) fail(`field road sign should be visual-only: ${JSON.stringify(fieldSign)}`);
if (fieldPortal.sourceScene !== 'field' || fieldPortal.targetMapId !== 'forest' || fieldPortal.targetSpawnId !== 'south_entry_from_village') {
  fail(`field map exit metadata mismatch: ${JSON.stringify(fieldPortal)}`);
}
ok(`field map exit metadata action=${fieldPortal.action}`);

await prepareAt('field', 75.2, 1.2, 0);
const toForest = await waitForAutoExitAndRead();
if (toForest.scene !== 'forest' || !near(toForest.x, 8.5) || !near(toForest.y, 35.5)) {
  fail(`field→forest landed at ${toForest.scene} (${toForest.x},${toForest.y})`);
}
ok(`field→forest landed at forest:south_entry_from_village (${toForest.x},${toForest.y})`);

await prepareAt('field', 77.4, 1.4, 0);
const toForestSecondPosition = await waitForAutoExitAndRead();
if (toForestSecondPosition.scene !== 'forest' || !near(toForestSecondPosition.x, 8.5) || !near(toForestSecondPosition.y, 35.5)) {
  fail(`field north exit from another position landed at ${toForestSecondPosition.scene} (${toForestSecondPosition.x},${toForestSecondPosition.y})`);
}
ok('field north exit lands at the same forest entry from another trigger position');

const forestPortal = await page.evaluate(() => window.__state.objects.find(obj => obj.kind === 'mapExit' && obj.portalId === 'south_exit_to_village'));
const forestSign = await page.evaluate(() => window.__state.objects.find(obj => obj.kind === 'roadSign' && obj.signForPortalId === 'south_exit_to_village'));
if (!forestPortal) fail('forest south_exit_to_village map exit exists');
if (!forestSign || forestSign.action) fail(`forest road sign should be visual-only: ${JSON.stringify(forestSign)}`);
if (forestPortal.sourceScene !== 'forest' || forestPortal.targetMapId !== 'field' || forestPortal.targetSpawnId !== 'north_entry_from_forest') {
  fail(`forest map exit metadata mismatch: ${JSON.stringify(forestPortal)}`);
}
ok(`forest map exit metadata action=${forestPortal.action}`);

await prepareAt('forest', 8.2, 70.8, 0);
const toField = await waitForAutoExitAndRead();
if (toField.scene !== 'field' || !near(toField.x, 74.5) || !near(toField.y, 25.5)) {
  fail(`forest→field landed at ${toField.scene} (${toField.x},${toField.y})`);
}
ok(`forest→field landed at field:north_entry_from_forest (${toField.x},${toField.y})`);

await prepareAt('forest', 10.6, 70.7, 0);
const toFieldSecondPosition = await waitForAutoExitAndRead();
if (toFieldSecondPosition.scene !== 'field' || !near(toFieldSecondPosition.x, 74.5) || !near(toFieldSecondPosition.y, 25.5)) {
  fail(`forest south exit from another position landed at ${toFieldSecondPosition.scene} (${toFieldSecondPosition.x},${toFieldSecondPosition.y})`);
}
ok('forest south exit lands at the same field entry from another trigger position');

for (let i = 0; i < 3; i += 1) {
  await prepareAt('field', 75.6 + i * 0.4, 1.25, 0);
  const cycleForest = await waitForAutoExitAndRead();
  if (cycleForest.scene !== 'forest' || !near(cycleForest.x, 8.5) || !near(cycleForest.y, 35.5)) {
    fail(`cycle ${i + 1} field→forest landed at ${cycleForest.scene} (${cycleForest.x},${cycleForest.y})`);
  }

  await prepareAt('forest', 8.1 + i * 0.7, 70.75, 0);
  const cycleField = await waitForAutoExitAndRead();
  if (cycleField.scene !== 'field' || !near(cycleField.x, 74.5) || !near(cycleField.y, 25.5)) {
    fail(`cycle ${i + 1} forest→field landed at ${cycleField.scene} (${cycleField.x},${cycleField.y})`);
  }
}
ok('three repeated field/forest round trips keep fixed target spawn coordinates');

if (errors.length) fail('console errors should be empty');
console.log('\nPASS — runtime portal path matches unit portal logic');

await browser.close();
