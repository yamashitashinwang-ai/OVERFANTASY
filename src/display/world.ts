// World rendering sync: tilemap, entities, NPCs, buildings, pickups, pets,
// pet remains, HP bars. Reconciles Phaser GameObjects with game state each
// frame and rebuilds the tilemap layer on scene transitions.

import { display as D } from './runtime.ts';
import type Phaser from 'phaser';
import { hexToInt } from './colors.ts';
import { attachCircleBody, rebuildPhysicsForMap } from './physics.ts';
import { ensureTileTextures } from './tiles.ts';
import { PlayerRig } from './player-rig.ts';
import {
  playerIdleCycleProgress,
  playerLocomotionCycleProgress,
  playerLocomotionPose
} from './player-animation-timing.ts';
import {
  facingFromDelta, playerTextureKey, entityTextureKey, petTextureKey, objectTextureKey
} from './placeholder-art.ts';
import type { PlayerPose } from './placeholder-art.ts';
import { currentPlayerPoseOverride, playerVisualAdjust, npcVisualAdjust } from './animations.ts';
import DATA from '../data.ts';
import { state, runtime } from '../runtime/state.ts';
import { tile } from '../runtime/constants.ts';
import { clamp } from '../domain/math.ts';
import { mapBounds, currentPetScene } from '../domain/world.ts';
import { currentWeapon } from '../domain/combat/weapon.ts';
import type { ActorState, PetState, PickupState, WorldObjectState } from '../domain/types.ts';

const { graveMaxDecay } = DATA;
const resetBody = (body: Phaser.GameObjects.GameObject['body'] | null | undefined, x: number, y: number) => {
  (body as { reset?: (nextX: number, nextY: number) => void } | null)?.reset?.(x, y);
};
type FacingDir = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
let playerFacing: FacingDir = 's';
let lastPlayerPixel = { x: 0, y: 0 };

function syncActivePointerAimWorld() {
  if (!D.pScene || !runtime.pointerInside) return;
  const pointer = D.pScene.input.activePointer;
  if (!pointer) return;
  const worldPoint = D.pScene.cameras.main.getWorldPoint(pointer.x, pointer.y);
  runtime.aimWorld = { x: worldPoint.x / tile, y: worldPoint.y / tile };
}

function syncPlayerFacingFromAim(dx: number, dy: number) {
  syncActivePointerAimWorld();
  const movementFacing = Math.hypot(dx, dy) > 0.35 ? facingFromDelta(dx, dy, playerFacing) : playerFacing;
  if (runtime.aimWorld) {
    const bodyX = (D.playerCircle?.x ?? state.player.x * tile) / tile;
    const bodyY = (D.playerCircle?.y ?? state.player.y * tile) / tile;
    const ax = runtime.aimWorld.x - bodyX;
    const ay = runtime.aimWorld.y - bodyY;
    const len = Math.hypot(ax, ay);
    if (len > 0.02) {
      playerFacing = facingFromDelta(ax * tile, ay * tile, playerFacing);
      runtime.aimVector = { x: ax / len, y: ay / len };
      runtime.aimDirection = playerFacing;
      runtime.facingDirection = playerFacing;
      return;
    }
  }
  playerFacing = movementFacing;
  runtime.aimDirection = runtime.aimWorld ? playerFacing : null;
  runtime.facingDirection = playerFacing;
}

export function destroyAllDisplayObjects() {
  for (const obj of D.entityDisplayMap.values()) {
    if (obj.circle) obj.circle.destroy();
    if (obj.sprite) obj.sprite.destroy();
  }
  D.entityDisplayMap.clear();
  for (const obj of D.objectDisplayMap.values()) {
    if (obj.sprite) obj.sprite.destroy();
    for (const rect of obj.collisionRects) rect.destroy();
    if (obj.labelBg) obj.labelBg.destroy();
    if (obj.labelText) obj.labelText.destroy();
  }
  D.objectDisplayMap.clear();
  for (const obj of D.petDisplayMap.values()) {
    if (obj.circle) obj.circle.destroy();
    if (obj.sprite) obj.sprite.destroy();
  }
  D.petDisplayMap.clear();
  if (D.staticBuildingsGroup) { D.staticBuildingsGroup.clear(true, true); }
}

