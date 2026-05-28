// Combat/spell effects rendering: weapon held in hand, flying arrows, bow
// charge indicator, attack hit zones, and magic spell visuals.

import { display as D } from './runtime.ts';
import type Phaser from 'phaser';
import { hexToInt } from './colors.ts';
import { state, flyingArrows, magicEffects, getAttackEffect, getBowCharge } from '../runtime/state.ts';
import { tile } from '../runtime/constants.ts';
import { clamp } from '../domain/math.ts';
import { currentWeapon } from '../domain/combat/weapon.ts';
import { bowChargeProgress, bowShotStats, isBowWeapon } from '../domain/combat/bow.ts';
import { canUseWorldActions } from '../domain/combat/targeting.ts';
import { playerAimAngle } from '../scenes/game-scene-helpers.ts';

interface ArrowFillStyle {
  color: number;
  alpha?: number;
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
  // Anchor the weapon on the player's *body pixel position* — not on the
  // pixel→tile→pixel round trip via state.player.x. The round trip
  // introduces sub-pixel rounding that makes the weapon jitter relative to
  // the player sprite when moving.
  const x = D.playerCircle?.x ?? state.player.x * tile;
  const y = D.playerCircle?.y ?? state.player.y * tile;
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
    D.weaponGfx.moveTo(x + ux * 8, y + uy * 8);
    D.weaponGfx.lineTo(x + ux * length, y + uy * length);
    D.weaponGfx.strokePath();
  } else if (weapon.type === '长枪') {
    D.weaponGfx.lineStyle(3, c, 1);
    D.weaponGfx.beginPath();
    D.weaponGfx.moveTo(x + ux * 7, y + uy * 7);
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
    D.weaponGfx.moveTo(x + ux * 7, y + uy * 7);
    D.weaponGfx.lineTo(x + ux * 27, y + uy * 27);
    D.weaponGfx.strokePath();
    D.weaponGfx.fillStyle(c, 1);
    D.weaponGfx.fillRect(x + ux * 28 - px * 7 - 5, y + uy * 28 - py * 7 - 5, 14, 10);
  } else if (weapon.type === '匕首') {
    D.weaponGfx.lineStyle(3, c, 1);
    D.weaponGfx.beginPath();
    D.weaponGfx.moveTo(x + ux * 8, y + uy * 8);
    D.weaponGfx.lineTo(x + ux * 19, y + uy * 19);
    D.weaponGfx.strokePath();
  } else if (weapon.type === '弓') {
    D.weaponGfx.lineStyle(3, c, 1);
    const bx = x + ux * 16;
    const by = y + uy * 16;
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
      D.weaponGfx.moveTo(x + ux * 9 + px * offset, y + uy * 9 + py * offset);
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
    const p = state.player;
    const x = p.x * tile;
    const y = p.y * tile;
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

  if (getAttackEffect()) {
    const p = state.player;
    const x = p.x * tile;
    const y = p.y * tile;
    const progress = clamp(getAttackEffect().time / getAttackEffect().duration, 0, 1);
    const alpha = getAttackEffect().critical ? 0.58 : 0.46;
    const ux = Math.cos(getAttackEffect().angle);
    const uy = Math.sin(getAttackEffect().angle);
    const px = -uy;
    const py = ux;
    const c = hexToInt(getAttackEffect().color);

    if (getAttackEffect().effect === 'slash') {
      const radius = getAttackEffect().reach * tile;
      const start = getAttackEffect().angle - getAttackEffect().halfAngle;
      const end = getAttackEffect().angle + getAttackEffect().halfAngle;
      D.effectsGfx.fillStyle(c, alpha * (1 - progress * 0.35));
      D.effectsGfx.beginPath();
      D.effectsGfx.moveTo(x, y);
      D.effectsGfx.arc(x, y, radius, start, end, false);
      D.effectsGfx.closePath();
      D.effectsGfx.fillPath();
      const lw = getAttackEffect().lineWidth + 1 + (getAttackEffect().critical ? 2 : 0);
      D.effectsGfx.lineStyle(lw, c, getAttackEffect().critical ? 1 : 0.92);
      D.effectsGfx.beginPath();
      D.effectsGfx.arc(x, y, radius * (0.78 + progress * 0.18),
        start + getAttackEffect().halfAngle * 0.16, end - getAttackEffect().halfAngle * 0.16, false);
      D.effectsGfx.strokePath();
    } else if (getAttackEffect().effect === 'thrust') {
      const reach = getAttackEffect().reach * tile;
      const length = reach * (0.7 + progress * 0.3);
      D.effectsGfx.lineStyle(Math.max(12, getAttackEffect().halfWidth * tile * 2), c, 0.38);
      D.effectsGfx.beginPath();
      D.effectsGfx.moveTo(x + ux * 8, y + uy * 8);
      D.effectsGfx.lineTo(x + ux * length, y + uy * length);
      D.effectsGfx.strokePath();
      D.effectsGfx.lineStyle(4, c, 0.9);
      D.effectsGfx.beginPath();
      D.effectsGfx.moveTo(x + ux * 10, y + uy * 10);
      D.effectsGfx.lineTo(x + ux * (length + 10), y + uy * (length + 10));
      D.effectsGfx.strokePath();
    } else if (getAttackEffect().effect === 'hammer') {
      const cx = x + ux * getAttackEffect().centerDist * tile;
      const cy = y + uy * getAttackEffect().centerDist * tile;
      const radius = getAttackEffect().radius * tile * (0.82 + progress * 0.18);
      D.effectsGfx.fillStyle(c, 0.32);
      D.effectsGfx.fillCircle(cx, cy, radius);
      D.effectsGfx.lineStyle(getAttackEffect().lineWidth, c, 0.92);
      D.effectsGfx.strokeCircle(cx, cy, radius);
    } else if (getAttackEffect().effect === 'claw') {
      const radius = getAttackEffect().reach * tile;
      D.effectsGfx.fillStyle(c, 0.32);
      D.effectsGfx.beginPath();
      D.effectsGfx.moveTo(x, y);
      D.effectsGfx.arc(x, y, radius, getAttackEffect().angle - Math.PI / 2, getAttackEffect().angle + Math.PI / 2, false);
      D.effectsGfx.closePath();
      D.effectsGfx.fillPath();
      D.effectsGfx.lineStyle(getAttackEffect().lineWidth, c, 0.9);
      for (const offset of [-0.34, 0, 0.34]) {
        const a = getAttackEffect().angle + offset;
        const sx = x + Math.cos(a) * 14;
        const sy = y + Math.sin(a) * 14;
        const ex = x + Math.cos(a) * radius;
        const ey = y + Math.sin(a) * radius;
        D.effectsGfx.beginPath();
        D.effectsGfx.moveTo(sx, sy);
        D.effectsGfx.lineTo(ex, ey);
        D.effectsGfx.strokePath();
      }
    }
    if (getAttackEffect().critical) {
      D.effectsGfx.lineStyle(2, 0xffffff, 0.8);
      D.effectsGfx.strokeCircle(x + ux * 28, y + uy * 28, 8 + progress * 10);
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
