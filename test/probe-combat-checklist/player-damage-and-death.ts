import type { CombatProbe } from './harness.ts';
import { runPlayerDamageChecks, runPlayerThornsChecks } from './player-damage.ts';
import { runPlayerDeathChecks } from './player-death.ts';

export async function runPlayerDamageAndDeathChecks(probe: CombatProbe) {
  await runPlayerDamageChecks(probe);
  await runPlayerDeathChecks(probe);
  await runPlayerThornsChecks(probe);
}
