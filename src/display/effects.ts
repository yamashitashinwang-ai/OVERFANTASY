// Combat/spell effects rendering: weapon held in hand, flying arrows, bow
// charge indicator, attack hit zones, and magic spell visuals.

import { display as D } from './runtime.ts';
import type Phaser from 'phaser';
import { playerLocomotionPose } from './player-animation-timing.ts';
import { hexToInt } from './colors.ts';
import { state, runtime, flyingArrows, magicEffects, getAttackEffect, getBowCharge } from '../runtime/state.ts';
import { tile } from '../runtime/constants.ts';
import { clamp } from '../domain/math.ts';
import { currentWeapon } from '../domain/combat/weapon.ts';
import { bowChargeProgress, bowShotStats, isBowWeapon } from '../domain/combat/bow.ts';
import { canUseWorldActions } from '../domain/combat/targeting.ts';
import { playerAimAngle } from '../scenes/game-scene-helpers.ts';
import { directionFromAngle, handOffsetForFacing, isFacingDir, playerAnimatedMountOffsetsForFacing } from './facing.ts';
import type { FacingDir, PlayerMountPose } from './facing.ts';
import type { AttackHitZone } from '../domain/types.ts';

interface ArrowFillStyle {
  color: number;
  alpha?: number;
}

function currentFacingDirection(): FacingDir {
  const candidate = runtime.facingDirection || runtime.aimDirection;
  if (isFacingDir(candidate)) return candidate;
  return directionFromAngle(playerAimAngle());
}

function currentPlayerMountPose(): PlayerMountPose {
  const body = D.playerCircle?.body as { velocity?: { x?: number; y?: number } } | null | undefined;
  const speed = Math.hypot(body?.velocity?.x ?? 0, body?.velocity?.y ?? 0);
  const moving = speed > 1 || state.player.running;
  if (!moving) return 'idle';
  return playerLocomotionPose(state.time, state.player.running);
}

function playerVisualWeaponAnchor() {
  const facing = currentFacingDirection();
  const rigAnchor = D.playerRig?.weaponAnchorWorld();
  if (rigAnchor) {
    return {
      facing,
      x: rigAnchor.x,
      y: rigAnchor.y,
      front: rigAnchor.front
    };
  }
  const baseX = D.playerCircle?.x ?? state.player.x * tile;
  const baseY = D.playerCircle?.y ?? state.player.y * tile;
  const mounts = playerAnimatedMountOffsetsForFacing(facing, currentPlayerMountPose());
  return {
    facing,
    x: baseX + mounts.weapon.x,
    y: baseY + mounts.weapon.y,
    front: mounts.weapon.front
  };
}

function playerStaticWeaponAnchor() {
  const facing = currentFacingDirection();
  const baseX = state.player.x * tile;
  const baseY = state.player.y * tile;
  const offset = handOffsetForFacing(facing);
  return {
    facing,
    x: baseX + offset.x,
    y: baseY + offset.y,
    front: offset.front
  };
}

function drawOrientedRect(
  gfx: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  ux: number,
  uy: number,
  px: number,
  py: number,
  halfLength: number,
  halfWidth: number
) {
  gfx.beginPath();
  gfx.moveTo(cx + ux * halfLength + px * halfWidth, cy + uy * halfLength + py * halfWidth);
  gfx.lineTo(cx - ux * halfLength + px * halfWidth, cy - uy * halfLength + py * halfWidth);
  gfx.lineTo(cx - ux * halfLength - px * halfWidth, cy - uy * halfLength - py * halfWidth);
  gfx.lineTo(cx + ux * halfLength - px * halfWidth, cy + uy * halfLength - py * halfWidth);
  gfx.closePath();
  gfx.fillPath();
}

export function drawDashedLineGfx(
  gfx: Phaser.GameObjects.Graphics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dash = 8,
  gap = 7
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 0.001) return;
  const ux = dx / len;
  const uy = dy / len;
  let traveled = 0;
  while (traveled < len) {
    const seg = Math.min(dash, len - traveled);
    gfx.beginPath();
    gfx.moveTo(x1 + ux * traveled, y1 + uy * traveled);
    gfx.lineTo(x1 + ux * (traveled + seg), y1 + uy * (traveled + seg));
    gfx.strokePath();
    traveled += dash + gap;
  }
}

