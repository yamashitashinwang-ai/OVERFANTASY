// Wires up the click/input listeners for every HTML panel. Called once from
// GameScene.create(). Each listener routes to domain services + ui re-renders.
// No game logic lives in this file — it is purely dispatch.

import { uiState } from '../runtime/ui-state.ts';
import { htmlCache } from './cache.ts';
import { get } from './dom.ts';
import { setLanguage } from '../domain/i18n.ts';
import { renderMainMenu } from './menus.ts';
import { startNewGame, continueLatestSave, startLoadedSave, deleteSaveSlot } from '../domain/game-flow.ts';

export function attachAllPanels() {
  // Backpack/Quest/Shop/Forge/Magic/Character click handlers live in their
  // dedicated Phaser scenes. This legacy wire keeps only the main menu.

  get.mainMenuEl.addEventListener('click', (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>('button[data-menu-action]');
    if (!button) return;
    const action = button.dataset.menuAction;
    const saveId = button.dataset.saveId;
    if (action === 'new') uiState.menuView = 'race';
    if (action === 'startRace') startNewGame(button.dataset.race || '人类');
    if (action === 'continue') continueLatestSave();
    if (action === 'load') { uiState.menuView = 'load'; uiState.selectedSaveId = null; uiState.pendingDeleteSaveId = null; }
    if (action === 'help') uiState.menuView = 'help';
    if (action === 'language') uiState.menuView = 'language';
    if (action === 'setLanguage') setLanguage(button.dataset.language || 'zh');
    if (action === 'main') { uiState.menuView = 'main'; uiState.selectedSaveId = null; uiState.pendingDeleteSaveId = null; }
    if (action === 'selectSave') { uiState.selectedSaveId = saveId; uiState.pendingDeleteSaveId = null; }
    if (action === 'loadSelected') startLoadedSave(saveId);
    if (action === 'askDelete') uiState.pendingDeleteSaveId = saveId;
    if (action === 'cancelDelete') uiState.pendingDeleteSaveId = null;
    if (action === 'confirmDelete') deleteSaveSlot(saveId);
    // Skip the re-render when the action started a game — MenuScene has
    // already closed and re-rendering would remove its `hidden` class and
    // leave the menu covering the canvas.
    if (action !== 'startRace' && action !== 'continue' && action !== 'loadSelected') {
      htmlCache.menu = '';
      renderMainMenu();
    }
  });

  // PauseScene owns its own click handler (sees data-pause-action and emits
  // PANEL_CLOSE on the bus). GameScene's create() subscribes and routes the
  // 'save' / 'main' actions, so no listener is needed here.
}
