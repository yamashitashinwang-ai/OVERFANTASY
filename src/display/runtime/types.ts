import type Phaser from "phaser";
import type { ActorState, PetState, WorldObjectState } from "../../domain/types.ts";
import type { PlayerRig } from "../player-rig.ts";

export type PhysicsArc = Phaser.GameObjects.Arc & {
  _hitTweenActive?: boolean;
};

export type PhysicsRectangle = Phaser.GameObjects.Rectangle;

export interface ActorDisplay {
  entity?: ActorState;
  circle: PhysicsArc;
  sprite?: Phaser.GameObjects.Sprite;
}

export interface ObjectDisplay {
  object: WorldObjectState;
  sprite: Phaser.GameObjects.Image;
  collisionRects: PhysicsRectangle[];
  labelBg: Phaser.GameObjects.Rectangle;
  labelText: Phaser.GameObjects.Text;
}

export interface PetDisplay {
  pet: PetState;
  circle: PhysicsArc;
  sprite?: Phaser.GameObjects.Sprite;
}

export interface DisplayState {
  pScene: Phaser.Scene | null;
  playerCircle: PhysicsArc | null;
  playerSprite: Phaser.GameObjects.Sprite | null;
  playerRig: PlayerRig | null;
  weaponGfx: Phaser.GameObjects.Graphics | null;
  corruptionGfx: Phaser.GameObjects.Graphics | null;
  arrowGfx: Phaser.GameObjects.Graphics | null;
  effectsGfx: Phaser.GameObjects.Graphics | null;
  hpBarsGfx: Phaser.GameObjects.Graphics | null;
  pickupsGfx: Phaser.GameObjects.Graphics | null;
  collisionDebugGfx: Phaser.GameObjects.Graphics | null;
  collisionDebugText: Phaser.GameObjects.Text | null;
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
