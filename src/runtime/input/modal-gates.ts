import { hasCorruptionControlLock } from '../../domain/corruption.ts';
import { uiState, isPaused, isPlaying } from '../ui-state.ts';

// Gate DOM action buttons: any modal panel open or non-playing mode should
// swallow the event so the world doesn't receive it.
export function blockWorldAction(event: Event): boolean {
  if (!uiState.backpackOpen && !uiState.questOpen && !uiState.shopOpen && !uiState.forgeOpen && !uiState.magicOpen && isPlaying() && !hasCorruptionControlLock()) return false;
  event.preventDefault();
  return true;
}

export function worldPointerBlocked(): boolean {
  return !isPlaying() || hasCorruptionControlLock()
    || uiState.backpackOpen || uiState.questOpen || uiState.shopOpen
    || uiState.forgeOpen || uiState.magicOpen;
}

export const modalKey = () =>
  uiState.backpackOpen ? 'backpack' :
  uiState.questOpen ? 'quest' :
  uiState.shopOpen ? 'shop' :
  uiState.forgeOpen ? 'forge' :
  uiState.magicOpen ? 'magic' :
  isPaused() ? 'pause' : null;
