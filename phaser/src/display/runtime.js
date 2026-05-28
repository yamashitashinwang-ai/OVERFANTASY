// Shared mutable Phaser display state. All display modules read/write through
// this single object so cross-module assignments work despite ES module
// "live bindings" being read-only for primitives.

export const display = {
  // Phaser scene reference (set once in GameScene.create)
  pScene: null,

  // Persistent display GameObjects
  playerCircle: null,
  weaponGfx: null,
  arrowGfx: null,
  effectsGfx: null,
  hpBarsGfx: null,
  pickupsGfx: null,
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
