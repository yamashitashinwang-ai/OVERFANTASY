import { state } from '../../../runtime/state.ts';
import { uiState, isPlaying } from '../../../runtime/ui-state.ts';
import { hasCorruptionControlLock } from '../../corruption.ts';
import type { ActorState } from '../../types.ts';

export function attackEntityFilter(e: ActorState): boolean {
  if (state.player.monsterForm) return e.faction !== "monster";
  return true;
}

export function canUseWorldActions() {
  return isPlaying() && !uiState.backpackOpen && !uiState.questOpen
    && !uiState.shopOpen && !uiState.forgeOpen && !uiState.magicOpen
    && !hasCorruptionControlLock();
}
