import type { Graphics } from '../types.ts';

export function drawSlime(g: Graphics) {
  g.fillStyle(0x080405, 0.25);
  g.fillEllipse(22, 44, 31, 8);
  g.fillStyle(0xb95a68, 1);
  g.fillEllipse(22, 31, 31, 25);
  g.fillStyle(0xe88993, 0.75);
  g.fillEllipse(16, 25, 9, 6);
  g.fillStyle(0x281116, 1);
  g.fillCircle(17, 31, 2);
  g.fillCircle(27, 31, 2);
  g.lineStyle(2, 0x501e28, 1);
  g.strokeEllipse(22, 31, 31, 25);
}

export function drawWolf(g: Graphics) {
  g.fillStyle(0x050608, 0.28);
  g.fillEllipse(24, 44, 34, 8);
  g.fillStyle(0x8b58ba, 1);
  g.fillEllipse(22, 31, 27, 15);
  g.fillTriangle(32, 22, 39, 16, 37, 28);
  g.fillTriangle(14, 25, 9, 17, 18, 22);
  g.fillStyle(0x2b1538, 1);
  g.fillRect(14, 36, 5, 9);
  g.fillRect(27, 36, 5, 9);
  g.fillStyle(0xf4e6ff, 1);
  g.fillCircle(34, 24, 2);
  g.lineStyle(2, 0x281133, 1);
  g.strokeEllipse(22, 31, 27, 15);
}

export function drawSkeleton(g: Graphics) {
  g.fillStyle(0x050608, 0.24);
  g.fillEllipse(21, 47, 24, 7);
  g.fillStyle(0xd7d0be, 1);
  g.fillCircle(21, 13, 8);
  g.fillRoundedRect(17, 22, 8, 18, 2);
  g.lineStyle(3, 0xd7d0be, 1);
  g.lineBetween(13, 24, 7, 35);
  g.lineBetween(29, 24, 35, 35);
  g.lineBetween(18, 39, 13, 48);
  g.lineBetween(24, 39, 29, 48);
  g.fillStyle(0x1c1a16, 1);
  g.fillCircle(18, 13, 2);
  g.fillCircle(24, 13, 2);
}

export function drawWisp(g: Graphics) {
  g.fillStyle(0x183a3c, 0.28);
  g.fillEllipse(22, 46, 24, 7);
  g.fillStyle(0x6ee0d2, 0.92);
  g.fillEllipse(22, 29, 23, 31);
  g.fillStyle(0xc8fff6, 0.85);
  g.fillTriangle(22, 9, 13, 32, 31, 32);
  g.fillStyle(0x16343a, 1);
  g.fillCircle(18, 29, 2);
  g.fillCircle(26, 29, 2);
}

export function drawGargoyle(g: Graphics) {
  g.fillStyle(0x050608, 0.3);
  g.fillEllipse(22, 47, 34, 7);
  g.fillStyle(0x8f8a9a, 1);
  g.fillTriangle(8, 22, 21, 31, 7, 40);
  g.fillTriangle(36, 22, 23, 31, 37, 40);
  g.fillRoundedRect(14, 18, 16, 25, 4);
  g.fillStyle(0xd0ceda, 1);
  g.fillCircle(18, 23, 2);
  g.fillCircle(26, 23, 2);
  g.lineStyle(2, 0x36333f, 1);
  g.strokeRoundedRect(14, 18, 16, 25, 4);
}

export function drawDemonKnight(g: Graphics) {
  g.fillStyle(0x050608, 0.3);
  g.fillEllipse(22, 47, 28, 8);
  g.fillStyle(0x4c2028, 1);
  g.fillRoundedRect(13, 19, 18, 25, 4);
  g.fillStyle(0xeb5f73, 1);
  g.fillRoundedRect(15, 10, 14, 13, 3);
  g.fillTriangle(15, 11, 9, 4, 17, 8);
  g.fillTriangle(29, 11, 35, 4, 27, 8);
  g.fillStyle(0xffd0d6, 1);
  g.fillRect(17, 16, 10, 2);
  g.lineStyle(2, 0x1c0d12, 1);
  g.strokeRoundedRect(13, 19, 18, 25, 4);
}
