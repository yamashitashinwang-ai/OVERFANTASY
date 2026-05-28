import Phaser from 'phaser';
import DATA from '../data.js';
import {
  initDisplay, rebuildDisplay, syncAllDisplay, syncStateFromBodies, zeroAllVelocities
} from '../display/index.js';
import { updateEntities, updatePetRemains, updatePets } from '../domain/ai.js';
import { updateCombatFeedback } from '../domain/combat/actions.js';
import { leaveDungeon } from '../domain/dungeon.js';
import { resetGameState, saveCurrentGame } from '../domain/game-flow.js';
import { updatePlayer } from '../domain/player.js';
import { Events, bus } from '../runtime/events.js';
import { seedRegistry, syncRegistry } from '../runtime/registry.js';
import { runtime, state } from '../runtime/state.js';
import { installPlayerCooldowns, tickPlayerCooldowns } from '../runtime/player-cooldowns.js';
import { isPlaying, uiState } from '../runtime/ui-state.js';
import { applyLanguage, clearLanguageRenderCaches } from '../ui/dom-chrome.js';
import { renderGearPanel } from '../ui/gear.js';
import { attachLogPanel } from '../ui/log.js';
import { attachStatsPanel } from '../ui/stats.js';
import { attachGearPanel } from '../ui/gear.js';
import { renderStats } from '../ui/stats.js';
import { attachToastPanel } from '../ui/toast.js';
import { attachAllPanels } from '../ui/wire.js';
import {
  closePauseMenu, installButtonHandlers, installKeyBindings, installPointerInputs, installWorldTimers, updateWorld
} from './game-scene-helpers.js';
import { tickInvariants } from '../runtime/invariants.js';

// ── Re-exports for legacy reverse-imports ──────────────────────────────
export const tile = 32;
export const W = 960;
export const H = 640;
export const worldW = 96;
export const worldH = 72;
export const viewW = Math.floor(W / tile);
export const viewH = Math.floor(H / tile);
export const colors = DATA.colors;
export const magicCatalog = DATA.magicCatalog;
export const graveMaxDecay = DATA.graveMaxDecay;
export const magicChantTimeScale = 3.5;
export const backpackCategories = [
  ['consumables', '消耗品'], ['materials', '素材'], ['loot', '战利品'],
  ['equipment', '装备'], ['important', '重要物品']
];

export { bowChargeProgress, bowShotStats, isBowWeapon, dropEmbeddedArrows } from '../domain/combat/bow.js';
export { attackEntityFilter, canUseWorldActions } from '../domain/combat/targeting.js';
export { currentWeapon, refreshCombatStats, hasPathosEffect } from '../domain/combat/weapon.js';
export { loadScene } from '../domain/dungeon.js';
export {
  materialMod, weaponForgeRecipe, forgeIngredientCount, hasForgeIngredients,
  consumeForgeIngredients
} from '../domain/economy.js';
export {
  startNewGame, startLoadedSave, continueLatestSave, deleteSaveSlot,
  saveCurrentGame, autoSave, ensureStateShape
} from '../domain/game-flow.js';
export { addResource } from '../domain/inventory.js';
export { clamp, dist, formatNumber, normalize } from '../domain/math.js';
export { npcMemoryFor, npcMemoryKey, ensureNpcMemoryOwnership } from '../domain/npc-memory.js';
export {
  adjustNpcMemory, useObject, handlePetMemorial, openGuildPanel,
  openNpcQuestPanel
} from '../domain/npc.js';
export { mapBounds, currentPetScene, currentAreaName } from '../domain/world.js';
export { readMovementVector, isRunning, dodgePressed } from '../runtime/input.js';
export { isPlaying } from '../runtime/ui-state.js';
export { log, toast } from '../runtime/services.js';
export {
  runtime, state, initialState, initialRegions, logs, flyingArrows,
  magicEffects, getAttackEffect, setAttackEffect, getBowCharge, setBowCharge,
  getPendingMagicCast, setPendingMagicCast, getHitStopTimer, setHitStopTimer,
  getAimVector, getAimWorld, getMvKeys, getPScene
} from '../runtime/state.js';
export { applyLanguage, clearLanguageRenderCaches, resetRuntimeUi } from '../ui/dom-chrome.js';
export { closeMagicPanel } from '../ui/magic.js';
export {
  panelHeader, modSummary, backpackItems, backpackSelectedItem,
  backpackDetailHtml, forgeEffectText, sellableMaterialEntries,
  materialOptionList, selectedForgeMaterial, forgeSlotButton, armorForgeTarget,
  weaponForgeEntries, weaponForgeCategories, selectedWeaponForgeEntry,
  forgeRequirementHtml, knownMagicCards, questPanelHeader, questObjectiveText,
  questAutoSettlementText, questDetailCard, sellAllMaterials,
  playerRepelsMonsters
} from '../ui/panels-helpers.js';
export { closeQuestPanel } from '../ui/quest.js';
export { renderStats } from '../ui/stats.js';
export {
  playerAimAngle, normalizeWithAim, livingCount, strongestPetAggro,
  updateWorld, installWorldTimers, openPauseMenu, closePauseMenu,
  blockWorldAction
} from './game-scene-helpers.js';


