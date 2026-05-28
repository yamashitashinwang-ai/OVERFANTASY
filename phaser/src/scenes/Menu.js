// MenuScene — modal overlay scene for the main menu (and load / help /
// language / race-select sub-views). Runs as a parallel overlay on top of a
// paused GameScene, mirroring PauseScene's pattern.
//
// Engine-native replacement for the legacy `appMode === 'menu'` flag. The
// Phaser SceneManager handles pause/resume/transition transparently.

import Phaser from 'phaser';
import { bus, Events } from '../runtime/events.js';
import { uiState } from '../runtime/ui-state.js';
import { htmlCache } from '../ui/cache.js';
import { get } from '../ui/dom.js';
import { renderMainMenu } from '../ui/menus.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    // Hide modal panels in case any were left visible.
    get.backpackEl.classList.add('hidden');
    get.questPanelEl.classList.add('hidden');
    get.shopPanelEl.classList.add('hidden');
    get.forgePanelEl.classList.add('hidden');
    get.magicPanelEl.classList.add('hidden');
    get.pauseMenuEl.classList.add('hidden');

    uiState.appMode = 'menu';
    uiState.menuView = 'main';
    htmlCache.menu = '';
    renderMainMenu();

    // ESC inside the menu drops a submenu back to the main view.
    this.input.keyboard.on('keydown-ESC', () => {
      if (uiState.menuView !== 'main') {
        uiState.menuView = 'main';
        uiState.selectedSaveId = null;
        uiState.pendingDeleteSaveId = null;
        htmlCache.menu = '';
        renderMainMenu();
      }
    });

    // Re-render on language change.
    this._langSub = () => { htmlCache.menu = ''; renderMainMenu(); };
    bus.on(Events.LANGUAGE_CHANGED, this._langSub);

    // When game logic signals a new/loaded game, fade the menu away and resume
    // GameScene. Both signals emitted by Game.js's startNewGame / startLoadedSave.
    this._gameNewSub = () => this.close();
    this._gameLoadedSub = () => this.close();
    bus.on(Events.GAME_NEW, this._gameNewSub);
    bus.on(Events.GAME_LOADED, this._gameLoadedSub);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
  }

  close() {
    get.mainMenuEl.classList.add('hidden');
    uiState.appMode = 'playing';
    this.scene.resume('GameScene');
    this.scene.stop();
  }

  cleanup() {
    if (this._langSub) bus.off(Events.LANGUAGE_CHANGED, this._langSub);
    if (this._gameNewSub) bus.off(Events.GAME_NEW, this._gameNewSub);
    if (this._gameLoadedSub) bus.off(Events.GAME_LOADED, this._gameLoadedSub);
  }
}
