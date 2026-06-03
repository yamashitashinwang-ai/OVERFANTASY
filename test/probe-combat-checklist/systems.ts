import type { CombatProbe } from './harness.ts';
import { runPetAndLootChecks } from './pet-and-loot.ts';
import { runMagicAndQuestChecks } from './magic-and-quest.ts';
import { runWorldSystemChecks } from './world-systems.ts';

export async function runSystemChecks(probe: CombatProbe) {
  await runPetAndLootChecks(probe);
  await runMagicAndQuestChecks(probe);
  await runWorldSystemChecks(probe);
}