export function rebuildDisplay() {
  if (!D.pScene) return;
  ensureTileTextures();
  destroyAllDisplayObjects();

  if (D.activeLayer) { D.activeLayer.destroy(); D.activeLayer = null; }
  if (D.activeMap) { D.activeMap.destroy(); D.activeMap = null; }

  const bounds = mapBounds();
  const mapData = state.map.map(row => row.map(cell => D.tileIndexMap[cell] ?? 0));
  D.activeMap = D.pScene.make.tilemap({ data: mapData, tileWidth: tile, tileHeight: tile });
  const tileset = D.activeMap.addTilesetImage('tiles', 'tiles', tile, tile, 0, 0);
  D.activeLayer = D.activeMap.createLayer(0, tileset, 0, 0);
  D.activeLayer.setDepth(0);

  D.pScene.cameras.main.setBounds(0, 0, bounds.w * tile, bounds.h * tile);

  if (!D.playerCircle) {
    D.playerCircle = D.pScene.add.arc(state.player.x * tile, state.player.y * tile, state.player.r, 0, 360, false, hexToInt('#f3c45b'));
    D.playerCircle.setVisible(false);
  }
  if (!D.playerSprite) {
    D.playerSprite = D.pScene.add.sprite(state.player.x * tile, state.player.y * tile, playerTextureKey('s', 'idle'));
    D.playerSprite.setOrigin(0.5, 0.88);
    D.playerSprite.setDepth(6);
  }
  D.playerSprite.setVisible(false);
  if (!D.playerRig) {
    D.playerRig = new PlayerRig(D.pScene);
  }
  // Attach physics body to player (idempotent)
  if (!D.playerCircle.body) attachCircleBody(D.playerCircle, state.player.r, true);
  // Teleport body to spawn position (overrides any leftover velocity).
  resetBody(D.playerCircle.body, state.player.x * tile, state.player.y * tile);
  lastPlayerPixel = { x: state.player.x * tile, y: state.player.y * tile };

  D.pScene.cameras.main.startFollow(D.playerCircle, true, 1, 1);

  // Build tilemap + buildings collision now that all groups & layer exist.
  rebuildPhysicsForMap();

  syncObjectDisplay();   // creates static building bodies via group
  syncEntityDisplay();   // creates dynamic bodies for monsters/NPCs
  syncPetDisplay();
  syncPlayerDisplay();
}

export function syncPlayerDisplay() {
  if (!D.playerCircle) return;
  const p = state.player;
  D.playerCircle.setVisible(false);
  const dx = D.playerCircle.x - lastPlayerPixel.x;
  const dy = D.playerCircle.y - lastPlayerPixel.y;
  const moving = Math.hypot(dx, dy) > 0.35 || p.running;
  syncPlayerFacingFromAim(dx, dy);
  const basePose: PlayerPose = moving ? playerLocomotionPose(state.time, p.running) : 'idle';
  const pose = currentPlayerPoseOverride() || basePose;
  const animationProgress = moving
    ? playerLocomotionCycleProgress(state.time, p.running)
    : playerIdleCycleProgress(state.time);
  const visual = playerVisualAdjust(playerFacing);
  const invulnOffsetY = p.invuln > 0 ? Math.sin(state.time * 28) * 1.5 : 0;
  let tint: number | null = null;
  if (visual.tint) tint = visual.tint;
  else if (p.blockTimer > 0) tint = 0x9ed6ff;
  else if (currentWeapon().name === '剑的概念') tint = 0xfff4b0;

  if (D.playerSprite) {
    D.playerSprite.setTexture(playerTextureKey(playerFacing, pose, !!p.monsterForm));
    D.playerSprite.setPosition(
      D.playerCircle.x + visual.offsetX,
      D.playerCircle.y + visual.offsetY + invulnOffsetY
    );
    D.playerSprite.setScale(visual.scale);
    D.playerSprite.setDepth(6 + D.playerCircle.y / 100000);
    D.playerSprite.setVisible(false);
    if (tint) D.playerSprite.setTint(tint);
    else D.playerSprite.clearTint();
  }
  D.playerRig?.sync({
    x: D.playerCircle.x,
    y: D.playerCircle.y,
    facing: playerFacing,
    pose,
    animationProgress,
    monsterForm: !!p.monsterForm,
    visualOffsetX: visual.offsetX,
    visualOffsetY: visual.offsetY + invulnOffsetY,
    visualScale: visual.scale,
    tint,
    depth: 6 + D.playerCircle.y / 100000
  });
  lastPlayerPixel = { x: D.playerCircle.x, y: D.playerCircle.y };
  syncCorruptionAura();
}

