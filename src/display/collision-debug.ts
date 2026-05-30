// Optional collision/range overlay. This is display-only: it reads current
// bodies, object ranges, pickup ranges, and map exit zones but never creates
// or changes gameplay collision.

import type Phaser from 'phaser';
import { display as D } from './runtime.ts';
import { state, runtime, getAttackEffect } from '../runtime/state.ts';
import { tile } from '../runtime/constants.ts';
import { isFacingDir, playerAnimatedMountOffsetsForFacing } from '../domain/facing.ts';
import type { PlayerMountPose } from '../domain/facing.ts';
import type { AttackHitZone } from '../domain/types.ts';

type AnyBody = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  center?: { x: number; y: number };
};

function bodyRect(body: unknown, fallbackX: number, fallbackY: number, fallbackR: number) {
  const b = body as AnyBody | null | undefined;
  const w = b?.width ?? fallbackR * 2;
  const h = b?.height ?? fallbackR * 2;
  return {
    x: b?.x ?? fallbackX - w / 2,
    y: b?.y ?? fallbackY - h / 2,
    w,
    h
  };
}

function strokeBody(g: Phaser.GameObjects.Graphics, obj: Phaser.GameObjects.GameObject | null | undefined, color: number, r = 8) {
  if (!obj) return;
  const cast = obj as Phaser.GameObjects.GameObject & { x?: number; y?: number };
  const rect = bodyRect(obj.body, cast.x || 0, cast.y || 0, r);
  g.lineStyle(2, color, 0.9);
  g.strokeRect(rect.x, rect.y, rect.w, rect.h);
}

function drawAttackZone(g: Phaser.GameObjects.Graphics, zone: AttackHitZone) {
  const x = zone.x * tile;
  const y = zone.y * tile;
  const dirX = Math.cos(zone.angle);
  const dirY = Math.sin(zone.angle);
  const sideX = -dirY;
  const sideY = dirX;
  const color = zone.role === 'close' ? 0xffe066 : 0xff7bd5;
  const alpha = zone.role === 'close' ? 0.95 : 0.9;
  g.lineStyle(zone.role === 'close' ? 2 : 3, color, alpha);
  if (zone.shape === 'sector') {
    const reach = (zone.reach || 0) * tile;
    g.beginPath();
    g.moveTo(x, y);
    g.arc(x, y, reach, zone.angle - (zone.halfAngle || 0), zone.angle + (zone.halfAngle || 0), false, 0.02);
    g.closePath();
    g.strokePath();
    return;
  }
  if (zone.shape === 'line') {
    const reach = (zone.reach || 0) * tile;
    const half = (zone.halfWidth || 0) * tile;
    g.beginPath();
    g.moveTo(x + sideX * half, y + sideY * half);
    g.lineTo(x + dirX * reach + sideX * half, y + dirY * reach + sideY * half);
    g.lineTo(x + dirX * reach - sideX * half, y + dirY * reach - sideY * half);
    g.lineTo(x - sideX * half, y - sideY * half);
    g.closePath();
    g.strokePath();
    return;
  }
  if (zone.shape === 'circle') {
    g.strokeCircle(x, y, (zone.radius || 0) * tile);
  }
}

function drawAttackEffect(g: Phaser.GameObjects.Graphics) {
  const spec = getAttackEffect();
  if (!spec) return;
  if (spec.zones?.length) {
    for (const zone of spec.zones) drawAttackZone(g, zone);
    if (typeof spec.handX === 'number' && typeof spec.handY === 'number') {
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(spec.handX * tile, spec.handY * tile, 3);
      g.lineStyle(1, 0xffffff, 0.72);
      g.lineBetween(state.player.x * tile, state.player.y * tile, spec.handX * tile, spec.handY * tile);
    }
    return;
  }
  const x = state.player.x * tile;
  const y = state.player.y * tile;
  const dirX = Math.cos(spec.angle);
  const dirY = Math.sin(spec.angle);
  const sideX = -dirY;
  const sideY = dirX;
  g.lineStyle(2, 0xff7bd5, 0.9);
  if (spec.shape === 'line') {
    const reach = spec.reach * tile;
    const half = (spec.halfWidth || 0.25) * tile;
    g.beginPath();
    g.moveTo(x + sideX * half, y + sideY * half);
    g.lineTo(x + dirX * reach + sideX * half, y + dirY * reach + sideY * half);
    g.lineTo(x + dirX * reach - sideX * half, y + dirY * reach - sideY * half);
    g.lineTo(x - sideX * half, y - sideY * half);
    g.closePath();
    g.strokePath();
    return;
  }
  if (spec.shape === 'impact') {
    g.strokeCircle(x + dirX * spec.centerDist * tile, y + dirY * spec.centerDist * tile, spec.radius * tile);
    return;
  }
  g.beginPath();
  g.moveTo(x, y);
  g.arc(x, y, spec.reach * tile, spec.angle - spec.halfAngle, spec.angle + spec.halfAngle, false, 0.02);
  g.closePath();
  g.strokePath();
}

function drawMountMarker(g: Phaser.GameObjects.Graphics, x: number, y: number, color: number, radius: number) {
  g.fillStyle(color, 0.95);
  g.fillCircle(x, y, radius);
  g.lineStyle(1, 0x101317, 0.82);
  g.strokeCircle(x, y, radius + 1);
}

function currentPlayerMountPose(): PlayerMountPose {
  const body = D.playerCircle?.body as { velocity?: { x?: number; y?: number } } | null | undefined;
  const speed = Math.hypot(body?.velocity?.x ?? 0, body?.velocity?.y ?? 0);
  const moving = speed > 1 || state.player.running;
  if (!moving) return 'idle';
  const phase = Math.floor(state.time * (state.player.running ? 11 : 7)) % 2;
  if (state.player.running) return phase === 0 ? 'run0' : 'run1';
  return phase === 0 ? 'walk0' : 'walk1';
}