export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {}

  create() {
    // Set up Phaser display resources (graphics objects, HUD text, etc.).
    // All persistent display references live on the shared `D` object so the
    // decoupled modules in src/display/ can mutate / read them.
    initDisplay(this);
    runtime.pSceneRef = this;
    // Make every cooldown field on state.player an accessor backed by the
    // central per-frame cooldown tick.
    installPlayerCooldowns(state.player);
    // Diagnostic hook: expose runtime + state + every domain API on window so
    // E2E probes (`test/probe-*.mjs`) can drive systems directly. Gated to
    // dev mode — Vite strips `import.meta.env.DEV` in production builds.
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      window.__state = state;
      window.__runtime = runtime;
      window.__game = this;
      // Log buffer dump: paste the recent log timeline for support.
      // window.__dumpLogs(200) returns a string you can copy-paste.
      Promise.all([
        import('../runtime/log.js')
      ]).then(([logMod]) => {
        window.__dumpLogs = logMod.dumpLogs;
        window.__clearLogs = logMod.clearLogs;
        window.__setLogPattern = logMod.setLogPattern;
        // Auto-enable events+warns+errors so users see useful output by default
        logMod.enableDefaultPattern();
      });
      Promise.all([
        import('../domain/inventory.js'),
        import('../domain/economy.js'),
        import('../domain/quest.js'),
        import('../domain/magic.js'),
        import('../domain/npc.js'),
        import('../domain/dungeon.js'),
        import('../domain/combat/actions.js'),
        import('../domain/combat/damage.js'),
        import('../domain/combat/bow.js'),
        import('../domain/combat/weapon.js'),
        import('../domain/combat/targeting.js'),
        import('../domain/player.js'),
        import('../domain/world.js'),
        import('../domain/world-spawn.js'),
        import('../domain/ai.js'),
        import('../runtime/state.js'),
        import('./game-scene-helpers.js'),
        import('../display/index.js'),
        import('../ui/backpack.js'),
        import('../ui/quest.js'),
        import('../ui/shop.js'),
        import('../ui/forge.js'),
        import('../ui/magic.js')
      ]).then((mods) => { window.__api = Object.assign({}, ...mods); });
    }

    // Bus-driven UI subscribers: log + toast listen for LOG_APPENDED / TOAST_SHOWN
    // and update their respective DOM elements without domain code ever
    // touching the DOM.
    attachLogPanel();
    attachToastPanel();
    attachStatsPanel();
    attachGearPanel();

    // World tickers (hate decay, news, monster spawns) — driven by Phaser
    // timers instead of dt-accumulation loops.
    installWorldTimers(this);

    // Track bus subscriptions so the SHUTDOWN handler can unbind them.
    const subs = [];
    const onLang = () => {
      applyLanguage();
      clearLanguageRenderCaches();
      renderStats();
      renderGearPanel();
    };
    const onResume = () => { closePauseMenu(); };
    const onPanelClose = (payload) => {
      if (payload?.id !== 'pause') return;
      if (payload.action === 'save') saveCurrentGame(true);
      if (payload.action === 'main') {
        saveCurrentGame(false);
        uiState.appMode = 'menu';
        this.scene.launch('MenuScene');
        this.scene.pause();
      }
    };
    bus.on(Events.LANGUAGE_CHANGED, onLang); subs.push([Events.LANGUAGE_CHANGED, onLang]);
    bus.on(Events.GAME_RESUMED, onResume); subs.push([Events.GAME_RESUMED, onResume]);
    bus.on(Events.PANEL_CLOSE, onPanelClose); subs.push([Events.PANEL_CLOSE, onPanelClose]);

    // SHUTDOWN cleanup — Phaser fires this when a scene stops. Unbind every
    // bus subscriber we registered so cross-scene replay doesn't leak listeners.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      for (const [event, handler] of subs) bus.off(event, handler);
      runtime.pSceneRef = null;
    });

    // Inputs (pointer + DOM buttons + keyboard) live in game-scene-helpers.js.
    installPointerInputs(this);
    installButtonHandlers();
    attachAllPanels();
    installKeyBindings(this);

    // Initialize game state defaults + display, then hand control to MenuScene
    // (overlay). When the player picks New Game / Continue / Load, MenuScene
    // resumes us via bus events.
    resetGameState();
    uiState.appMode = 'menu';
    uiState.currentSaveId = null;
    applyLanguage();
    rebuildDisplay();
    // Seed the Phaser DataManager registry so cross-scene reads can use
    // `this.registry.get('player.hp')` etc. update() will diff and re-publish.
    seedRegistry(this, state);
    this.scene.launch('MenuScene');
    this.scene.pause();
  }

  update(time, delta) {
    const dt = Math.min(0.033, delta / 1000);

    // Physics step (runs in Phaser between scene updates) wrote new body positions.
    // Mirror them into game state so AI sees the latest resolved positions.
    syncStateFromBodies();
    // Zero last-frame's velocities; this frame's AI/input must re-supply them.
    zeroAllVelocities();

    if (isPlaying() && !uiState.backpackOpen && !uiState.questOpen && !uiState.shopOpen && !uiState.forgeOpen && !uiState.magicOpen) {
      if (runtime.hitStopTimer > 0) {
        runtime.hitStopTimer = Math.max(0, runtime.hitStopTimer - dt);
      } else {
        // Player cooldowns tick down here — single canonical decay site,
        // matches original game.js behaviour. See runtime/player-cooldowns.js.
        tickPlayerCooldowns(state.player, dt);
        updatePlayer(dt);
        updatePets(dt);
        updateEntities(dt);
        updatePetRemains(dt);
        updateWorld(dt);
        updateCombatFeedback(dt);
        if (state.mode === 'dungeon') {
          const exitObj = state.objects.find(o => o.kind === 'exit');
          if (exitObj && Math.abs(state.player.x - 3) < 1.1 && Math.abs(state.player.y - 9.5) < 1.7) leaveDungeon();
        }
      }
    }

    // Sync Phaser display objects to game state
    syncAllDisplay();

    // Runtime invariant assertions — fire INVARIANT_BROKEN events when a
    // gameplay assumption fails (e.g. adjacent-monster-must-damage). E2E
    // probes listen for these so a regression fails CI immediately.
    tickInvariants(dt);
    // Mirror tracked player stats into Phaser DataManager so other scenes
    // can subscribe via `this.registry.events.on('changedata-player.hp', …)`.
    syncRegistry(state);

    // All UI rendering is push-driven via bus subscribers; modal panels are
    // their own Phaser scenes (BackpackScene/QuestScene/ShopScene/ForgeScene/
    // MagicScene) launched from open* helpers. update() no longer polls them.
  }
}
