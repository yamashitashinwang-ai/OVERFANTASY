// Shared mutable Phaser display state. All display modules read/write through
// this single object so cross-module assignments work despite ES module
// "live bindings" being read-only for primitives.

import type Phaser from 'phaser';
import type { ActorState, PetState, WorldObjectState } from '../domain/types.ts';

export type PhysicsArc = Phaser.GameObjects.Arc & {
  _hitTweenActive?: boolean;
};
type PhysicsRectangle = Phaser.GameObjects.Rectangle;

interface ActorDisplay {
  entity?: ActorState;
  circle: PhysicsArc;
  sprite?: Phaser.GameObjects.Sprite;
}

interface ObjectDisplay {
  object: WorldObjectState;
  sprite: Phaser.GameObjects.Image;
  collisionRects: PhysicsRectangle[];
  labelBg: Phaser.GameObjects.Rectangle;
  labelText: Phaser.GameObjects.Text;
}

interface PetDisplay {
  pet: PetState;
  circle: PhysicsArc;
  sprite?: Phaser.GameObjects.Sprite;
}

interface DisplayState {
  pScene: Phaser.Scene | null;
  playerCircle: PhysicsArc | null;
  playerSprite: Phaser.GameObjects.Sprite | null;
  weaponGfx: Phaser.GameObjects.Graphics | null;
  corruptionGfx: Phaser.GameObjects.Graphics | null;
  arrowGfx: Phaser.GameObjects.Graphics | null;
  effectsGfx: Phaser.GameObjects.Graphics | null;
  hpBarsGfx: Phaser.GameObjects.Graphics | null;
  pickupsGfx: Phaser.GameObjects.Graphics | null;
  collisionDebugGfx: Phaser.GameObjects.Graphics | null;
  collisionDebugEnabled: boolean;
  petRemainsGfx: Phaser.GameObjects.Graphics | null;
  hudBg: Phaser.GameObjects.Rectangle | null;
  hudAreaText: Phaser.GameObjects.Text | null;
  hudWeaponText: Phaser.GameObjects.Text | null;
  hudBarsGfx: Phaser.GameObjects.Graphics | null;
  hudCooldownText: Phaser.GameObjects.Text | null;
  hpLabel: Phaser.GameObjects.Text | null;
  mpLabel: Phaser.GameObjects.Text | null;
  staminaLabel: Phaser.GameObjects.Text | null;
  chantBarGfx: Phaser.GameObjects.Graphics | null;
  chantText: Phaser.GameObjects.Text | null;
  exitHintText: Phaser.GameObjects.Text | null;
  monsterFormBanner: Phaser.GameObjects.Text | null;
  debugHudBg: Phaser.GameObjects.Rectangle | null;
  debugHudText: Phaser.GameObjects.Text | null;
  _debugFps: number | null;
  entityDisplayMap: Map<string, ActorDisplay>;
  objectDisplayMap: Map<string, ObjectDisplay>;
  petDisplayMap: Map<string, PetDisplay>;
  activeMap: Phaser.Tilemaps.Tilemap | null;
  activeLayer: Phaser.Tilemaps.TilemapLayer | Phaser.Tilemaps.TilemapGPULayer | null;
  tileTypeList: string[] | null;
  tileIndexMap: Record<string, number> | null;
  entitiesGroup: Phaser.Physics.Arcade.Group | null;
  petsGroup: Phaser.Physics.Arcade.Group | null;
  staticBuildingsGroup: Phaser.Physics.Arcade.StaticGroup | null;
  mapCollider: Phaser.Physics.Arcade.Collider | null;
  playerBuildingCollider: Phaser.Physics.Arcade.Collider | null;
  entityMapCollider: Phaser.Physics.Arcade.Collider | null;
  entityBuildingCollider: Phaser.Physics.Arcade.Collider | null;
  petMapCollider: Phaser.Physics.Arcade.Collider | null;
  petBuildingCollider: Phaser.Physics.Arcade.Collider | null;
}

export const display: DisplayState = {
  // Phaser scene reference (set once in GameScene.create)
  pScene: null,

  // Persistent display GameObjects
  playerCircle: null,
  playerSprite: null,
  weaponGfx: null,
  corruptionGfx: null,
  arrowGfx: null,
  effectsGfx: null,
  hpBarsGfx: null,
  pickupsGfx: null,
  collisionDebugGfx: null,
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