export function drawArrowShapeGfx(
  gfx: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  angle: number,
  scale = 1,
  fillColor?: ArrowFillStyle,
  strokeColor?: number,
  strokeWidth = 1.5,
  strokeAlpha = 1
) {
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const px = -uy;
  const py = ux;
  const length = 18 * scale;
  const width = 3.2 * scale;
  const x0 = x + ux * length * 0.55;
  const y0 = y + uy * length * 0.55;
  const x1 = x - ux * length * 0.1 + px * width;
  const y1 = y - uy * length * 0.1 + py * width;
  const x2 = x - ux * length * 0.55;
  const y2 = y - uy * length * 0.55;
  const x3 = x - ux * length * 0.1 - px * width;
  const y3 = y - uy * length * 0.1 - py * width;

  if (fillColor !== undefined) {
    gfx.fillStyle(fillColor.color, fillColor.alpha ?? 1);
    gfx.beginPath();
    gfx.moveTo(x0, y0);
    gfx.lineTo(x1, y1);
    gfx.lineTo(x2, y2);
    gfx.lineTo(x3, y3);
    gfx.closePath();
    gfx.fillPath();
  }
  if (strokeColor !== undefined) {
    gfx.lineStyle(strokeWidth, strokeColor, strokeAlpha);
    gfx.beginPath();
    gfx.moveTo(x0, y0);
    gfx.lineTo(x1, y1);
    gfx.lineTo(x2, y2);
    gfx.lineTo(x3, y3);
    gfx.closePath();
    gfx.strokePath();
  }
}

export function syncWeaponDisplay() {
  if (!D.weaponGfx) return;
  D.weaponGfx.clear();
  // Anchor the weapon on an 8-direction hand mount derived from current facing.
  // The weapon graphic is still visual-only; attack hitboxes keep using aimAngle.
  const hand = playerVisualWeaponAnchor();
  const x = hand.x;
  const y = hand.y;
  const playerDepth = D.playerRig?.depth ?? D.playerSprite?.depth ?? 6;
  D.weaponGfx.setDepth(hand.front ? playerDepth + 0.08 : playerDepth - 0.08);
  const weapon = currentWeapon();
  const angle = playerAimAngle();
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const px = -uy;
  const py = ux;
  const colorHex = weapon.name === '剑的概念' ? '#fff4b0' : (weapon.type === '魔物' ? '#d986ff' : '#dbe4ea');
  const c = hexToInt(colorHex);

  if (weapon.type.includes('剑')) {
    const length = weapon.name === '剑的概念' ? 38 : 28;
    const lw = weapon.name === '剑的概念' ? 5 : 3;
    D.weaponGfx.lineStyle(lw, c, 1);
    D.weaponGfx.beginPath();
    D.weaponGfx.moveTo(x - ux * 4, y - uy * 4);
    D.weaponGfx.lineTo(x + ux * length, y + uy * length);
    D.weaponGfx.strokePath();
    D.weaponGfx.fillStyle(0x6f4a2f, 1);
    D.weaponGfx.fillCircle(x, y, lw + 1);
  } else if (weapon.type === '长枪') {
    D.weaponGfx.lineStyle(3, c, 1);
    D.weaponGfx.beginPath();
    D.weaponGfx.moveTo(x - ux * 10, y - uy * 10);
    D.weaponGfx.lineTo(x + ux * 48, y + uy * 48);
    D.weaponGfx.strokePath();
    D.weaponGfx.fillStyle(c, 1);
    D.weaponGfx.fillTriangle(
      x + ux * 52, y + uy * 52,
      x + ux * 44 + px * 4, y + uy * 44 + py * 4,
      x + ux * 44 - px * 4, y + uy * 44 - py * 4
    );
  } else if (weapon.type === '锤') {
    D.weaponGfx.lineStyle(4, c, 1);
    D.weaponGfx.beginPath();
    D.weaponGfx.moveTo(x - ux * 4, y - uy * 4);
    D.weaponGfx.lineTo(x + ux * 27, y + uy * 27);
    D.weaponGfx.strokePath();
    D.weaponGfx.fillStyle(c, 1);
    drawOrientedRect(D.weaponGfx, x + ux * 30, y + uy * 30, ux, uy, px, py, 6, 9);
  } else if (weapon.type === '匕首') {
    D.weaponGfx.lineStyle(3, c, 1);
    D.weaponGfx.beginPath();
    D.weaponGfx.moveTo(x - ux * 3, y - uy * 3);
    D.weaponGfx.lineTo(x + ux * 19, y + uy * 19);
    D.weaponGfx.strokePath();
    D.weaponGfx.fillStyle(0x6f4a2f, 1);
    D.weaponGfx.fillCircle(x, y, 3);
  } else if (weapon.type === '弓') {
    D.weaponGfx.lineStyle(3, c, 1);
    const bx = x + ux * 8;
    const by = y + uy * 8;
    D.weaponGfx.beginPath();
    D.weaponGfx.arc(bx, by, 15, angle - 1.15, angle + 1.15, false);
    D.weaponGfx.strokePath();
    D.weaponGfx.lineStyle(1.5, c, 1);
    D.weaponGfx.beginPath();
    D.weaponGfx.moveTo(bx + Math.cos(angle - 1.15) * 15, by + Math.sin(angle - 1.15) * 15);
    D.weaponGfx.lineTo(bx + Math.cos(angle + 1.15) * 15, by + Math.sin(angle + 1.15) * 15);
    D.weaponGfx.strokePath();
  } else if (weapon.type === '魔物') {
    D.weaponGfx.lineStyle(2, c, 1);
    for (const offset of [-5, 0, 5]) {
      D.weaponGfx.beginPath();
      D.weaponGfx.moveTo(x + px * offset, y + py * offset);
      D.weaponGfx.lineTo(x + ux * 21 + px * offset, y + uy * 21 + py * offset);
      D.weaponGfx.strokePath();
    }
  }
}

