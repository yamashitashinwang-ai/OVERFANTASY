import type { Graphics } from './types.ts';

export function drawObjectTexture(g: Graphics, kind: string) {
  g.fillStyle(0x050608, 0.18);
  g.fillEllipse(32, 57, 50, 10);
  if (kind === 'tree') {
    g.fillStyle(0x5c3a22, 1);
    g.fillRoundedRect(27, 31, 10, 23, 4);
    g.fillStyle(0x2d6f3d, 1);
    g.fillCircle(19, 26, 15);
    g.fillCircle(34, 19, 18);
    g.fillCircle(45, 31, 14);
    g.fillStyle(0x4d9a55, 0.9);
    g.fillCircle(27, 14, 10);
    g.lineStyle(2, 0x153b22, 0.85);
    g.strokeCircle(34, 19, 18);
    g.strokeRoundedRect(27, 31, 10, 23, 4);
    return;
  }
  if (kind === 'bush') {
    g.fillStyle(0x2f8b4a, 1);
    g.fillCircle(20, 38, 11);
    g.fillCircle(32, 31, 14);
    g.fillCircle(44, 39, 11);
    g.fillStyle(0x66c66e, 0.8);
    g.fillCircle(29, 27, 6);
    g.lineStyle(2, 0x18542a, 0.8);
    g.strokeCircle(32, 31, 14);
    return;
  }
  if (kind === 'leafPile') {
    g.fillStyle(0x8c6a2f, 1);
    g.fillEllipse(32, 41, 37, 15);
    g.fillStyle(0xd7a14a, 0.9);
    g.fillTriangle(18, 39, 30, 28, 33, 43);
    g.fillStyle(0xa94f38, 0.9);
    g.fillTriangle(34, 44, 45, 30, 49, 46);
    g.fillStyle(0xe0b85d, 0.75);
    g.fillEllipse(30, 38, 18, 8);
    return;
  }
  if (kind === 'windFlag') {
    g.fillStyle(0x5b3c22, 1);
    g.fillRect(29, 14, 5, 40);
    g.fillStyle(0x8d77a6, 1);
    g.fillTriangle(34, 16, 58, 23, 34, 31);
    g.fillStyle(0xf3c45b, 1);
    g.fillCircle(31, 13, 4);
    g.lineStyle(2, 0x2b1a10, 1);
    g.lineBetween(31, 14, 31, 54);
    return;
  }
  if (kind === 'roadSign') {
    g.fillStyle(0x5b3c22, 1);
    g.fillRect(30, 20, 5, 32);
    g.fillStyle(0xb89055, 1);
    g.fillRoundedRect(15, 13, 34, 17, 3);
    g.lineStyle(2, 0x2b1a10, 1);
    g.strokeRoundedRect(15, 13, 34, 17, 3);
    g.fillTriangle(45, 16, 55, 21, 45, 26);
    return;
  }
  if (kind === 'forge') {
    g.fillStyle(0x41434a, 1);
    g.fillRoundedRect(14, 30, 36, 18, 4);
    g.fillStyle(0xff8a4c, 1);
    g.fillCircle(32, 25, 9);
    g.fillStyle(0x2f3034, 1);
    g.fillRect(19, 47, 26, 7);
    return;
  }
  if (kind === 'shrine') {
    g.fillStyle(0xdce2ea, 1);
    g.fillRoundedRect(24, 18, 16, 29, 4);
    g.fillStyle(0x9aa6b4, 1);
    g.fillRect(18, 43, 28, 8);
    g.fillStyle(0x9ed6ff, 1);
    g.fillCircle(32, 27, 4);
    return;
  }
  if (kind === 'magic') {
    g.fillStyle(0x24384e, 1);
    g.fillRoundedRect(11, 23, 42, 26, 3);
    g.fillStyle(0x5f83b7, 1);
    g.fillTriangle(8, 24, 32, 8, 56, 24);
    g.fillStyle(0xd9d4ff, 1);
    g.fillCircle(32, 34, 6);
    return;
  }
  if (kind === 'guild') {
    g.fillStyle(0x59406d, 1);
    g.fillRoundedRect(8, 24, 48, 25, 3);
    g.fillStyle(0x8d77a6, 1);
    g.fillTriangle(5, 25, 32, 7, 59, 25);
    g.fillStyle(0xf3c45b, 1);
    g.fillRect(29, 31, 6, 18);
    g.fillTriangle(35, 18, 52, 22, 35, 26);
    return;
  }
  if (kind === 'shop') {
    g.fillStyle(0x5f7080, 1);
    g.fillRoundedRect(10, 24, 44, 25, 3);
    g.fillStyle(0xaebbd0, 1);
    g.fillTriangle(7, 25, 32, 8, 57, 25);
    g.fillStyle(0xf3c45b, 1);
    g.fillCircle(23, 35, 5);
    g.fillCircle(41, 35, 5);
    return;
  }
  if (kind === 'ruinsGate' || kind === 'demonGate' || kind === 'dungeon') {
    const base = kind === 'demonGate' ? 0x5b2d43 : 0x4b4a59;
    g.fillStyle(base, 1);
    g.fillRoundedRect(13, 14, 38, 38, 5);
    g.fillStyle(0x101317, 1);
    g.fillRoundedRect(23, 28, 18, 24, 8);
    g.fillStyle(kind === 'demonGate' ? 0xeb5f73 : 0x9aa0ad, 1);
    g.fillCircle(32, 23, 5);
    return;
  }
  g.fillStyle(0x8b6a4c, 1);
  g.fillRoundedRect(10, 24, 44, 25, 3);
  g.fillStyle(0xb28d65, 1);
  g.fillTriangle(7, 25, 32, 8, 57, 25);
  g.fillStyle(0x3a2518, 1);
  g.fillRect(28, 35, 9, 14);
}
