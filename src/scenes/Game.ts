import Phaser from 'phaser';
import DATA from '../data.ts';
import {
  initDisplay, rebuildDisplay, syncAllDisplay, syncStateFromBodies, zeroAllVelocities
} from '../display/index.ts';
import { updateEntities, updatePetRemains, updatePets } from '../domain/ai.ts';
import { updateCombatFeedback } from '../domain/combat/actions.ts';
import { leaveDungeon } from '../domain/dungeon.ts';
import { resetGameState, saveCurrentGame } from '../domain/game-flow.ts';
import { updatePlayer } from '../domain/player.ts';
import { Events, bus } from '../runtime/events.ts';
import {
  tile, W, H, worldW, worldH, viewW, viewH,
  magicChantTimeScale, backpackCategories
} from '../runtime/constants.ts';
import { seedRegistry, syncRegistry } from '../runtime/registry.ts';
import { runtime, state } from '../runtime/state.ts';
import { installPlayerCooldowns, tickPlayerCooldowns } from '../runtime/player-cooldowns.ts';
import { isPlaying, uiState } from '../runtime/ui-state.ts';
import { applyLanguage, clearLanguageRenderCaches } from '../ui/dom-chrome.ts';
import { renderGearPanel } from '../ui/gear.ts';
import { attachLogPanel } from '../ui/log.ts';
import { attachStatsPanel } from '../ui/stats.ts';
import { attachGearPanel } from '../ui/gear.ts';
import { renderStats } from '../ui/stats.ts';
import { attachToastPanel } from '../ui/toast.ts';
import { attachAllPanels } from '../ui/wire.ts';
import {
  closePauseMenu, installButtonHandlers, installKeyBindings, installPointerInputs, installWorldTimers, updateWorld
} from './game-scene-helpers.ts';
import { tickInvariants } from '../runtime/invariants.ts';
import { hasCorruptionControlLock, updateCorruption } from '../domain/corruption.ts';
import { updateDeathSystem } from '../domain/death.ts';

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
export { renderStats } from '../ui/stats.ts';
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
        import('../runtime/log.ts')
      ]).then(([logMod]) => {
        window.__dumpLogs = logMod.dumpLogs;
        window.__clearLogs = logMod.clearLogs;
        window.__setLogPattern = logMod.setLogPattern;
        // Auto-enable events+warns+errors so users see useful output by default
        logMod.enableDefaultPattern();
      });
      Promise.all([
        import('../domain/inventory.ts'),
        import('../domain/economy.ts'),
        import('../domain/quest.ts'),
        import('../domain/magic.ts'),
        import('../domain/npc.ts'),
        import('../domain/dungeon.ts'),
        import('../domain/combat/actions.ts'),
        import('../domain/combat/damage.ts'),
        import('../domain/combat/bow.ts'),
        import('../domain/combat/weapon.ts'),
        import('../domain/combat/targeting.ts'),
        import('../domain/player.ts'),
        import('../domain/corruption.ts'),
        import('../domain/world.ts'),
        import('../domain/world-spawn.ts'),
        import('../domain/ai.ts'),
        import('../runtime/state.ts'),
        import('./game-scene-helpers.ts'),
        import('../display/index.ts'),
        import('../ui/backpack.ts'),
        import('../ui/quest.ts'),
        import('../ui/shop.ts'),
        import('../ui/forge.ts'),
        import('../ui/magic.ts')
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
    const subs: Array<[string, (...args: unknown[]) => void]> = [];
    const onLang = () => {
      applyLanguage();
      clearLanguageRenderCaches();
      renderStats();
      renderGearPanel();
    };
    const onResume = () => { closePauseMenu(); };
    const onPanelClose = (payload: { id?: string; action?: string } = {}) => {
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

  update(_time: number, delta: number) {
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
        updateDeathSystem(dt);
        updateCorruption(dt);
        if (!hasCorruptionControlLock()) updatePlayer(dt);
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
