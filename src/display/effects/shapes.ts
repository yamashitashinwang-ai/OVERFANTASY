import type Phaser from 'phaser';

export interface ArrowFillStyle {
  color: number;
  alpha?: number;
}

export function drawOrientedRect(
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
