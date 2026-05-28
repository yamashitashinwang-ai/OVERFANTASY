// Scene-bound helpers extracted from GameScene. Aim math, world tickers,
// pause-menu plumbing, modal-action gating — all the bits that the scene
// orchestrates but doesn't need to define inline.

import DATA from '../data.js';
import { state, runtime } from '../runtime/state.js';
import { uiState, isPlaying, isMenuOpen, isPaused } from '../runtime/ui-state.js';
import { clamp, normalize as mathNormalize } from '../domain/math.js';
import { schedulePeriodic, scheduleOnce } from '../runtime/timers.js';
import { updateQuestProgress } from '../domain/quest.js';
import { updateMpRegen, learnMagicFromInput } from '../domain/magic.js';
import { worldNews, talkOrUse, helpWounded, handlePetRescue, gift, rest } from '../domain/npc.js';
import { spawnForCurrentScene } from '../domain/dungeon.js';
import { petById } from '../domain/combat/damage.js';
import { bindMovementKeys, bindActions, routeEscape } from '../runtime/input.js';
import { playerAttack, playerDefend, playerDodge } from '../domain/combat/actions.js';
import { beginBowCharge, releaseBowCharge } from '../domain/combat/bow.js';
import { toggleBackpack } from '../ui/backpack.js';
import { closeShopPanel } from '../ui/shop.js';
import { closeForgePanel } from '../ui/forge.js';
import { openMagicPanel, closeMagicPanel, refreshMagicPanel } from '../ui/magic.js';
import { openCurrentQuestPanel, closeQuestPanel } from '../ui/quest.js';
import { renderMainMenu } from '../ui/menus.js';
import { htmlCache } from '../ui/cache.js';
import { get } from '../ui/dom.js';

const { regions } = DATA;

export function playerAimAngle() {
  return Math.atan2(runtime.aimVector.y, runtime.aimVector.x);
}

export function normalizeWithAim(dx, dy) {
  return mathNormalize(dx, dy, runtime.aimVector);
}

export function livingCount(species) {
  return state.entities.filter(e => e.alive && e.species === species).length;
}

export function strongestPetAggro(e) {
  let best = null;
  let bestValue = 0;
  for (const [petId, value] of Object.entries(e.petAggro || {})) {
    const pet = petById(petId);
    if (pet && value > bestValue) {
      best = pet;
      bestValue = value;
    }
  }
  return { pet: best, value: bestValue };
}

// Monotonic world clock + quest/MP regen tickers. All other recurring events
// run on Phaser timers scheduled in installWorldTimers().
export function updateWorld(dt) {
  state.time += dt;
  updateQuestProgress(dt);
  updateMpRegen(dt);
}

// Install the recurring world tickers once the GameScene is up. Each timer is
// either schedulePeriodic (fixed interval) or self-rescheduling scheduleOnce
// (interval varies).
export function installWorldTimers(scene) {
  // Hate decay: every 24s in-game.
  schedulePeriodic(scene, 24000, () => {
    for (const r of Object.values(regions)) {
      r.hate = clamp(r.hate - 1, 0, 100);
    }
  });

  // World news ticker: random 42..70s interval, only fires while in world mode.
  const scheduleNews = () => {
    const intervalMs = (42 + Math.random() * 28) * 1000;
    scheduleOnce(scene, intervalMs, () => {
      if (state.mode === 'world') worldNews(true);
      scheduleNews();
    });
  };
  scheduleNews();

  // Monster spawn ticker: 5.5s in demon scene, 7.5s elsewhere.
  const scheduleSpawn = () => {
    const intervalMs = (state.scene === 'demon' ? 5.5 : 7.5) * 1000;
    scheduleOnce(scene, intervalMs, () => {
      spawnForCurrentScene();
      scheduleSpawn();
    });
  };
  scheduleSpawn();
}

export function openPauseMenu() {
  if (!isPlaying()) return;
  uiState.appMode = 'paused';
  if (runtime.pSceneRef) {
    runtime.pSceneRef.scene.launch('PauseScene');
    runtime.pSceneRef.scene.pause();
  }
}

export function closePauseMenu() {
  uiState.appMode = 'playing';
}

// Gate DOM action buttons: any modal panel open or non-playing mode should
// swallow the event so the world doesn't receive it.
export function blockWorldAction(event) {
  if (!uiState.backpackOpen && !uiState.questOpen && !uiState.shopOpen && !uiState.forgeOpen && !uiState.magicOpen && isPlaying()) return false;
  event.preventDefault();
  return true;
}

const TILE = 32;

