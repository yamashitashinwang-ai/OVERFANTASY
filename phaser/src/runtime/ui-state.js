// Shared scene-state for UI modules. Single mutable namespace so ui/*.js and
// scenes/Game.js can both read and write without each having to expose its
// own getter/setter pair.
//
// The `appMode` field is *legacy*. Mode is now derived from Phaser scene
// activity: see `isMenuOpen()` / `isPaused()` / `isPlaying()` below. We keep
// the field as a fallback for the boot window (before runtime.pSceneRef is
// wired) and as a write target so old setters don't error out.

import { runtime } from './state.js';

// Engine-native mode predicates — read from Phaser's SceneManager. The
// `uiState.appMode` check covers the brief window where a scene has just
// scheduled `.launch('MenuScene')` / `.launch('PauseScene')` but the new
// scene hasn't finished its create() lifecycle yet (its `isActive` returns
// false until the next frame).
export function isMenuOpen() {
  if (uiState.appMode === 'menu') return true;
  const s = runtime.pSceneRef;
  if (s?.scene?.isActive) return s.scene.isActive('MenuScene');
  return false;
}
export function isPaused() {
  if (uiState.appMode === 'paused') return true;
  const s = runtime.pSceneRef;
  if (s?.scene?.isActive) return s.scene.isActive('PauseScene');
  return false;
}
export function isPlaying() {
  return !isMenuOpen() && !isPaused();
}
//
// Once the multi-scene split lands (Menu/Hud/Pause/Panels scenes), these
// flags collapse: `backpackOpen` becomes `scene.isActive('Backpack')` etc.

export const uiState = {
  appMode: 'menu',            // 'menu' | 'playing' | 'paused'
  menuView: 'main',           // 'main' | 'race' | 'load' | 'help' | 'language'

  // Modal panel open flags + per-panel state
  backpackOpen: false,
  backpackCategory: 'consumables',
  backpackSelected: null,

  questOpen: false,
  questMode: 'guild',         // 'guild' | 'npc' | 'current'
  questNpcName: null,

  shopOpen: false,
  shopTab: 'buy',             // 'buy' | 'sell'

  forgeOpen: false,
  forgeTab: 'ring',           // 'ring' | 'material' | 'weapon'
  forgeSelectedMaterial: null,
  forgeWeaponCategory: '剑',
  forgeSelectedWeapon: null,

  magicOpen: false,
  magicMode: 'book',          // 'book' | 'study'
  magicPanelTitle: '魔法',
  magicInput: '',

  selectedSaveId: null,
  pendingDeleteSaveId: null,
  currentSaveId: null
};
