import type { Graphics } from '../types.ts';

export function drawTreant(g: Graphics) {
  g.fillStyle(0x051106, 0.22);
  g.fillEllipse(22, 46, 28, 9);
  g.fillStyle(0x5f3c25, 1);
  g.fillRoundedRect(16, 22, 12, 24, 5);
  g.fillStyle(0x69bf74, 1);
  g.fillCircle(14, 18, 9);
  g.fillCircle(25, 14, 11);
  g.fillCircle(31, 23, 9);
  g.fillStyle(0xd9ffd1, 1);
  g.fillCircle(19, 28, 1.8);
  g.fillCircle(25, 28, 1.8);
  g.lineStyle(2, 0x18351f, 1);
  g.strokeCircle(25, 14, 11);
  g.strokeRoundedRect(16, 22, 12, 24, 5);
}

export function drawRabbit(g: Graphics) {
  g.fillStyle(0x050608, 0.22);
  g.fillEllipse(22, 42, 30, 8);
  g.fillStyle(0xd8d1b1, 1);
  g.fillEllipse(22, 31, 24, 16);
  g.fillEllipse(13, 21, 6, 18);
  g.fillEllipse(22, 18, 6, 19);
  g.fillCircle(32, 28, 7);
  g.fillStyle(0x15191f, 1);
  g.fillCircle(34, 26, 1.6);
  g.lineStyle(2, 0x574f42, 0.85);
  g.strokeEllipse(22, 31, 24, 16);
}
