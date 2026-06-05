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
  console.log('\n[7] Character status panel');
  await probe.page.keyboard.press('KeyP');
  await probe.page.waitForTimeout(400);
  const panelInfo = await probe.page.evaluate(() => {
    const el = document.getElementById('characterPanel');
    return {
      open: !!el && !el.classList.contains('hidden'),
      text: el?.innerText || ''
    };
  });
  probe.tally(probe.expect('character panel visible', panelInfo.open));
  probe.tally(probe.expect('character panel shows race and proficiency', /人类/.test(panelInfo.text) && /熟练度/.test(panelInfo.text)));
  probe.tally(probe.expect('character panel shows locked career entry before Lv5', /职业信息/.test(panelInfo.text) && /职业选择/.test(panelInfo.text) && /任意熟练度达到 5 级后可以选择职业/.test(panelInfo.text)));
  await probe.page.keyboard.press('KeyP');
  await probe.page.waitForTimeout(300);
  const panelHidden = await probe.page.evaluate(() => document.getElementById('characterPanel')?.classList.contains('hidden'));
  probe.tally(probe.expect('character panel hidden on second P', !!panelHidden));
  probe.tally(probe.expect('character panel cycle: no errors', probe.flushErrors() === 0));
}