export function syncArrowsDisplay() {
  if (!D.arrowGfx) return;
  D.arrowGfx.clear();
  if (flyingArrows.length) {
    for (const arrow of flyingArrows) {
      drawArrowShapeGfx(
        D.arrowGfx,
        arrow.x * tile, arrow.y * tile,
        arrow.angle, 1,
        { color: 0xdbe4ea, alpha: 1 },
        0x101317, 1.5, 1
      );
    }
  }
  if (getBowCharge() && canUseWorldActions() && isBowWeapon() && (state.player.arrows || 0) > 0) {
    const weapon = currentWeapon();
    const charge = bowChargeProgress();
    const stats = bowShotStats(weapon, charge);
    const angle = playerAimAngle();
    const hand = playerStaticWeaponAnchor();
    const x = hand.x;
    const y = hand.y;
    const endX = x + Math.cos(angle) * stats.range * tile;
    const endY = y + Math.sin(angle) * stats.range * tile;
    D.arrowGfx.lineStyle(2 + charge * 2, 0xedf3f7, 0.48 + charge * 0.42);
    drawDashedLineGfx(D.arrowGfx, x, y, endX, endY, 8, 7);
    drawArrowShapeGfx(
      D.arrowGfx, endX, endY, angle, 0.85,
      { color: 0xf3c45b, alpha: 0.6 + charge * 0.35 },
      0x101317, 1, 0.9
    );
  }
}