function syncCorruptionAura() {
  if (!D.corruptionGfx || !D.playerCircle) return;
  D.corruptionGfx.clear();
  const corruption = state.player.corruption || 0;
  if (corruption < 30) return;
  const level = clamp(Math.floor((corruption - 30) / 10) + 1, 1, 8);
  const cx = D.playerCircle.x;
  const cy = D.playerCircle.y;
  for (let i = 0; i < level; i += 1) {
    const radius = state.player.r + 8 + i * 5;
    D.corruptionGfx.fillStyle(0x8f38ff, 0.035 + level * 0.008);
    D.corruptionGfx.fillCircle(cx, cy, radius);
    D.corruptionGfx.lineStyle(1, 0xd59bff, 0.05 + level * 0.01);
    D.corruptionGfx.strokeCircle(cx, cy, radius + 2);
  }
  for (let i = 0; i < level * 3; i += 1) {
    const angle = state.time * (0.7 + i * 0.03) + i * 2.17;
    const radius = state.player.r + 10 + (i % 4) * 5;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle * 0.82) * radius * 0.72;
    D.corruptionGfx.fillStyle(0xc47dff, 0.08 + level * 0.01);
    D.corruptionGfx.fillCircle(x, y, 2.2 + level * 0.45);
  }
}

export function syncEntityDisplay() {
  if (!D.pScene) return;
  const aliveById = new Map<string, ActorState>();
  for (const e of state.entities) {
    if (e.alive) aliveById.set(e.id, e);
  }
  // Remove no-longer-alive
  for (const [id, display] of D.entityDisplayMap) {
    if (!aliveById.has(id)) {
      display.circle.destroy();
      display.sprite?.destroy();
      D.entityDisplayMap.delete(id);
    }
  }
  // Add/update alive
  for (const [id, e] of aliveById) {
    let display = D.entityDisplayMap.get(id);
    if (!display) {
      const circle = D.pScene.add.arc(e.x * tile, e.y * tile, e.r, 0, 360, false, hexToInt(e.color));
      circle.setVisible(false);
      attachCircleBody(circle, e.r, true);
      if (D.entitiesGroup) D.entitiesGroup.add(circle);
      const sprite = D.pScene.add.sprite(e.x * tile, e.y * tile, entityTextureKey(e));
      sprite.setOrigin(0.5, 0.88);
      sprite.setDepth(4);
      display = { circle, sprite };
      D.entityDisplayMap.set(id, display);
    }
    display.entity = e;
    display.circle.setVisible(false);
    display.circle.setRadius(e.r);
    if (display.sprite) {
      const visual = npcVisualAdjust(e);
      display.sprite.setTexture(entityTextureKey(e));
      display.sprite.setPosition(display.circle.x + visual.offsetX, display.circle.y + visual.offsetY);
      display.sprite.setDepth(4 + display.circle.y / 100000);
      if (!display.circle._hitTweenActive) display.sprite.setScale(visual.scale);
      if (!display.circle._hitTweenActive) {
        if (visual.tint) display.sprite.setTint(visual.tint);
        else if (e.slowTimer > 0) display.sprite.setTint(0x6ee0d2);
        else if (e.wantsTalk) display.sprite.setTint(0xf3c45b);
        else if (e.wounded) display.sprite.setTint(0xf1a381);
        else display.sprite.clearTint();
      }
    }
  }
}

function isWalkThroughObject(o: WorldObjectState): boolean {
  return o.kind === 'portal' || o.kind === 'roadSign' || o.kind === 'mapExit' || o.action === 'exit';
}

