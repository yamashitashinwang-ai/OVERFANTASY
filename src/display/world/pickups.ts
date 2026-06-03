import { display as D } from '../runtime.ts';
import type Phaser from 'phaser';
import { hexToInt } from '../colors.ts';
import { state } from '../../runtime/state.ts';
import { tile } from '../../runtime/constants.ts';
import type { PickupState } from '../../domain/types.ts';

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
