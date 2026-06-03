// Arcade Physics: bodies, colliders, world bounds. Bodies are the source of
// truth for actor positions; game state mirrors them every frame.

import type Phaser from 'phaser';
import { display as D } from './runtime.ts';
import { state } from '../runtime/state.ts';
import { tile } from '../runtime/constants.ts';
import { registerActorMover } from '../runtime/actor-movement.ts';
import { registerActorTeleporter } from '../runtime/display-sync.ts';
import { mapBounds } from '../domain/world.ts';
import { clamp } from '../domain/math.ts';
import type { ActorState } from '../domain/types.ts';
import type { PhysicsArc } from './runtime.ts';

interface DynamicArcadeBody {
  setVelocity(x: number, y: number): void;
  reset(x: number, y: number): void;
  setCircle(radius: number): void;
  setCollideWorldBounds(value: boolean): void;
  setDrag(x: number, y: number): void;
  setBounce(x: number, y: number): void;
  setMaxVelocity(x: number, y: number): void;
}

const dynamicBody = (body: Phaser.GameObjects.GameObject['body'] | null | undefined) =>
  body as DynamicArcadeBody | null;

export function getActorBody(actor: ActorState | null | undefined) {
  if (!actor) return null;
  if (actor === state.player) return dynamicBody(D.playerCircle?.body);
  const ed = D.entityDisplayMap.get(actor.id);
  if (ed?.circle?.body) return dynamicBody(ed.circle.body);
  const pd = D.petDisplayMap.get(actor.id);
  if (pd?.circle?.body) return dynamicBody(pd.circle.body);
  return null;
}

export function moveActor(actor: ActorState, dx: number, dy: number, speed: number, dt: number) {
  // Phaser-native: set body velocity. Arcade physics handles tile + body collisions.
  // Velocity is in pixels/sec; speed is in tiles/sec, so multiply by `tile`.
  const body = getActorBody(actor);
  if (body) {
    body.setVelocity(dx * speed * tile, dy * speed * tile);
    return;
  }
  // Fallback for actors without a body yet (e.g., before first sync).
  const nx = actor.x + dx * speed * dt;
  const ny = actor.y + dy * speed * dt;
  const bounds = mapBounds();
  actor.x = clamp(nx, 0.5, bounds.w - 0.5);
  actor.y = clamp(ny, 0.5, bounds.h - 0.5);
}

registerActorMover(moveActor);

export function syncStateFromBodies() {
  // Source of truth: physics bodies. Mirror their positions back into state.
  if (D.playerCircle?.body) {
    state.player.x = D.playerCircle.x / tile;
    state.player.y = D.playerCircle.y / tile;
  }
  for (const [id, display] of D.entityDisplayMap) {
    if (!display.circle?.body) continue;
    const e = state.entities.find(ent => ent.id === id);
    if (e && e.alive) {
      e.x = display.circle.x / tile;
      e.y = display.circle.y / tile;
    }
  }
  for (const [id, display] of D.petDisplayMap) {
    if (!display.circle?.body) continue;
    const pet = state.pets.find(p => p.id === id);
    // Carried pets are positioned by game logic each frame — don't overwrite from body.
    if (pet && pet.alive && !pet.carried && !pet.injured) {
      pet.x = display.circle.x / tile;
      pet.y = display.circle.y / tile;
    }
  }
}

export function zeroAllVelocities() {
  // Kinematic-style: each frame starts with zero velocity. AI/input set new velocity via moveActor.
  if (D.playerCircle?.body) dynamicBody(D.playerCircle.body)?.setVelocity(0, 0);
  for (const display of D.entityDisplayMap.values()) {
    if (display.circle?.body) dynamicBody(display.circle.body)?.setVelocity(0, 0);
  }
  for (const display of D.petDisplayMap.values()) {
    if (display.circle?.body) dynamicBody(display.circle.body)?.setVelocity(0, 0);
  }
}

export function teleportBody(actor: ActorState | null | undefined) {
  // For "set position directly" cases (scene transitions, carried pets, dungeon spawn).
  const body = getActorBody(actor);
  if (body && actor) {
    body.reset(actor.x * tile, actor.y * tile);
  }
}

registerActorTeleporter(teleportBody);

export function attachCircleBody(arc: PhysicsArc, radius: number, dynamic = true) {
  if (!D.pScene || arc.body) return arc.body;
  D.pScene.physics.add.existing(arc, !dynamic);
  const body = dynamicBody(arc.body);
  body.setCircle(radius);
  if (dynamic) {
    body.setCollideWorldBounds(true);
    body.setDrag(0, 0);
    body.setBounce(0, 0);
    body.setMaxVelocity(900, 900);
  }
  return body;
}

export function rebuildPhysicsForMap() {
  if (!D.pScene) return;
  const bounds = mapBounds();
  D.pScene.physics.world.setBounds(0, 0, bounds.w * tile, bounds.h * tile);

  // Mark wall/water tiles as collidable in the active layer.
  if (D.activeLayer && D.tileIndexMap) {
    const solidIdxs: number[] = [];
    if (D.tileIndexMap.wall !== undefined) solidIdxs.push(D.tileIndexMap.wall);
    if (D.tileIndexMap.water !== undefined) solidIdxs.push(D.tileIndexMap.water);
    if (solidIdxs.length) D.activeLayer.setCollision(solidIdxs);
  }

  // Tear down previous colliders + static group, rebuild for the new map.
  if (D.mapCollider) { D.mapCollider.destroy(); D.mapCollider = null; }
  if (D.playerBuildingCollider) { D.playerBuildingCollider.destroy(); D.playerBuildingCollider = null; }
  if (D.entityMapCollider) { D.entityMapCollider.destroy(); D.entityMapCollider = null; }
  if (D.entityBuildingCollider) { D.entityBuildingCollider.destroy(); D.entityBuildingCollider = null; }
  if (D.petMapCollider) { D.petMapCollider.destroy(); D.petMapCollider = null; }
  if (D.petBuildingCollider) { D.petBuildingCollider.destroy(); D.petBuildingCollider = null; }
  if (D.staticBuildingsGroup) D.staticBuildingsGroup.clear(true, true);
  else D.staticBuildingsGroup = D.pScene.physics.add.staticGroup();
  if (!D.entitiesGroup) D.entitiesGroup = D.pScene.physics.add.group();
  if (!D.petsGroup) D.petsGroup = D.pScene.physics.add.group();

  if (D.playerCircle && D.activeLayer) {
    D.mapCollider = D.pScene.physics.add.collider(D.playerCircle, D.activeLayer);
    D.playerBuildingCollider = D.pScene.physics.add.collider(D.playerCircle, D.staticBuildingsGroup);
  }
  if (D.entitiesGroup && D.activeLayer) {
    D.entityMapCollider = D.pScene.physics.add.collider(D.entitiesGroup, D.activeLayer);
    D.entityBuildingCollider = D.pScene.physics.add.collider(D.entitiesGroup, D.staticBuildingsGroup);
  }
  if (D.petsGroup && D.activeLayer) {
    D.petMapCollider = D.pScene.physics.add.collider(D.petsGroup, D.activeLayer);
    D.petBuildingCollider = D.pScene.physics.add.collider(D.petsGroup, D.staticBuildingsGroup);
  }
}
