import type Phaser from 'phaser';
import { state, getAttackEffect } from '../../runtime/state.ts';
import { tile } from '../../runtime/constants.ts';
import { clamp } from '../../domain/math.ts';
import { hexToInt } from '../colors.ts';
import type { AttackHitZone } from '../../domain/types.ts';

export function drawAttackEffect(gfx: Phaser.GameObjects.Graphics) {
  const attack = getAttackEffect();
  if (!attack) return;

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
    gfx.fillStyle(c, alpha * (1 - progress * 0.35));
    gfx.beginPath();
    gfx.moveTo(originX, originY);
    gfx.arc(originX, originY, radius, start, end, false);
    gfx.closePath();
    gfx.fillPath();
    const lw = attack.lineWidth + 1 + (attack.critical ? 2 : 0);
    gfx.lineStyle(lw, c, attack.critical ? 1 : 0.92);
    gfx.beginPath();
    gfx.arc(originX, originY, radius * (0.78 + progress * 0.18),
      start + halfAngle * 0.16, end - halfAngle * 0.16, false);
    gfx.strokePath();
  } else if (attack.effect === 'thrust') {
    const reach = (mainZone?.shape === 'line' ? mainZone.reach : attack.reach) * tile;
    const length = reach * (0.7 + progress * 0.3);
    const halfWidth = mainZone?.shape === 'line' ? mainZone.halfWidth : attack.halfWidth;
    gfx.lineStyle(Math.max(12, halfWidth * tile * 2), c, 0.38);
    gfx.beginPath();
    gfx.moveTo(originX, originY);
    gfx.lineTo(originX + ux * length, originY + uy * length);
    gfx.strokePath();
    gfx.lineStyle(4, c, 0.9);
    gfx.beginPath();
    gfx.moveTo(originX + ux * 2, originY + uy * 2);
    gfx.lineTo(originX + ux * (length + 10), originY + uy * (length + 10));
    gfx.strokePath();
  } else if (attack.effect === 'hammer') {
    const cx = (mainZone?.shape === 'circle' ? mainZone.x : (originX / tile + ux * attack.centerDist)) * tile;
    const cy = (mainZone?.shape === 'circle' ? mainZone.y : (originY / tile + uy * attack.centerDist)) * tile;
    const radius = (mainZone?.shape === 'circle' ? mainZone.radius : attack.radius) * tile * (0.82 + progress * 0.18);
    gfx.fillStyle(c, 0.32);
    gfx.fillCircle(cx, cy, radius);
    gfx.lineStyle(attack.lineWidth, c, 0.92);
    gfx.strokeCircle(cx, cy, radius);
  } else if (attack.effect === 'claw') {
    const radius = (mainZone?.shape === 'sector' ? mainZone.reach : attack.reach) * tile;
    gfx.fillStyle(c, 0.32);
    gfx.beginPath();
    gfx.moveTo(originX, originY);
    gfx.arc(originX, originY, radius, attack.angle - Math.PI / 2, attack.angle + Math.PI / 2, false);
    gfx.closePath();
    gfx.fillPath();
    gfx.lineStyle(attack.lineWidth, c, 0.9);
    for (const offset of [-0.34, 0, 0.34]) {
      const a = attack.angle + offset;
      const sx = originX + Math.cos(a) * 6;
      const sy = originY + Math.sin(a) * 6;
      const ex = originX + Math.cos(a) * radius;
      const ey = originY + Math.sin(a) * radius;
      gfx.beginPath();
      gfx.moveTo(sx, sy);
      gfx.lineTo(ex, ey);
      gfx.strokePath();
    }
  }

  if (attack.critical) {
    gfx.lineStyle(2, 0xffffff, 0.8);
    gfx.strokeCircle(originX + ux * 28, originY + uy * 28, 8 + progress * 10);
  }
}