function objectCollisionPieces(o: WorldObjectState) {
  if (isWalkThroughObject(o)) return [];
  if (o.collisionProfile === 'treeTrunk' || o.kind === 'tree') {
    const x = o.x * tile;
    const y = o.y * tile;
    const w = o.w * tile;
    const h = o.h * tile;
    return [{
      x: x + w * 0.42,
      y: y + h * 0.68,
      w: Math.max(8, w * 0.16),
      h: Math.max(12, h * 0.24)
    }];
  }
  if (o.environment || o.visualOnly) return [];
  const x = o.x * tile;
  const y = o.y * tile;
  const w = o.w * tile;
  const h = o.h * tile;
  const buildingWithDoor = o.kind === 'house' || o.kind === 'shop' || o.kind === 'guild' || o.kind === 'magicCottage';
  if (!buildingWithDoor) return [{ x: x + 3, y: y + 3, w: Math.max(4, w - 6), h: Math.max(4, h - 6) }];
  const sideW = Math.max(8, Math.min(w * 0.26, 24));
  const topH = Math.max(12, Math.min(h * 0.42, 30));
  return [
    { x: x + 3, y: y + 3, w: Math.max(4, w - 6), h: topH },
    { x: x + 3, y: y + topH, w: sideW, h: Math.max(4, h - topH - 3) },
    { x: x + w - sideW - 3, y: y + topH, w: sideW, h: Math.max(4, h - topH - 3) }
  ];
}

function addObjectCollisionRects(o: WorldObjectState): Phaser.GameObjects.Rectangle[] {
  if (!D.pScene || !D.staticBuildingsGroup) return [];
  return objectCollisionPieces(o).map(piece => {
    const rect = D.pScene!.add.rectangle(piece.x + piece.w / 2, piece.y + piece.h / 2, piece.w, piece.h, 0x000000, 0);
    rect.setVisible(false);
    D.staticBuildingsGroup!.add(rect);
    const body = rect.body as { updateFromGameObject?: () => void } | null;
    body?.updateFromGameObject?.();
    return rect;
  });
}

export function syncObjectDisplay() {
  if (!D.pScene) return;
  const visibleObjects = state.objects.filter(o => o.kind !== 'mapExit');
  const currentIds = new Set(visibleObjects.map(o => o.id));
  for (const [id, display] of D.objectDisplayMap) {
    if (!currentIds.has(id)) {
      display.sprite.destroy();
      for (const rect of display.collisionRects) rect.destroy();
      display.labelBg.destroy();
      display.labelText.destroy();
      D.objectDisplayMap.delete(id);
    }
  }
  for (const o of visibleObjects) {
    let display = D.objectDisplayMap.get(o.id);
    if (!display) {
      const sprite = D.pScene.add.image((o.x + o.w / 2) * tile, (o.y + o.h / 2) * tile, objectTextureKey(o));
      sprite.setDisplaySize(o.w * tile, o.h * tile);
      sprite.setDepth(1 + (o.y + o.h) / 10000);
      const collisionRects = addObjectCollisionRects(o);
      const labelW = Math.max(54, o.name.length * 13);
      const labelBg = D.pScene.add.rectangle(
        o.x * tile - 4 + labelW / 2,
        o.y * tile - 18 + 17 / 2,
        labelW, 17,
        0x080a0c, 0.7
      );
      labelBg.setDepth(7);
      const labelText = D.pScene.add.text(o.x * tile, o.y * tile - 17, o.name, {
        fontFamily: '"Microsoft YaHei", "Segoe UI", sans-serif',
        fontSize: '12px',
        color: '#edf3f7'
      });
      labelText.setDepth(8);
      display = { sprite, collisionRects, labelBg, labelText, object: o };
      D.objectDisplayMap.set(o.id, display);
    }
    display.sprite.setTexture(objectTextureKey(o));
    display.sprite.setPosition((o.x + o.w / 2) * tile, (o.y + o.h / 2) * tile);
    display.sprite.setDisplaySize(o.w * tile, o.h * tile);
    const cx = o.x + o.w / 2;
    const cy = o.y + o.h / 2;
    const playerDist = Math.hypot(state.player.x - cx, state.player.y - cy);
    const showLabel = !o.environment && (o.kind === 'portal' || o.kind === 'roadSign' || playerDist < 4);
    display.labelBg.setVisible(showLabel);
    display.labelText.setVisible(showLabel);
  }
}

