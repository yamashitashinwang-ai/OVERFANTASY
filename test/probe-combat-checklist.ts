// Combat/AI/damage checklist probe — one named test per requirement from
// the original game.js. Each test sets up controlled state, invokes the
// specific domain function, and asserts the expected state mutation.
//
// Goal: every gameplay function must have a corresponding test that passes.

import { createCombatProbe } from './probe-combat-checklist/harness.ts';
import { runDamageAndDeathChecks } from './probe-combat-checklist/damage-and-death.ts';
import { runMovementAndWorldChecks } from './probe-combat-checklist/movement-and-world.ts';
import { runSystemChecks } from './probe-combat-checklist/systems.ts';

const TOTAL = 24;
const probe = await createCombatProbe();

try {
  await probe.bootstrap();

  // Pause GameScene so the in-game update loop doesn't mutate state between
  // the probe's setup/eval steps.
  await probe.pauseGame();
  await runDamageAndDeathChecks(probe);

  await probe.resumeGame();
  await runMovementAndWorldChecks(probe);

  await probe.pauseGame();
  await runSystemChecks(probe);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  probe.fail(`probe runner threw: ${message.slice(0, 200)}`);
}

const failures = await probe.finish(TOTAL);
process.exit(failures ? 1 : 0);
