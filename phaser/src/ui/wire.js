// Wires up the click/input listeners for every HTML panel. Called once from
// GameScene.create(). Each listener routes to domain services + ui re-renders.
// No game logic lives in this file — it is purely dispatch.

import { state } from '../scenes/Game.js';
import { uiState } from '../runtime/ui-state.js';
import { htmlCache } from './cache.js';
import { get } from './dom.js';
import { equipGear, adoptPetFromMaterial } from '../domain/inventory.js';
import { buyPotion, buyArrows, forgeRing, forgeMaterial, forgeWeapon, sellMaterial } from '../domain/economy.js';
import { isNearAction } from '../domain/npc.js';
import { learnMagicFromInput, beginMagicCast } from '../domain/magic.js';
import { acceptMajorQuest, settleMajorQuest, acceptSmallQuest, settleSmallQuest, activeSmallQuestFor } from '../domain/quest.js';
import { chatWithNpc } from '../domain/npc.js';
import { setLanguage } from '../domain/i18n.js';
import { renderBackpack, toggleBackpack, useBackpackItem, toggleBackpackGear } from './backpack.js';
import { closeShopPanel, refreshShopPanel } from './shop.js';
import { closeForgePanel, refreshForgePanel } from './forge.js';
import { closeMagicPanel, refreshMagicPanel } from './magic.js';
import { closeQuestPanel, renderQuestPanel } from './quest.js';
import { renderMainMenu } from './menus.js';
import {
  // facades still hosted in Game.js
  log, toast, saveCurrentGame,
  startNewGame, continueLatestSave, startLoadedSave, deleteSaveSlot,
  blockWorldAction
} from '../scenes/Game.js';

export function attachAllPanels() {
  get.gearPanelEl.addEventListener('click', event => {
    if (blockWorldAction(event)) return;
    const button = event.target.closest('button[data-gear]');
    const materialButton = event.target.closest('button[data-material]');
    if (button) { equipGear(button.dataset.gear); return; }
    if (!materialButton) return;
    const name = materialButton.dataset.material;
    const action = materialButton.dataset.action;
    if (action === 'sell') {
      if (!isNearAction('shop')) { toast('需要靠近商店才能出售素材。'); return; }
      const gold = sellMaterial(name, 1);
      if (gold > 0) log(`卖出${name}，获得${gold}G。`);
    }
    if (action === 'forge') forgeMaterial(name, materialButton.dataset.slot);
    if (action === 'adoptPet') adoptPetFromMaterial(name);
  });

  // Backpack/Quest/Shop/Forge/Magic click handlers now live in their dedicated
  // Phaser scenes — see scenes/PanelScenes.js. wire.js retains only the gear
  // sidebar (HTML-only) and the main menu.

  get.mainMenuEl.addEventListener('click', event => {
    const button = event.target.closest('button[data-menu-action]');
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
