import type { Graphics } from '../types.ts';
import { drawTreant } from './creatures.ts';

export function drawPet(g: Graphics, kind: 'default' | 'wolf' | 'treant' | 'injured') {
  if (kind === 'treant') {
    drawTreant(g);
    return;
  }
  if (kind === 'wolf') {
    g.fillStyle(0x050608, 0.25);
    g.fillEllipse(22, 43, 30, 7);
    g.fillStyle(0xc8b49b, 1);
    g.fillEllipse(21, 31, 24, 14);
    g.fillTriangle(31, 24, 37, 18, 36, 29);
    g.fillStyle(0x4a3828, 1);
    g.fillCircle(32, 26, 1.6);
    return;
  }
  g.fillStyle(0x050608, 0.22);
  g.fillEllipse(22, 43, 28, 7);
  g.fillStyle(kind === 'injured' ? 0x6a6262 : 0xf0d789, 1);
  g.fillEllipse(22, 31, 23, 16);
  g.fillCircle(32, 27, 7);
  g.fillStyle(0x34291c, 1);
  g.fillCircle(34, 25, 1.6);
}