export function installPointerInputs(scene) {
  scene.input.mouse.disableContextMenu();
  scene.input.on('pointermove', (pointer) => {
    const wx = pointer.worldX / TILE;
    const wy = pointer.worldY / TILE;
    runtime.aimVector = normalizeWithAim(wx - state.player.x, wy - state.player.y);
    runtime.aimWorld = { x: wx, y: wy };
  });
  scene.input.on('pointerdown', (pointer) => {
    const wx = pointer.worldX / TILE;
    const wy = pointer.worldY / TILE;
    runtime.aimVector = normalizeWithAim(wx - state.player.x, wy - state.player.y);
    runtime.aimWorld = { x: wx, y: wy };
    if (!isPlaying() || uiState.backpackOpen || uiState.questOpen || uiState.shopOpen || uiState.forgeOpen || uiState.magicOpen) return;
    if (pointer.leftButtonDown()) {
      if (!beginBowCharge()) playerAttack();
    }
    if (pointer.rightButtonDown()) playerDefend();
  });
  scene.input.on('pointerup', (pointer) => {
    if (pointer.leftButtonReleased()) releaseBowCharge();
  });
}

export function installButtonHandlers() {
  const handlers = {
    btnTalk: event => { if (!blockWorldAction(event)) { if (!handlePetRescue() && !helpWounded()) talkOrUse(); } },
    btnAttack: event => { if (!blockWorldAction(event)) playerAttack(); },
    btnDefend: event => { if (!blockWorldAction(event)) playerDefend(); },
    btnDodge: event => { if (!blockWorldAction(event)) playerDodge(); },
    btnGift: event => { if (!blockWorldAction(event)) gift(); },
    btnRest: event => { if (!blockWorldAction(event)) rest(); },
    btnBackpack: event => {
      if (!isPlaying() || uiState.questOpen || uiState.shopOpen || uiState.forgeOpen || uiState.magicOpen) { event.preventDefault(); return; }
      toggleBackpack();
    },
    btnMagic: event => {
      if (!isPlaying() || uiState.backpackOpen || uiState.questOpen || uiState.shopOpen || uiState.forgeOpen) { event.preventDefault(); return; }
      openMagicPanel('book');
    }
  };
  for (const [id, fn] of Object.entries(handlers)) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  }
}

const modalKey = () =>
  uiState.backpackOpen ? 'backpack' :
  uiState.questOpen ? 'quest' :
  uiState.shopOpen ? 'shop' :
  uiState.forgeOpen ? 'forge' :
  uiState.magicOpen ? 'magic' :
  isPaused() ? 'pause' : null;

export function installKeyBindings(scene) {
  runtime.mvKeys = bindMovementKeys(scene);

  const modalClosers = {
    backpack: () => toggleBackpack(false),
    quest:    () => closeQuestPanel(),
    shop:     () => closeShopPanel(),
    forge:    () => closeForgePanel(),
    magic:    () => closeMagicPanel(),
    pause:    () => closePauseMenu()
  };

  bindActions(scene, {
    'B':   () => { if (isPlaying() && !uiState.questOpen && !uiState.shopOpen && !uiState.forgeOpen && !uiState.magicOpen) toggleBackpack(); },
    'J':   () => { if (isPlaying() && !uiState.backpackOpen && !uiState.shopOpen && !uiState.forgeOpen && !uiState.magicOpen) openCurrentQuestPanel(); },
    'F':   () => { if (isPlaying() && !uiState.backpackOpen && !uiState.questOpen && !uiState.shopOpen && !uiState.forgeOpen && !uiState.magicOpen) openMagicPanel('book'); },
    'E':   () => { if (isPlaying() && !modalKey()) { if (!handlePetRescue() && !helpWounded()) talkOrUse(); } },
    'G':   () => { if (isPlaying() && !modalKey()) gift(); },
    'R':   () => { if (isPlaying() && !modalKey()) rest(); },
    'ESC': () => {
      if (isMenuOpen()) {
        if (uiState.menuView !== 'main') {
          uiState.menuView = 'main';
          uiState.selectedSaveId = null;
          uiState.pendingDeleteSaveId = null;
          htmlCache.menu = '';
          renderMainMenu();
        }
        return;
      }
      routeEscape(modalKey, modalClosers, () => { if (isPlaying()) openPauseMenu(); });
    }
  });

  // Magic panel's <input> captures focus; bind Enter/Esc on that element.
  get.magicPanelEl?.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (!e.target?.matches?.('[data-magic-input]')) return;
    if (k === 'escape') { closeMagicPanel(); e.preventDefault(); }
    else if (k === 'enter') {
      uiState.magicInput = e.target.value;
      learnMagicFromInput(uiState.magicInput);
      uiState.magicInput = '';
      refreshMagicPanel();
      e.preventDefault();
    }
  });
}
