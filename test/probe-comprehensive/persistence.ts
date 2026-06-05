import type { ComprehensiveProbe } from './harness.ts';

export async function runPersistencePhase(probe: ComprehensiveProbe): Promise<void> {
  console.log('\n[8] Persistence (save → reload → continue)');
  await probe.page.keyboard.press('Escape');
  await probe.page.waitForTimeout(300);
  await probe.page.evaluate(() => document.querySelector('[data-pause-action="save"]')?.click());
  await probe.page.waitForTimeout(400);
  probe.tally(probe.expect('save action: no errors', probe.flushErrors() === 0));
  const savesAfter = await probe.page.evaluate(() => {
    const raw = localStorage.getItem('overfantasy.saves.v1') || '[]';
    return JSON.parse(raw);
  });
  probe.tally(probe.expect('save record persisted', Array.isArray(savesAfter) && savesAfter.length > 0));

  await probe.page.reload({ waitUntil: 'networkidle' });
  await probe.page.waitForTimeout(1500);
  probe.flushErrors();
  await probe.page.evaluate(() => document.querySelector('[data-menu-action="continue"]')?.click());
  await probe.page.waitForTimeout(2000);
  probe.tally(probe.expect('continue latest: no errors', probe.flushErrors() === 0));
  await probe.page.keyboard.press('KeyP');
  await probe.page.waitForTimeout(400);
  const statusAfterLoad = await probe.page.evaluate(() => document.getElementById('characterPanel')?.innerText || '');
  probe.tally(probe.expect('character status restored after load', /人类/.test(statusAfterLoad) && /熟练度/.test(statusAfterLoad) && /职业信息/.test(statusAfterLoad)));
  await probe.page.keyboard.press('KeyP');
}