export function syncEffectsDisplay() {
  if (!D.effectsGfx) return;
  D.effectsGfx.clear();

  const attack = getAttackEffect();
  if (attack) {
    const p = state.player;
    const mainZone = attack.zones?.find(zone => zone.role === 'main') as AttackHitZone | undefined;
    const originX = (mainZone && mainZone.shape !== 'circle' ? mainZone.x : (attack.handX || p.x)) * tile;
    const originY = (mainZone && mainZone.shape !== 'circle' ? mainZone.y : (attack.handY || p.y)) * tile;
    const progress = clamp((attack.time || 0) / attack.duration, 0, 1);
    const alpha = attack.critical ? 0.58 : 0.46;
    const ux = Math.cos(attack.angle);
    const uy = Math.sin(attack.angle);
    const c = hexToInt(attack.color);

    if (attack.effect === 'slash') {
      const radius = (mainZone?.shape === 'sector' ? mainZone.reach : attack.reach) * tile;
      const halfAngle = mainZone?.shape === 'sector' ? mainZone.halfAngle : attack.halfAngle;
      const start = attack.angle - halfAngle;
      const end = attack.angle + halfAngle;
      D.effectsGfx.fillStyle(c, alpha * (1 - progress * 0.35));
      D.effectsGfx.beginPath();
      D.effectsGfx.moveTo(originX, originY);
      D.effectsGfx.arc(originX, originY, radius, start, end, false);
      D.effectsGfx.closePath();
      D.effectsGfx.fillPath();
      const lw = attack.lineWidth + 1 + (attack.critical ? 2 : 0);
      D.effectsGfx.lineStyle(lw, c, attack.critical ? 1 : 0.92);
      D.effectsGfx.beginPath();
      D.effectsGfx.arc(originX, originY, radius * (0.78 + progress * 0.18),
        start + halfAngle * 0.16, end - halfAngle * 0.16, false);
      D.effectsGfx.strokePath();
    } else if (attack.effect === 'thrust') {
      const reach = (mainZone?.shape === 'line' ? mainZone.reach : attack.reach) * tile;
      const length = reach * (0.7 + progress * 0.3);
      const halfWidth = mainZone?.shape === 'line' ? mainZone.halfWidth : attack.halfWidth;
      D.effectsGfx.lineStyle(Math.max(12, halfWidth * tile * 2), c, 0.38);
      D.effectsGfx.beginPath();
      D.effectsGfx.moveTo(originX, originY);
      D.effectsGfx.lineTo(originX + ux * length, originY + uy * length);
      D.effectsGfx.strokePath();
      D.effectsGfx.lineStyle(4, c, 0.9);
      D.effectsGfx.beginPath();
      D.effectsGfx.moveTo(originX + ux * 2, originY + uy * 2);
      D.effectsGfx.lineTo(originX + ux * (length + 10), originY + uy * (length + 10));
      D.effectsGfx.strokePath();
    } else if (attack.effect === 'hammer') {
      const cx = (mainZone?.shape === 'circle' ? mainZone.x : (originX / tile + ux * attack.centerDist)) * tile;
      const cy = (mainZone?.shape === 'circle' ? mainZone.y : (originY / tile + uy * attack.centerDist)) * tile;
      const radius = (mainZone?.shape === 'circle' ? mainZone.radius : attack.radius) * tile * (0.82 + progress * 0.18);
      D.effectsGfx.fillStyle(c, 0.32);
      D.effectsGfx.fillCircle(cx, cy, radius);
      D.effectsGfx.lineStyle(attack.lineWidth, c, 0.92);
      D.effectsGfx.strokeCircle(cx, cy, radius);
    } else if (attack.effect === 'claw') {
      const radius = (mainZone?.shape === 'sector' ? mainZone.reach : attack.reach) * tile;
      D.effectsGfx.fillStyle(c, 0.32);
      D.effectsGfx.beginPath();
      D.effectsGfx.moveTo(originX, originY);
      D.effectsGfx.arc(originX, originY, radius, attack.angle - Math.PI / 2, attack.angle + Math.PI / 2, false);
      D.effectsGfx.closePath();
      D.effectsGfx.fillPath();
      D.effectsGfx.lineStyle(attack.lineWidth, c, 0.9);
      for (const offset of [-0.34, 0, 0.34]) {
        const a = attack.angle + offset;
        const sx = originX + Math.cos(a) * 6;
        const sy = originY + Math.sin(a) * 6;
        const ex = originX + Math.cos(a) * radius;
        const ey = originY + Math.sin(a) * radius;
        D.effectsGfx.beginPath();
        D.effectsGfx.moveTo(sx, sy);
        D.effectsGfx.lineTo(ex, ey);
        D.effectsGfx.strokePath();
      }
    }
    if (attack.critical) {
      D.effectsGfx.lineStyle(2, 0xffffff, 0.8);
      D.effectsGfx.strokeCircle(originX + ux * 28, originY + uy * 28, 8 + progress * 10);
    }
  }

  // Magic effects are now rendered by Phaser ParticleEmitters spawned from
  // startMagicEffect (see src/display/particles.js). We draw a thin outline
  // ring while the effect is alive so the area-of-effect is still legible.
  for (const effect of magicEffects) {
    const x = effect.x * tile;
    const y = effect.y * tile;
    const progress = clamp(effect.time / effect.duration, 0, 1);
    const radius = effect.radius * tile * (0.65 + progress * 0.45);
    const c = hexToInt(effect.color);
    D.effectsGfx.lineStyle(effect.spellId === 'thunderFlash' ? 5 : 2, c, 0.55 * (1 - progress * 0.6));
    D.effectsGfx.strokeCircle(x, y, radius);
  }
}
