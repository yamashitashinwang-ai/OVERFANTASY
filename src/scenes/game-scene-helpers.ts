// Scene-bound helpers extracted from GameScene. Aim math, world tickers,
// pause-menu plumbing, modal-action gating — all the bits that the scene
// orchestrates but doesn't need to define inline.

import DATA from '../data.ts';
import type Phaser from 'phaser';
import { state, runtime } from '../runtime/state.ts';
import { uiState, isPlaying, isMenuOpen, isPaused } from '../runtime/ui-state.ts';
import { clamp, normalize as mathNormalize } from '../domain/math.ts';
import { schedulePeriodic, scheduleOnce } from '../runtime/timers.ts';
import { updateQuestProgress } from '../domain/quest.ts';
import { updateMpRegen, learnMagicFromInput } from '../domain/magic.ts';
import { worldNews, talkOrUse, helpWounded, handlePetRescue, gift, rest } from '../domain/npc.ts';
import { spawnForCurrentScene } from '../domain/dungeon.ts';
import { bindMovementKeys, bindActions, routeEscape } from '../runtime/input.ts';
import { playerAttack, playerDefend, playerDodge } from '../domain/combat/actions.ts';
import { beginBowCharge, releaseBowCharge } from '../domain/combat/bow.ts';
import { toggleBackpack } from '../ui/backpack.ts';
import { closeShopPanel } from '../ui/shop.ts';
import { closeForgePanel } from '../ui/forge.ts';
import { openMagicPanel, closeMagicPanel, refreshMagicPanel } from '../ui/magic.ts';
import { openCurrentQuestPanel, closeQuestPanel } from '../ui/quest.ts';
import { renderMainMenu } from '../ui/menus.ts';
import { htmlCache } from '../ui/cache.ts';
import { get } from '../ui/dom.ts';
import { hasCorruptionControlLock } from '../domain/corruption.ts';
import type { Vector2 } from '../domain/types.ts';

const { regions } = DATA;

export function playerAimAngle(): number {
  if (runtime.aimWorld) {
    const dx = runtime.aimWorld.x - state.player.x;
    const dy = runtime.aimWorld.y - state.player.y;
    const len = Math.hypot(dx, dy);
    if (len > 0.02) runtime.aimVector = { x: dx / len, y: dy / len };
  }
  return Math.atan2(runtime.aimVector.y, runtime.aimVector.x);
}

export function normalizeWithAim(dx: number, dy: number): Vector2 {
  return mathNormalize(dx, dy, runtime.aimVector);
}

export function livingCount(species: string): number {
  return state.entities.filter(e => e.alive && e.species === species).length;
}

// Monotonic world clock + quest/MP regen tickers. All other recurring events
// run on Phaser timers scheduled in installWorldTimers().
export function updateWorld(dt: number) {
  state.time += dt;
  updateQuestProgress(dt);
  updateMpRegen(dt);
}

// Install the recurring world tickers once the GameScene is up. Each timer is
// either schedulePeriodic (fixed interval) or self-rescheduling scheduleOnce
// (interval varies).
export function installWorldTimers(scene: Phaser.Scene) {
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
  if (!isPlaying() || hasCorruptionControlLock()) return;
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
export function blockWorldAction(event: Event): boolean {
  if (!uiState.backpackOpen && !uiState.questOpen && !uiState.shopOpen && !uiState.forgeOpen && !uiState.magicOpen && isPlaying() && !hasCorruptionControlLock()) return false;
  event.preventDefault();
  return true;
}

const TILE = 32;

export function installPointerInputs(scene: Phaser.Scene) {
  scene.input.mouse.disableContextMenu();
  const capturePointerAim = (pointer: Phaser.Input.Pointer) => {
    runtime.pointerInside = true;
    const wx = pointer.worldX / TILE;
    const wy = pointer.worldY / TILE;
    runtime.aimVector = normalizeWithAim(wx - state.player.x, wy - state.player.y);
    runtime.aimWorld = { x: wx, y: wy };
  };
  scene.input.on('gameover', () => { runtime.pointerInside = true; });
  scene.input.on('gameout', () => { runtime.pointerInside = false; });
  scene.input.on('pointermove', capturePointerAim);
  scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    capturePointerAim(pointer);
    if (!isPlaying() || hasCorruptionControlLock() || uiState.backpackOpen || uiState.questOpen || uiState.shopOpen || uiState.forgeOpen || uiState.magicOpen) return;
    if (pointer.leftButtonDown()) {
      if (!beginBowCharge()) playerAttack();
    }
    if (pointer.rightButtonDown()) playerDefend();
  });
  scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
    if (!hasCorruptionControlLock() && pointer.leftButtonReleased()) releaseBowCharge();
  });
}

