import type { Graphics } from '../types.ts';

export function drawNpc(g: Graphics, base: number, trim: number, wounded = false) {
  g.fillStyle(0x050608, 0.25);
  g.fillEllipse(20, 48, 22, 8);
  g.fillStyle(wounded ? 0x7a3737 : 0x262931, 1);
  g.fillRoundedRect(14, 32, 5, 14, 2);
  g.fillRoundedRect(21, 32, 5, 14, 2);
  g.fillStyle(base, 1);
  g.fillRoundedRect(10, 18, 20, 22, 4);
  g.fillStyle(trim, 1);
  g.fillRect(10, 26, 20, 4);
  g.fillStyle(0xf0caa6, 1);
  g.fillCircle(20, 12, 8);
  g.fillStyle(wounded ? 0xff8f70 : 0x16202a, 1);
  g.fillCircle(17, 13, 1.5);
  g.fillCircle(23, 13, 1.5);
  g.lineStyle(2, 0x101317, 0.9);
  g.strokeRoundedRect(10, 18, 20, 22, 4);
}