function drawPlayerMounts(g: Phaser.GameObjects.Graphics) {
  const facing = isFacingDir(runtime.facingDirection)
    ? runtime.facingDirection
    : isFacingDir(runtime.aimDirection)
      ? runtime.aimDirection
      : 's';
  const mounts = playerAnimatedMountOffsetsForFacing(facing, currentPlayerMountPose());
  const playerObj = D.playerCircle as (Phaser.GameObjects.GameObject & { x?: number; y?: number }) | null;
  const baseX = playerObj?.x ?? state.player.x * tile;
  const baseY = playerObj?.y ?? state.player.y * tile;
  const foot = { x: baseX + mounts.foot.x, y: baseY + mounts.foot.y };
  const body = { x: baseX + mounts.body.x, y: baseY + mounts.body.y };
  const rightShoulder = { x: baseX + mounts.rightShoulder.x, y: baseY + mounts.rightShoulder.y };
  const rightHand = { x: baseX + mounts.rightHand.x, y: baseY + mounts.rightHand.y };
  const leftHand = { x: baseX + mounts.leftHand.x, y: baseY + mounts.leftHand.y };
  const weapon = { x: baseX + mounts.weapon.x, y: baseY + mounts.weapon.y };

  g.lineStyle(1, 0xffffff, 0.35);
  g.lineBetween(body.x, body.y, rightShoulder.x, rightShoulder.y);
  g.lineBetween(rightShoulder.x, rightShoulder.y, rightHand.x, rightHand.y);
  g.lineBetween(body.x, body.y, leftHand.x, leftHand.y);
  g.lineStyle(1, 0xff7bd5, 0.48);
  g.lineBetween(rightHand.x, rightHand.y, weapon.x, weapon.y);

  drawMountMarker(g, foot.x, foot.y, 0x55e6ff, 2.5);
  g.lineStyle(1, 0x55e6ff, 0.9);
  g.lineBetween(foot.x - 5, foot.y, foot.x + 5, foot.y);
  g.lineBetween(foot.x, foot.y - 5, foot.x, foot.y + 5);
  drawMountMarker(g, body.x, body.y, 0xffffff, 2.5);
  drawMountMarker(g, rightShoulder.x, rightShoulder.y, 0xf3c45b, 2.8);
  drawMountMarker(g, rightHand.x, rightHand.y, 0x7cff8a, 3);
  drawMountMarker(g, leftHand.x, leftHand.y, 0x88bfff, 3);
  drawMountMarker(g, weapon.x, weapon.y, 0xff7bd5, 3.4);
}

export function initCollisionDebug(scene: Phaser.Scene) {
  D.collisionDebugGfx = scene.add.graphics().setDepth(94).setVisible(false);
  scene.input.keyboard.on('keydown-F4', () => {
    D.collisionDebugEnabled = !D.collisionDebugEnabled;
    D.collisionDebugGfx?.setVisible(D.collisionDebugEnabled);
    if (!D.collisionDebugEnabled) D.collisionDebugGfx?.clear();
  });
}

export function syncCollisionDebug() {
  const g = D.collisionDebugGfx;
  if (!g) return;
  g.clear();
  g.setVisible(D.collisionDebugEnabled);
  if (!D.collisionDebugEnabled) return;

  strokeBody(g, D.playerCircle, 0x55e6ff, state.player.r);
  drawPlayerMounts(g);

  g.lineStyle(1, 0x6878ff, 0.18);
  for (let yy = 0; yy < state.map.length; yy += 1) {
    const row = state.map[yy];
    for (let xx = 0; xx < row.length; xx += 1) {
      if (row[xx] === 'wall' || row[xx] === 'water') g.strokeRect(xx * tile, yy * tile, tile, tile);
    }
  }

  for (const display of D.objectDisplayMap.values()) {
    for (const rect of display.collisionRects) {
      g.lineStyle(2, 0xffb35c, 0.86);
      g.strokeRect(rect.x - rect.width * rect.originX, rect.y - rect.height * rect.originY, rect.width, rect.height);
    }
  }

  g.lineStyle(2, 0xffe066, 0.9);
  for (const obj of state.objects) {
    if (obj.kind === 'mapExit') g.strokeRect(obj.x * tile, obj.y * tile, obj.w * tile, obj.h * tile);
  }

  g.lineStyle(1, 0x7cff8a, 0.78);
  for (const pickup of state.pickups) {
    if (!pickup.taken) g.strokeCircle(pickup.x * tile, pickup.y * tile, 0.75 * tile);
  }

  g.lineStyle(1, 0x88bfff, 0.75);
  for (const obj of state.objects) {
    if (!obj.action || obj.kind === 'mapExit') continue;
    g.strokeRect((obj.x - 1.4) * tile, (obj.y - 1.4) * tile, (obj.w + 2.8) * tile, (obj.h + 2.8) * tile);
  }

  for (const e of state.entities) {
    if (!e.alive) continue;
    if (e.kind === 'npc' || e.kind === 'friendly') {
      g.lineStyle(1, 0x7fc7ff, 0.78);
      g.strokeCircle(e.x * tile, e.y * tile, 1.5 * tile);
    }
    if (e.faction === 'monster') {
      g.lineStyle(1, 0xff6f8d, 0.72);
      g.strokeCircle(e.x * tile, e.y * tile, Math.max(8, e.r || 9));
      g.lineStyle(1, 0xff445d, 0.35);
      g.strokeCircle(e.x * tile, e.y * tile, 0.9 * tile);
    }
  }

  drawAttackEffect(g);
}
