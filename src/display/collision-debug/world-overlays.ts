import type Phaser from 'phaser';
import { display as D } from '../runtime.ts';
import { state } from '../../runtime/state.ts';
import { tile } from '../../runtime/constants.ts';
import { drawAttackEffect } from './attack-zones.ts';
import { drawPlayerMounts } from './mounts.ts';
import { strokeBody } from './geometry.ts';

export function drawCollisionDebugOverlay(g: Phaser.GameObjects.Graphics) {
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
