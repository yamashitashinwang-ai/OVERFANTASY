import Phaser from 'phaser';
import { saveCurrentGame } from '../../domain/game-flow.ts';
import { bus, Events } from '../../runtime/events.ts';
import { runtime } from '../../runtime/state.ts';
import { uiState } from '../../runtime/ui-state.ts';
import { applyLanguage, clearLanguageRenderCaches } from '../../ui/dom-chrome.ts';
import { closePauseMenu } from '../game-scene-helpers.ts';

export function installGameSceneBusHandlers(scene: Phaser.Scene) {
  const subs: Array<[string, (...args: unknown[]) => void]> = [];
  const onLang = () => {
    applyLanguage();
    clearLanguageRenderCaches();
  };
  const onResume = () => { closePauseMenu(); };
  const onPanelClose = (payload: { id?: string; action?: string } = {}) => {
    if (payload?.id !== 'pause') return;
    if (payload.action === 'save') saveCurrentGame(true);
    if (payload.action === 'main') {
      saveCurrentGame(false);
      uiState.appMode = 'menu';
      scene.scene.launch('MenuScene');
      scene.scene.pause();
    }
  };

  bus.on(Events.LANGUAGE_CHANGED, onLang); subs.push([Events.LANGUAGE_CHANGED, onLang]);
  bus.on(Events.GAME_RESUMED, onResume); subs.push([Events.GAME_RESUMED, onResume]);
  bus.on(Events.PANEL_CLOSE, onPanelClose); subs.push([Events.PANEL_CLOSE, onPanelClose]);

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    for (const [event, handler] of subs) bus.off(event, handler);
    runtime.pSceneRef = null;
  });
}
