import type { CanvasBox, ComprehensiveProbe } from './harness.ts';

export async function runCombatPhase(probe: ComprehensiveProbe, box: CanvasBox): Promise<void> {
  console.log('\n[4] Combat');
  await probe.page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 50);
  await probe.page.mouse.down();
  await probe.page.waitForTimeout(100);
  await probe.page.mouse.up();
  await probe.page.waitForTimeout(300);
  probe.tally(probe.expect('attack click: no errors', probe.flushErrors() === 0));
  await probe.page.keyboard.press('Space');
  await probe.page.waitForTimeout(200);
  probe.tally(probe.expect('dodge key: no errors', probe.flushErrors() === 0));
}

export async function runMovementPhase(probe: ComprehensiveProbe): Promise<void> {
  console.log('\n[5] Movement');
  for (const key of ['w', 'a', 's', 'd']) {
    await probe.page.keyboard.down(key);
    await probe.page.waitForTimeout(150);
    await probe.page.keyboard.up(key);
  }
  probe.tally(probe.expect('WASD: no errors', probe.flushErrors() === 0));
}

export async function runGameplayActionPhases(probe: ComprehensiveProbe, box: CanvasBox): Promise<void> {
  await runCombatPhase(probe, box);
  await runMovementPhase(probe);
}
