import type { PortalProbeObject, PortalRuntimeProbe } from './harness.ts';

function assertFieldPortalMetadata(probe: PortalRuntimeProbe, fieldPortal: PortalProbeObject | undefined, fieldSign: PortalProbeObject | undefined): void {
  if (!fieldPortal) probe.fail('field north_exit_to_forest map exit exists');
  if (!fieldSign || fieldSign.action) probe.fail(`field road sign should be visual-only: ${JSON.stringify(fieldSign)}`);
  if (fieldPortal.sourceScene !== 'field' || fieldPortal.targetMapId !== 'forest' || fieldPortal.targetSpawnId !== 'south_entry_from_village') {
    probe.fail(`field map exit metadata mismatch: ${JSON.stringify(fieldPortal)}`);
  }
  probe.ok(`field map exit metadata action=${fieldPortal.action}`);
}

function assertForestPortalMetadata(probe: PortalRuntimeProbe, forestPortal: PortalProbeObject | undefined, forestSign: PortalProbeObject | undefined): void {
  if (!forestPortal) probe.fail('forest south_exit_to_village map exit exists');
  if (!forestSign || forestSign.action) probe.fail(`forest road sign should be visual-only: ${JSON.stringify(forestSign)}`);
  if (forestPortal.sourceScene !== 'forest' || forestPortal.targetMapId !== 'field' || forestPortal.targetSpawnId !== 'north_entry_from_forest') {
    probe.fail(`forest map exit metadata mismatch: ${JSON.stringify(forestPortal)}`);
  }
  probe.ok(`forest map exit metadata action=${forestPortal.action}`);
}

async function assertFieldToForestLanding(probe: PortalRuntimeProbe, x: number, y: number, label: string): Promise<void> {
  await probe.prepareAt('field', x, y, 0);
  const result = await probe.waitForAutoExitAndRead();
  if (result.scene !== 'forest' || !probe.near(result.x, 8.5) || !probe.near(result.y, 35.5)) {
    probe.fail(`${label} landed at ${result.scene} (${result.x},${result.y})`);
  }
}

async function assertForestToFieldLanding(probe: PortalRuntimeProbe, x: number, y: number, label: string): Promise<void> {
  await probe.prepareAt('forest', x, y, 0);
  const result = await probe.waitForAutoExitAndRead();
  if (result.scene !== 'field' || !probe.near(result.x, 74.5) || !probe.near(result.y, 25.5)) {
    probe.fail(`${label} landed at ${result.scene} (${result.x},${result.y})`);
  }
}

export async function runPortalRuntimeChecks(probe: PortalRuntimeProbe): Promise<void> {
  await probe.bootGame();

  console.log('\n▶ Runtime portal path uses target spawn points');

  await probe.prepareAt('field', 76.5, 24.5);
  const nearSign = await probe.waitForAutoExitAndRead();
  if (nearSign.scene !== 'field') probe.fail(`standing by the road sign should not teleport: ${JSON.stringify(nearSign)}`);
  probe.ok('standing near the old road sign does not trigger teleport');

  const fieldPortal = await probe.page.evaluate(() => window.__state.objects.find(obj => obj.kind === 'mapExit' && obj.portalId === 'north_exit_to_forest'));
  const fieldSign = await probe.page.evaluate(() => window.__state.objects.find(obj => obj.kind === 'roadSign' && obj.signForPortalId === 'north_exit_to_forest'));
  assertFieldPortalMetadata(probe, fieldPortal, fieldSign);

  await assertFieldToForestLanding(probe, 75.2, 1.2, 'field→forest');
  probe.ok('field→forest landed at forest:south_entry_from_village (8.5,35.5)');

  await assertFieldToForestLanding(probe, 77.4, 1.4, 'field north exit from another position');
  probe.ok('field north exit lands at the same forest entry from another trigger position');

  const forestPortal = await probe.page.evaluate(() => window.__state.objects.find(obj => obj.kind === 'mapExit' && obj.portalId === 'south_exit_to_village'));
  const forestSign = await probe.page.evaluate(() => window.__state.objects.find(obj => obj.kind === 'roadSign' && obj.signForPortalId === 'south_exit_to_village'));
  assertForestPortalMetadata(probe, forestPortal, forestSign);

  await assertForestToFieldLanding(probe, 8.2, 70.8, 'forest→field');
  probe.ok('forest→field landed at field:north_entry_from_forest (74.5,25.5)');

  await assertForestToFieldLanding(probe, 10.6, 70.7, 'forest south exit from another position');
  probe.ok('forest south exit lands at the same field entry from another trigger position');

  for (let i = 0; i < 3; i += 1) {
    await assertFieldToForestLanding(probe, 75.6 + i * 0.4, 1.25, `cycle ${i + 1} field→forest`);
    await assertForestToFieldLanding(probe, 8.1 + i * 0.7, 70.75, `cycle ${i + 1} forest→field`);
  }
  probe.ok('three repeated field/forest round trips keep fixed target spawn coordinates');

  if (probe.errors.length) probe.fail('console errors should be empty');
  console.log('\nPASS — runtime portal path matches unit portal logic');
}
