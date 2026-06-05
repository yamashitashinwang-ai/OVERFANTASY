import { restoreGameInputFocus } from '../../runtime/input.ts';
import { runtime } from '../../runtime/state.ts';
import { uiState } from '../../runtime/ui-state.ts';
import { htmlCache } from '../cache.ts';
import { get } from '../dom.ts';
import { renderCareerPanel } from './render.ts';

export function openCareerPanel() {
  const s = runtime.pSceneRef;
  if (!s) return;
  if (s.scene.isActive('CareerScene')) {
    htmlCache.career = '';
    renderCareerPanel();
    return;
  }
  s.scene.launch('CareerScene');
  s.scene.pause();
}

export function closeCareerPanel() {
  const s = runtime.pSceneRef;
  if (s?.scene?.isActive?.('CareerScene')) {
    s.scene.stop('CareerScene');
    s.scene.resume();
    restoreGameInputFocus(s);
  }
  uiState.careerOpen = false;
  get.careerPanelEl.classList.add('hidden');
  htmlCache.career = '';
}
