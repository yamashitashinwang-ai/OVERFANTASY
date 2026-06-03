import type { CanvasBox, ComprehensiveProbe } from './harness.ts';

export async function runBootPhase(probe: ComprehensiveProbe): Promise<void> {
  console.log('\n[1] Boot');
  await probe.bootstrap();
  await probe.page.waitForTimeout(1500);
  probe.tally(probe.expect('zero boot errors', probe.errors.length === 0));
  const menuHtml = await probe.page.evaluate(() => document.getElementById('mainMenu').innerHTML);
  probe.tally(probe.expect('main menu populated', menuHtml.length > 100));
  probe.flushErrors();
}

export async function runNewGamePhase(probe: ComprehensiveProbe): Promise<CanvasBox> {
  console.log('\n[2] New game + race selection');
  await probe.page.evaluate(() => document.querySelector('[data-menu-action="new"]')?.click());
  await probe.page.waitForTimeout(300);
  await probe.page.evaluate(() => document.querySelector('[data-menu-action="startRace"][data-race="人类"]')?.click());
  await probe.page.waitForTimeout(1800);
  probe.tally(probe.expect('race selection: no errors', probe.flushErrors() === 0));
  const statsText = await probe.page.evaluate(() => document.getElementById('stats').innerText);
  probe.tally(probe.expect('stats panel populated', /人类/.test(statsText)));
  return probe.focusCanvas();
}
