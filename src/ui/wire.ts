// Wires up the click/input listeners for every HTML panel. Called once from
// GameScene.create(). Each listener routes to domain services + ui re-renders.
// No game logic lives in this file — it is purely dispatch.

import { state } from '../runtime/state.ts';
import { uiState } from '../runtime/ui-state.ts';
import { htmlCache } from './cache.ts';
import { get } from './dom.ts';
import { equipGear, adoptPetFromMaterial } from '../domain/inventory.ts';
import { buyPotion, buyArrows, forgeRing, forgeMaterial, forgeWeapon, sellMaterial } from '../domain/economy.ts';
import { isNearAction } from '../domain/npc.ts';
import { learnMagicFromInput, beginMagicCast } from '../domain/magic.ts';
import { acceptMajorQuest, settleMajorQuest, acceptSmallQuest, settleSmallQuest, activeSmallQuestFor } from '../domain/quest.ts';
import { chatWithNpc } from '../domain/npc.ts';
import { setLanguage } from '../domain/i18n.ts';
import { renderBackpack, toggleBackpack, useBackpackItem, toggleBackpackGear } from './backpack.ts';
import { closeShopPanel, refreshShopPanel } from './shop.ts';
import { closeForgePanel, refreshForgePanel } from './forge.ts';
import { closeMagicPanel, refreshMagicPanel } from './magic.ts';
import { closeQuestPanel, renderQuestPanel } from './quest.ts';
import { renderMainMenu } from './menus.ts';
import { log, toast } from '../runtime/services.ts';
import {
  saveCurrentGame, startNewGame, continueLatestSave, startLoadedSave, deleteSaveSlot
} from '../domain/game-flow.ts';
import { blockWorldAction } from '../scenes/game-scene-helpers.ts';
import type { GearSlot } from '../domain/types.ts';

export function attachAllPanels() {
  get.gearPanelEl.addEventListener('click', (event: MouseEvent) => {
    if (blockWorldAction(event)) return;
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>('button[data-gear]');
    const materialButton = target?.closest<HTMLButtonElement>('button[data-material]');
    if (button) { equipGear(button.dataset.gear); return; }
    if (!materialButton) return;
    const name = materialButton.dataset.material;
    const action = materialButton.dataset.action;
    if (action === 'sell') {
      if (!isNearAction('shop')) { toast('需要靠近商店才能出售素材。'); return; }
      const gold = sellMaterial(name, 1);
      if (gold > 0) log(`卖出${name}，获得${gold}G。`);
    }
    if (action === 'forge') forgeMaterial(name, materialButton.dataset.slot as GearSlot);
    if (action === 'adoptPet') adoptPetFromMaterial(name);
  });

  // Backpack/Quest/Shop/Forge/Magic click handlers now live in their dedicated
  // Phaser scenes — see scenes/PanelScenes.js. wire.js retains only the gear
  // sidebar (HTML-only) and the main menu.

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
