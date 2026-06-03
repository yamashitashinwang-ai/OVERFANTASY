import { runtime } from '../../runtime/state.ts';
import { uiState, isPlaying } from '../../runtime/ui-state.ts';
import { hasCorruptionControlLock } from '../../domain/corruption.ts';

export function openPauseMenu() {
  if (!isPlaying() || hasCorruptionControlLock()) return;
  uiState.appMode = 'paused';
  if (runtime.pSceneRef) {
    runtime.pSceneRef.scene.launch('PauseScene');
    runtime.pSceneRef.scene.pause();
  }
}

export function closePauseMenu() {
  uiState.appMode = 'playing';
}
