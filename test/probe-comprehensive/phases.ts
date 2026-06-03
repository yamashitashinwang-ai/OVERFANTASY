import type { ComprehensiveProbe } from './harness.ts';
import { runBootPhase, runNewGamePhase } from './boot-and-new-game.ts';
import { runGameplayActionPhases } from './gameplay-actions.ts';
import { runPanelsPhase } from './panels.ts';
import { runPersistencePhase } from './persistence.ts';
import { runPausePhase, runStatsPhase } from './status-and-pause.ts';

export async function runComprehensivePhases(probe: ComprehensiveProbe): Promise<void> {
  await runBootPhase(probe);
  const box = await runNewGamePhase(probe);
  await runPanelsPhase(probe);
  await runGameplayActionPhases(probe, box);
  await runPausePhase(probe);
  await runStatsPhase(probe);
  await runPersistencePhase(probe);
}
