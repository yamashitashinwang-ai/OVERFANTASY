import type { DisplayState } from "./types.ts";

export const display: DisplayState = {
  // Phaser scene reference (set once in GameScene.create)
  pScene: null,

  // Persistent display GameObjects
  playerCircle: null,
  playerSprite: null,
  playerRig: null,
  weaponGfx: null,
  corruptionGfx: null,
  arrowGfx: null,
  effectsGfx: null,
  hpBarsGfx: null,
  pickupsGfx: null,
  collisionDebugGfx: null,
  collisionDebugText: null,
  collisionDebugEnabled: false,
  petRemainsGfx: null,

  // HUD (fixed-to-camera) elements
  hudBg: null,
  hudAreaText: null,
  hudWeaponText: null,
  hudBarsGfx: null,
  hudCooldownText: null,
  hpLabel: null,
  mpLabel: null,
  staminaLabel: null,
  chantBarGfx: null,
  chantText: null,
  exitHintText: null,
  monsterFormBanner: null,
  debugHudBg: null,
  debugHudText: null,
  _debugFps: null,

  // Per-entity / per-object display maps
  entityDisplayMap: new Map(),
  objectDisplayMap: new Map(),
  petDisplayMap: new Map(),

  // Tilemap + tile texture indexing
  activeMap: null,
  activeLayer: null,
  tileTypeList: null,
  tileIndexMap: null,

  // Arcade Physics groups + colliders
  entitiesGroup: null,
  petsGroup: null,
  staticBuildingsGroup: null,
  mapCollider: null,
  playerBuildingCollider: null,
  entityMapCollider: null,
  entityBuildingCollider: null,
  petMapCollider: null,
  petBuildingCollider: null
};
