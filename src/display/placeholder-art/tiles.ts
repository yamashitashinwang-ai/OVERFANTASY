import { hexToInt } from '../colors.ts';
import type { Graphics } from './types.ts';

export function drawTileCell(g: Graphics, type: string, x: number, y: number, size: number, color: string) {
  const c = hexToInt(color);
  g.fillStyle(c, 1);
  g.fillRect(x, y, size, size);
  if (type === 'grass' || type === 'paleGrove') {
    g.lineStyle(1, 0x8ac978, 0.55);
    g.lineBetween(x + 7, y + 25, x + 10, y + 16);
    g.lineBetween(x + 21, y + 27, x + 24, y + 18);
  } else if (type === 'forest' || type === 'silverleaf') {
    g.fillStyle(type === 'silverleaf' ? 0xb9d9a2 : 0x3f7a4a, 0.82);
    g.fillCircle(x + 10, y + 10, 8);
    g.fillCircle(x + 24, y + 16, 9);
    g.fillStyle(0x4b3422, 0.7);
    g.fillRect(x + 16, y + 17, 4, 11);
  } else if (type === 'road' || type === 'elvenRoad') {
    g.lineStyle(2, type === 'elvenRoad' ? 0xd5deb7 : 0xb49a70, 0.45);
    g.lineBetween(x + 3, y + 11, x + 29, y + 8);
    g.lineBetween(x + 4, y + 22, x + 28, y + 25);
  } else if (type === 'water' || type === 'swamp') {
    g.lineStyle(2, type === 'swamp' ? 0x6f9b83 : 0x75b8d8, 0.55);
    g.lineBetween(x + 3, y + 11, x + 13, y + 8);
    g.lineBetween(x + 18, y + 19, x + 30, y + 16);
  } else if (type === 'mountain' || type === 'ore') {
    g.fillStyle(0x8c877d, 0.75);
    g.fillTriangle(x + 4, y + 27, x + 13, y + 8, x + 22, y + 27);
    g.fillTriangle(x + 13, y + 27, x + 23, y + 12, x + 31, y + 27);
  } else if (type === 'wall' || type === 'dungeon' || type === 'ruins' || type === 'castle') {
    g.lineStyle(1, 0x9aa0ad, 0.2);
    g.strokeRect(x + 3, y + 4, 12, 10);
    g.strokeRect(x + 15, y + 14, 14, 11);
    g.strokeRect(x + 3, y + 25, 18, 6);
  } else if (type === 'village') {
    g.fillStyle(0x8a7d5a, 0.65);
    g.fillRect(x + 4, y + 5, 8, 7);
    g.fillRect(x + 18, y + 13, 9, 8);
    g.fillRect(x + 8, y + 24, 10, 5);
  } else if (type === 'ash' || type === 'chasm' || type === 'seal') {
    g.lineStyle(2, 0xb2a6c8, 0.22);
    g.lineBetween(x + 7, y + 25, x + 16, y + 8);
    g.lineBetween(x + 18, y + 8, x + 27, y + 26);
  }
  g.lineStyle(1, 0x000000, 0.1);
  g.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
}
