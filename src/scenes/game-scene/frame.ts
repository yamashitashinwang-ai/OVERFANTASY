import { syncAllDisplay, syncStateFromBodies, zeroAllVelocities } from '../../display/index.ts';
import { updatePetRemains, updatePets, updateEntities } from '../../domain/ai.ts';
import { updateCombatFeedback } from '../../domain/combat/actions.ts';
import { hasCorruptionControlLock, updateCorruption } from '../../domain/corruption.ts';
import { updateDeathSystem } from '../../domain/death.ts';
import { leaveDungeon } from '../../domain/dungeon.ts';
import { updatePlayer } from '../../domain/player.ts';
import { triggerMapExitIfNeeded } from '../../domain/teleport.ts';
import { tickInvariants } from '../../runtime/invariants.ts';
import { tickPlayerCooldowns } from '../../runtime/player-cooldowns.ts';
import { syncRegistry } from '../../runtime/registry.ts';
import { runtime, state } from '../../runtime/state.ts';
import { isPlaying, uiState } from '../../runtime/ui-state.ts';
import { updateWorld } from '../game-scene-helpers.ts';

export function updateGameSceneFrame(delta: number) {
  const dt = Math.min(0.033, delta / 1000);

  syncStateFromBodies();
  zeroAllVelocities();

  if (isPlaying() && !uiState.backpackOpen && !uiState.questOpen && !uiState.shopOpen && !uiState.forgeOpen && !uiState.magicOpen) {
    if (runtime.hitStopTimer > 0) {
      runtime.hitStopTimer = Math.max(0, runtime.hitStopTimer - dt);
    } else {
      tickPlayerCooldowns(state.player, dt);
      updateDeathSystem(dt);
      updateCorruption(dt);
      if (!hasCorruptionControlLock()) updatePlayer(dt);
      triggerMapExitIfNeeded();
      updatePets(dt);
      updateEntities(dt);
      updatePetRemains(dt);
      updateWorld(dt);
      updateCombatFeedback(dt);
      if (state.mode === 'dungeon') {
        const exitObj = state.objects.find(o => o.kind === 'exit');
        if (exitObj && Math.abs(state.player.x - 3) < 1.1 && Math.abs(state.player.y - 9.5) < 1.7) leaveDungeon();
      }
    }
  }

  syncAllDisplay();
  tickInvariants(dt);
  syncRegistry(state);
}
