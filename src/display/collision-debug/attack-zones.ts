import type Phaser from 'phaser';
import { state, getAttackEffect } from '../../runtime/state.ts';
import { tile } from '../../runtime/constants.ts';
import type { AttackHitZone } from '../../domain/types.ts';

export function drawAttackZone(g: Phaser.GameObjects.Graphics, zone: AttackHitZone) {
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

export function drawAttackEffect(g: Phaser.GameObjects.Graphics) {
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
