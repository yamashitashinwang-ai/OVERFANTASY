import type { CombatProbe } from './harness.ts';
import { runEnemyAiChecks } from './enemy-ai.ts';
import { runPlayerDamageAndDeathChecks } from './player-damage-and-death.ts';

export async function runDamageAndDeathChecks(probe: CombatProbe) {
  await runEnemyAiChecks(probe);
  await runPlayerDamageAndDeathChecks(probe);
}
