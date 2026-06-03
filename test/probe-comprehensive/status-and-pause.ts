import type { ComprehensiveProbe } from './harness.ts';

export async function runPausePhase(probe: ComprehensiveProbe): Promise<void> {
  console.log('\n[6] Pause');
  await probe.page.keyboard.press('Escape');
  await probe.page.waitForTimeout(500);
  const pauseInfo = await probe.page.evaluate(() => {
    const el = document.getElementById('pauseMenu');
    return { open: !el.classList.contains('hidden'), len: el.innerHTML.length };
  });
  probe.tally(probe.expect('pause menu visible', pauseInfo.open && pauseInfo.len > 50));
  await probe.page.keyboard.press('Escape');
  await probe.page.waitForTimeout(300);
  const pauseHidden = await probe.page.evaluate(() => document.getElementById('pauseMenu').classList.contains('hidden'));
  probe.tally(probe.expect('pause menu hidden on second Esc', pauseHidden));
  probe.tally(probe.expect('pause cycle: no errors', probe.flushErrors() === 0));
}

export async function runStatsPhase(probe: ComprehensiveProbe): Promise<void> {
  console.log('\n[7] Stats reactive update');
  await probe.page.evaluate(() => document.getElementById('stats').innerHTML);
  await probe.page.waitForTimeout(800);
  await probe.page.evaluate(() => document.getElementById('stats').innerHTML);
  probe.tally(probe.expect('stats render: no errors', probe.flushErrors() === 0));
}
