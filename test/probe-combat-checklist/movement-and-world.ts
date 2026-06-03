import type { CombatProbe } from './harness.ts';
import { runHitStopChecks } from './hit-stop.ts';
import { runPetAndEntityOutcomeChecks } from './pet-and-entity-outcomes.ts';
import { runPlayerMovementChecks } from './player-movement.ts';
import { runWorldPickupChecks } from './world-pickups.ts';

export async function runMovementAndWorldChecks(probe: CombatProbe) {
  await runPlayerMovementChecks(probe);
  await runWorldPickupChecks(probe);
  await runPetAndEntityOutcomeChecks(probe);
  await runHitStopChecks(probe);
}