function drawPickupIcon(gfx: Phaser.GameObjects.Graphics, p: PickupState, x: number, y: number) {
  const color = hexToInt(p.color);
  gfx.lineStyle(2, 0x101317, 0.9);
  if (p.kind === 'herb') {
    gfx.fillStyle(0x2d7c45, 1);
    gfx.fillRect(x - 2, y - 11, 4, 20);
    gfx.fillStyle(color, 1);
    gfx.fillEllipse(x - 8, y - 4, 13, 8);
    gfx.fillEllipse(x + 8, y - 8, 13, 8);
    gfx.strokeEllipse(x - 8, y - 4, 13, 8);
    gfx.strokeEllipse(x + 8, y - 8, 13, 8);
    return;
  }
  if (p.kind === 'potion' || p.kind === 'cleanse') {
    gfx.fillStyle(p.kind === 'cleanse' ? 0xd9d4ff : color, 1);
    gfx.fillRoundedRect(x - 7, y - 10, 14, 19, 4);
    gfx.fillStyle(0xeaf7ff, 0.85);
    gfx.fillRect(x - 4, y - 15, 8, 5);
    gfx.strokeRoundedRect(x - 7, y - 10, 14, 19, 4);
    return;
  }
  if (p.kind === 'gold') {
    gfx.fillStyle(0xf3c45b, 1);
    gfx.fillCircle(x, y, 9);
    gfx.lineStyle(2, 0x7c5420, 0.9);
    gfx.strokeCircle(x, y, 9);
    gfx.lineBetween(x - 4, y, x + 4, y);
    return;
  }
  if (p.kind === 'arrow') {
    gfx.lineStyle(3, 0xdbe4ea, 1);
    gfx.lineBetween(x - 12, y + 8, x + 12, y - 8);
    gfx.fillStyle(0xdbe4ea, 1);
    gfx.fillTriangle(x + 12, y - 8, x + 4, y - 7, x + 9, y);
    return;
  }
  if (p.kind === 'lostPackage') {
    gfx.fillStyle(0xb8895a, 1);
    gfx.fillRoundedRect(x - 11, y - 8, 22, 17, 3);
    gfx.lineStyle(2, 0x5f3d24, 1);
    gfx.strokeRoundedRect(x - 11, y - 8, 22, 17, 3);
    gfx.lineBetween(x, y - 8, x, y + 9);
    gfx.lineBetween(x - 11, y, x + 11, y);
    return;
  }
  if (p.kind === 'wood') {
    gfx.fillStyle(0xb8895a, 1);
    gfx.fillRoundedRect(x - 12, y - 6, 24, 12, 6);
    gfx.strokeRoundedRect(x - 12, y - 6, 24, 12, 6);
    gfx.lineBetween(x - 5, y - 5, x - 8, y + 5);
    return;
  }
  if (p.kind === 'stone' || p.kind === 'resource' || p.kind === 'material') {
    gfx.fillStyle(color, 1);
    gfx.fillTriangle(x - 12, y + 8, x - 4, y - 10, x + 12, y + 5);
    gfx.strokeTriangle(x - 12, y + 8, x - 4, y - 10, x + 12, y + 5);
    return;
  }
  gfx.fillStyle(color, 1);
  gfx.fillRoundedRect(x - 9, y - 9, 18, 18, 3);
  gfx.strokeRoundedRect(x - 9, y - 9, 18, 18, 3);
}

export function syncPickupDisplay() {
  if (!D.pickupsGfx) return;
  D.pickupsGfx.clear();
  for (const p of state.pickups) {
    if (p.taken) continue;
    const x = p.x * tile;
    const y = p.y * tile;
    drawPickupIcon(D.pickupsGfx, p, x, y);
  }
}