export function installButtonHandlers() {
  const handlers: Record<string, (event: MouseEvent) => void> = {
    btnTalk: (event: MouseEvent) => { if (!blockWorldAction(event)) { if (!handlePetRescue() && !helpWounded()) talkOrUse(); } },
    btnAttack: (event: MouseEvent) => { if (!blockWorldAction(event)) playerAttack(); },
    btnDefend: (event: MouseEvent) => { if (!blockWorldAction(event)) playerDefend(); },
    btnDodge: (event: MouseEvent) => { if (!blockWorldAction(event)) playerDodge(); },
    btnGift: (event: MouseEvent) => { if (!blockWorldAction(event)) gift(); },
    btnRest: (event: MouseEvent) => { if (!blockWorldAction(event)) rest(); },
    btnBackpack: (event: MouseEvent) => {
      if (!isPlaying() || hasCorruptionControlLock() || uiState.questOpen || uiState.shopOpen || uiState.forgeOpen || uiState.magicOpen) { event.preventDefault(); return; }
      toggleBackpack();
    },
    btnMagic: (event: MouseEvent) => {
      if (!isPlaying() || hasCorruptionControlLock() || uiState.backpackOpen || uiState.questOpen || uiState.shopOpen || uiState.forgeOpen) { event.preventDefault(); return; }
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

export function installKeyBindings(scene: Phaser.Scene) {
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
    'B':   () => { if (isPlaying() && !hasCorruptionControlLock() && !uiState.questOpen && !uiState.shopOpen && !uiState.forgeOpen && !uiState.magicOpen) toggleBackpack(); },
    'J':   () => { if (isPlaying() && !hasCorruptionControlLock() && !uiState.backpackOpen && !uiState.shopOpen && !uiState.forgeOpen && !uiState.magicOpen) openCurrentQuestPanel(); },
    'F':   () => { if (isPlaying() && !hasCorruptionControlLock() && !uiState.backpackOpen && !uiState.questOpen && !uiState.shopOpen && !uiState.forgeOpen && !uiState.magicOpen) openMagicPanel('book'); },
    'E':   () => { if (isPlaying() && !hasCorruptionControlLock() && !modalKey()) { if (!handlePetRescue() && !helpWounded()) talkOrUse(); } },
    'G':   () => { if (isPlaying() && !hasCorruptionControlLock() && !modalKey()) gift(); },
    'R':   () => { if (isPlaying() && !hasCorruptionControlLock() && !modalKey()) rest(); },
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
      routeEscape(modalKey, modalClosers, () => { if (isPlaying() && !hasCorruptionControlLock()) openPauseMenu(); });
    }
  });

  // Magic panel's <input> captures focus; bind Enter/Esc on that element.
  get.magicPanelEl?.addEventListener('keydown', (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    const target = e.target as HTMLInputElement | null;
    if (!target?.matches?.('[data-magic-input]')) return;
    if (k === 'escape') { closeMagicPanel(); e.preventDefault(); }
    else if (k === 'enter') {
      uiState.magicInput = target.value;
      learnMagicFromInput(uiState.magicInput);
      uiState.magicInput = '';
      refreshMagicPanel();
      e.preventDefault();
    }
  });
}
