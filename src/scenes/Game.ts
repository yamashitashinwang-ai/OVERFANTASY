import Phaser from 'phaser';
import DATA from '../data.ts';
import { initDisplay, rebuildDisplay } from '../display/index.ts';
import { resetGameState } from '../domain/game-flow.ts';
import {
  tile, W, H, worldW, worldH, viewW, viewH,
  magicChantTimeScale, backpackCategories
} from '../runtime/constants.ts';
import { seedRegistry } from '../runtime/registry.ts';
import { runtime, state } from '../runtime/state.ts';
import { installPlayerCooldowns } from '../runtime/player-cooldowns.ts';
import { uiState } from '../runtime/ui-state.ts';
import { applyLanguage } from '../ui/dom-chrome.ts';
import { attachToastPanel } from '../ui/toast.ts';
import { attachAllPanels } from '../ui/wire.ts';
import {
  installKeyBindings, installPointerInputs, installWorldTimers
} from './game-scene-helpers.ts';
import { installGameSceneBusHandlers } from './game-scene/bus-handlers.ts';
import { installGameSceneDevtools } from './game-scene/devtools.ts';
import { updateGameSceneFrame } from './game-scene/frame.ts';

// ── Re-exports for legacy reverse-imports ──────────────────────────────
export { tile, W, H, worldW, worldH, viewW, viewH, magicChantTimeScale, backpackCategories };
export const colors = DATA.colors;
export const magicCatalog = DATA.magicCatalog;
export const graveMaxDecay = DATA.graveMaxDecay;

export { bowChargeProgress, bowShotStats, isBowWeapon, dropEmbeddedArrows } from '../domain/combat/bow.ts';
export { attackEntityFilter, canUseWorldActions } from '../domain/combat/targeting.ts';
export { currentWeapon, refreshCombatStats, hasPathosEffect } from '../domain/combat/weapon.ts';
export { loadScene } from '../domain/dungeon.ts';
export {
  materialMod, weaponForgeRecipe, forgeIngredientCount, hasForgeIngredients,
  consumeForgeIngredients
} from '../domain/economy.ts';
export {
  startNewGame, startLoadedSave, continueLatestSave, deleteSaveSlot,
  saveCurrentGame, autoSave, ensureStateShape
} from '../domain/game-flow.ts';
export { addResource } from '../domain/inventory.ts';
export { clamp, dist, formatNumber, normalize } from '../domain/math.ts';
export { npcMemoryFor, npcMemoryKey, ensureNpcMemoryOwnership, adjustNpcMemory } from '../domain/npc-memory.ts';
export {
  useObject, handlePetMemorial, openGuildPanel, openNpcQuestPanel
} from '../domain/npc.ts';
export { strongestPetAggro } from '../domain/ai.ts';
export { mapBounds, currentPetScene, currentAreaName } from '../domain/world.ts';
export { readMovementVector, isRunning, dodgePressed } from '../runtime/input.ts';
export { isPlaying } from '../runtime/ui-state.ts';
export { log, toast } from '../runtime/services.ts';
export {
  runtime, state, initialState, initialRegions, logs, flyingArrows,
  magicEffects, getAttackEffect, setAttackEffect, getBowCharge, setBowCharge,
  getPendingMagicCast, setPendingMagicCast, getHitStopTimer, setHitStopTimer,
  getAimVector, getAimWorld, getMvKeys, getPScene
} from '../runtime/state.ts';
export { applyLanguage, clearLanguageRenderCaches, resetRuntimeUi } from '../ui/dom-chrome.ts';
export { closeMagicPanel } from '../ui/magic.ts';
export {
  panelHeader, modSummary, backpackItems, backpackSelectedItem,
  backpackDetailHtml, forgeEffectText, sellableMaterialEntries,
  materialOptionList, selectedForgeMaterial, forgeSlotButton, armorForgeTarget,
  weaponForgeEntries, weaponForgeCategories, selectedWeaponForgeEntry,
  forgeRequirementHtml, knownMagicCards, questPanelHeader, questObjectiveText,
  questAutoSettlementText, questDetailCard, sellAllMaterials,
  playerRepelsMonsters
} from '../ui/panels-helpers.ts';
export { closeQuestPanel } from '../ui/quest.ts';
export {
  playerAimAngle, normalizeWithAim, livingCount,
  updateWorld, installWorldTimers, openPauseMenu, closePauseMenu,
  blockWorldAction
} from './game-scene-helpers.ts';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {}

  create() {
    initDisplay(this);
    runtime.pSceneRef = this;
    installPlayerCooldowns(state.player);
    installGameSceneDevtools(this);

    attachToastPanel();

    installWorldTimers(this);
    installGameSceneBusHandlers(this);

    installPointerInputs(this);
    attachAllPanels();
    installKeyBindings(this);

    resetGameState();
    uiState.appMode = 'menu';
    uiState.currentSaveId = null;
    applyLanguage();
    rebuildDisplay();
    seedRegistry(this, state);
    this.scene.launch('MenuScene');
    this.scene.pause();
  }

  update(_time: number, delta: number) {
    updateGameSceneFrame(delta);
  }
}
