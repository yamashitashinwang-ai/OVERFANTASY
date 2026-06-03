// Live combat probe. Plays the game normally without pausing the scene and
// verifies enemy movement, collision damage, repeated hits, and death transition
// scenarios end-to-end.

import { createLiveCombatProbe } from './probe-live-combat/harness.ts';
import { runLiveCombatChecks } from './probe-live-combat/scenarios.ts';

const TOTAL_CHECKS = 4;
const probe = await createLiveCombatProbe();

try {
  await probe.bootstrap();
  await probe.focusCanvas();
  await runLiveCombatChecks(probe);
  await probe.cleanupTestEntities();
  process.exit(await probe.finish(TOTAL_CHECKS));
} catch (error) {
  probe.fail(error instanceof Error ? error.message : String(error));
  process.exit(await probe.finish(TOTAL_CHECKS));
}
