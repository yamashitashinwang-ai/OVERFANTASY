// World rendering sync: tilemap, entities, NPCs, buildings, pickups, pets,
// pet remains, HP bars. Reconciles Phaser GameObjects with game state each
// frame and rebuilds the tilemap layer on scene transitions.

import { display as D } from './runtime.ts';
import type Phaser from 'phaser';
import { hexToInt, brightenColorInt } from './colors.ts';
import { attachCircleBody, rebuildPhysicsForMap } from './physics.ts';
import { ensureTileTextures } from './tiles.ts';
import DATA from '../data.ts';
import { state } from '../runtime/state.ts';
import { tile } from '../runtime/constants.ts';
import { clamp } from '../domain/math.ts';
import { mapBounds, currentPetScene } from '../domain/world.ts';
import { currentWeapon } from '../domain/combat/weapon.ts';
import type { ActorState, PetState } from '../domain/types.ts';

const { graveMaxDecay } = DATA;
const resetBody = (body: Phaser.GameObjects.GameObject['body'] | null | undefined, x: number, y: number) => {
  (body as { reset?: (nextX: number, nextY: number) => void } | null)?.reset?.(x, y);
};

export function destroyAllDisplayObjects() {
  for (const obj of D.entityDisplayMap.values()) {
    if (obj.circle) obj.circle.destroy();
  }
  D.entityDisplayMap.clear();
  for (const obj of D.objectDisplayMap.values()) {
    if (obj.rect) obj.rect.destroy();
    if (obj.labelBg) obj.labelBg.destroy();
    if (obj.labelText) obj.labelText.destroy();
  }
  D.objectDisplayMap.clear();
  for (const obj of D.petDisplayMap.values()) {
    if (obj.circle) obj.circle.destroy();
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
    D.playerCircle.setStrokeStyle(2, 0x101317);
    D.playerCircle.setDepth(6);
  }
  // Attach physics body to player (idempotent)
  if (!D.playerCircle.body) attachCircleBody(D.playerCircle, state.player.r, true);
  // Teleport body to spawn position (overrides any leftover velocity).
  resetBody(D.playerCircle.body, state.player.x * tile, state.player.y * tile);

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
  // Body owns position; we only update visual properties here.
  D.playerCircle.setRadius(p.r + (p.invuln > 0 ? 2 : 0));
  const fillColor = p.monsterForm ? 0xad6cff : (p.blockTimer > 0 ? 0x9ed6ff : 0xf3c45b);
  D.playerCircle.setFillStyle(fillColor, 1);
  const weapon = currentWeapon();
  if (weapon.name === '剑的概念') D.playerCircle.setStrokeStyle(4, 0xffffff);
  else D.playerCircle.setStrokeStyle(2, 0x101317);
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
      D.entityDisplayMap.delete(id);
    }
  }
  // Add/update alive
  for (const [id, e] of aliveById) {
    let display = D.entityDisplayMap.get(id);
    if (!display) {
      const circle = D.pScene.add.arc(e.x * tile, e.y * tile, e.r, 0, 360, false, hexToInt(e.color));
      circle.setStrokeStyle(2, 0x0b0e12);
      circle.setDepth(4);
      attachCircleBody(circle, e.r, true);
      if (D.entitiesGroup) D.entitiesGroup.add(circle);
      display = { circle };
      D.entityDisplayMap.set(id, display);
    }
    // Color tween (from animations.js) overrides fillColor during a hit. When
    // no tween is active, restore the base color. Stroke reflects state effects.
    display.circle.setRadius(e.r);
    const baseColor = e.wounded ? '#f1a381' : e.color;
    // Only overwrite fillColor when not currently being driven by a hit tween.
    if (!display.circle._hitTweenActive) display.circle.setFillStyle(hexToInt(baseColor), 1);
    if (e.slowTimer > 0) display.circle.setStrokeStyle(3, 0x6ee0d2);
    else if (e.wantsTalk) display.circle.setStrokeStyle(3, 0xf3c45b);
    else display.circle.setStrokeStyle(2, 0x0b0e12);
  }
}

export function syncObjectDisplay() {
  if (!D.pScene) return;
  const currentIds = new Set(state.objects.map(o => o.id));
  for (const [id, display] of D.objectDisplayMap) {
    if (!currentIds.has(id)) {
      display.rect.destroy();
      display.labelBg.destroy();
      display.labelText.destroy();
      D.objectDisplayMap.delete(id);
    }
  }
  for (const o of state.objects) {
    let display = D.objectDisplayMap.get(o.id);
    if (!display) {
      const rectW = o.w * tile - 6;
      const rectH = o.h * tile - 6;
      const rect = D.pScene.add.rectangle(
        o.x * tile + 3 + rectW / 2,
        o.y * tile + 3 + rectH / 2,
        rectW, rectH,
        hexToInt(o.color), 1
      );
      rect.setStrokeStyle(3, 0x0b0e12);
      rect.setDepth(1);
      // Solid buildings get static physics bodies. Portals and exits are walk-through (no body).
      const isWalkThrough = (o.kind === 'portal') || (o.action === 'exit');
      if (!isWalkThrough && D.staticBuildingsGroup) {
        D.staticBuildingsGroup.add(rect);
        const body = rect.body as { updateFromGameObject?: () => void } | null;
        body?.updateFromGameObject?.();
      }
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
      display = { rect, labelBg, labelText, object: o };
      D.objectDisplayMap.set(o.id, display);
    }
    const cx = o.x + o.w / 2;
    const cy = o.y + o.h / 2;
    const playerDist = Math.hypot(state.player.x - cx, state.player.y - cy);
    const showLabel = o.kind === 'portal' || playerDist < 4;
    display.labelBg.setVisible(showLabel);
    display.labelText.setVisible(showLabel);
  }
}

export function syncPickupDisplay() {
  if (!D.pickupsGfx) return;
  D.pickupsGfx.clear();
  for (const p of state.pickups) {
    if (p.taken) continue;
    const x = p.x * tile;
    const y = p.y * tile;
    D.pickupsGfx.fillStyle(hexToInt(p.color), 1);
    D.pickupsGfx.fillTriangle(x, y - 13, x - 12, y + 11, x + 12, y + 11);
    D.pickupsGfx.lineStyle(2, 0x101317, 1);
    D.pickupsGfx.strokeTriangle(x, y - 13, x - 12, y + 11, x + 12, y + 11);
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
      D.petDisplayMap.delete(id);
    }
  }
  for (const [id, pet] of visiblePets) {
    let display = D.petDisplayMap.get(id);
    if (!display) {
      const circle = D.pScene.add.arc(pet.x * tile, pet.y * tile, pet.r, 0, 360, false, hexToInt(pet.color));
      circle.setStrokeStyle(2, 0xfff4b0);
      circle.setDepth(5);
      attachCircleBody(circle, pet.r, true);
      if (D.petsGroup) D.petsGroup.add(circle);
      display = { circle, pet };
      D.petDisplayMap.set(id, display);
    }
    display.pet = pet;
    const injured = pet.injured && !pet.lost;
    // For carried pets, force position from state (game logic owns it); body just follows.
    if (pet.carried && display.circle.body) {
      resetBody(display.circle.body, pet.x * tile, pet.y * tile);
    }
    display.circle.setRadius(injured ? Math.max(6, pet.r - 2) : pet.r);
    display.circle.setFillStyle(injured ? 0x5d5961 : hexToInt(pet.color), 1);
    if (injured) display.circle.setStrokeStyle(3, 0xff8f70);
    else display.circle.setStrokeStyle(2, 0xfff4b0);
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
  for (const [id, display] of D.petDisplayMap) {
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
