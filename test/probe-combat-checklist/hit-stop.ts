import type { CombatProbe } from './harness.ts';

export async function runHitStopChecks(probe: CombatProbe) {
  const { page, check: test, ok, fail } = probe;

  // Requirement 15: hit-stop on critical.
  await test('REQ-15 — setHitStopTimer sets runtime.hitStopTimer', async () => {
    const v = await page.evaluate(() => {
      window.__api.setHitStopTimer(0.1);
      return window.__runtime.hitStopTimer;
    });
    if (v === 0.1) ok(`hitStopTimer=${v}`); else fail(`hitStopTimer=${v}`);
  });
}