export function syncPetDisplay() {
  if (!D.pScene) return;
  const sceneKey = currentPetScene();
  const visiblePets = new Map<string, PetState>();
  for (const pet of state.pets) {
    if (pet.lost) continue;
    if (!pet.carried && pet.scene !== sceneKey) continue;
    if (!pet.alive && !pet.injured) continue;
    visiblePets.set(pet.id, pet);
  }
  for (const [id, display] of D.petDisplayMap) {
    if (!visiblePets.has(id)) {
      display.circle.destroy();
      display.sprite?.destroy();
      D.petDisplayMap.delete(id);
    }
  }
  for (const [id, pet] of visiblePets) {
    let display = D.petDisplayMap.get(id);
    if (!display) {
      const circle = D.pScene.add.arc(pet.x * tile, pet.y * tile, pet.r, 0, 360, false, hexToInt(pet.color));
      circle.setVisible(false);
      attachCircleBody(circle, pet.r, true);
      if (D.petsGroup) D.petsGroup.add(circle);
      const sprite = D.pScene.add.sprite(pet.x * tile, pet.y * tile, petTextureKey(pet));
      sprite.setOrigin(0.5, 0.88);
      sprite.setDepth(5);
      display = { circle, sprite, pet };
      D.petDisplayMap.set(id, display);
    }
    display.pet = pet;
    const injured = pet.injured && !pet.lost;
    // For carried pets, force position from state (game logic owns it); body just follows.
    if (pet.carried && display.circle.body) {
      resetBody(display.circle.body, pet.x * tile, pet.y * tile);
    }
    display.circle.setVisible(false);
    display.circle.setRadius(injured ? Math.max(6, pet.r - 2) : pet.r);
    if (display.sprite) {
      display.sprite.setTexture(petTextureKey(pet));
      display.sprite.setPosition(display.circle.x, display.circle.y);
      display.sprite.setDepth(5 + display.circle.y / 100000);
      if (injured) display.sprite.setTint(0xff8f70);
      else display.sprite.clearTint();
    }
  }
}

export function syncPetRemainsDisplay() {
  if (!D.petRemainsGfx) return;
  D.petRemainsGfx.clear();
  const sceneKey = currentPetScene();
  for (const remain of state.petRemains) {
    if (remain.scene !== sceneKey) continue;
    const x = remain.x * tile;
    const y = remain.y * tile;
    if (remain.kind === 'corpse') {
      D.petRemainsGfx.fillStyle(0x3f3b3d, 1);
      D.petRemainsGfx.fillEllipse(x, y + 5, 28, 14);
      D.petRemainsGfx.lineStyle(2, hexToInt(remain.color || '#ff8f70'), 1);
      D.petRemainsGfx.strokeEllipse(x, y + 5, 28, 14);
    } else {
      const rot = clamp(remain.decay / graveMaxDecay, 0, 1);
      const alpha = 0.95 - rot * 0.55;
      const h = 24 - remain.decay * 3;
      D.petRemainsGfx.fillStyle(0x8e8a82, alpha);
      D.petRemainsGfx.fillRect(x - 9, y - h + 7, 18, h);
      D.petRemainsGfx.fillStyle(0x4b4642, alpha);
      D.petRemainsGfx.fillRect(x - 14, y + 7, 28, 7);
      D.petRemainsGfx.lineStyle(1, 0x121110, alpha);
      D.petRemainsGfx.strokeRect(x - 9, y - h + 7, 18, h);
      D.petRemainsGfx.strokeRect(x - 14, y + 7, 28, 7);
    }
  }
}

export function syncHpBars() {
  if (!D.hpBarsGfx) return;
  D.hpBarsGfx.clear();
  // Entity HP bars
  for (const [id, display] of D.entityDisplayMap) {
    const e = state.entities.find(ent => ent.id === id);
    if (!e || !e.alive || e.hp >= e.maxHp) continue;
    const x = display.circle.x;
    const y = display.circle.y;
    D.hpBarsGfx.fillStyle(0x111820, 1);
    D.hpBarsGfx.fillRect(x - 13, y - e.r - 10, 26, 4);
    D.hpBarsGfx.fillStyle(0x62c78f, 1);
    D.hpBarsGfx.fillRect(x - 13, y - e.r - 10, 26 * clamp(e.hp / e.maxHp, 0, 1), 4);
  }
  // Pet HP bars
  for (const display of D.petDisplayMap.values()) {
    const pet = display.pet;
    if (!pet) continue;
    const x = pet.x * tile;
    const y = pet.y * tile;
    const injured = pet.injured && !pet.lost;
    D.hpBarsGfx.fillStyle(0x080a0c, 0.72);
    D.hpBarsGfx.fillRect(x - 19, y + pet.r + 3, 38, 5);
    D.hpBarsGfx.fillStyle(injured ? 0xff8f70 : 0x62c78f, 1);
    D.hpBarsGfx.fillRect(x - 19, y + pet.r + 3, 38 * clamp(pet.hp / pet.maxHp, 0, 1), 5);
  }
}
