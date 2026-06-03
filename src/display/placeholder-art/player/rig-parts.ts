import type { Graphics, PlayerRigTexturePart } from '../types.ts';

function drawRigCapsule(g: Graphics, w: number, h: number, color: number, stroke = 0x101317) {
  const cx = w / 2;
  const top = 2;
  const bottom = h - 2;
  const width = Math.max(4, w - 4);
  g.lineStyle(width + 2, stroke, 0.82);
  g.lineBetween(cx, top, cx, bottom);
  g.fillStyle(stroke, 0.82);
  g.fillCircle(cx, top, width / 2 + 1);
  g.fillCircle(cx, bottom, width / 2 + 1);
  g.lineStyle(width, color, 1);
  g.lineBetween(cx, top, cx, bottom);
  g.fillStyle(color, 1);
  g.fillCircle(cx, top, width / 2);
  g.fillCircle(cx, bottom, width / 2);
}

export function drawRigPartTexture(g: Graphics, part: PlayerRigTexturePart, monster = false) {
  const skin = monster ? 0xb482ff : 0xf1c49a;
  const sleeve = monster ? 0x5d327d : 0x3f78c7;
  const trim = monster ? 0xd986ff : 0xf3c45b;
  const hair = monster ? 0x432060 : 0x2a2018;
  const pants = monster ? 0x32203f : 0x222a36;
  const calf = monster ? 0x261a33 : 0x303b4a;
  const boot = 0x171a1f;

  if (part === 'head') {
    g.fillStyle(skin, 1);
    g.fillEllipse(12, 12, 22, 20);
    g.fillStyle(hair, 1);
    g.fillRoundedRect(1, 2, 22, 9, 5);
    g.fillCircle(7, 9, 4);
    g.fillCircle(17, 9, 4);
    g.fillStyle(0x101317, 1);
    g.fillCircle(9, 13, 1.4);
    g.fillCircle(15, 13, 1.4);
    if (monster) {
      g.lineStyle(2, 0xd9a7ff, 0.95);
      g.lineBetween(7, 6, 2, 0);
      g.lineBetween(17, 6, 22, 0);
    }
    g.lineStyle(2, 0x101317, 0.9);
    g.strokeEllipse(12, 12, 22, 20);
    return;
  }

  if (part === 'torso') {
    g.fillStyle(sleeve, 1);
    g.fillRoundedRect(2, 2, 18, 24, 5);
    g.fillStyle(trim, 1);
    g.fillRect(4, 11, 14, 3);
    g.fillStyle(sleeve, 0.88);
    g.fillRoundedRect(5, 22, 12, 6, 4);
    g.lineStyle(2, 0x101317, 0.9);
    g.strokeRoundedRect(2, 2, 18, 24, 5);
    return;
  }

  if (part === 'upperArm') {
    drawRigCapsule(g, 8, 15, sleeve);
    return;
  }
  if (part === 'forearm') {
    drawRigCapsule(g, 7, 15, skin);
    return;
  }
  if (part === 'thigh') {
    drawRigCapsule(g, 8, 16, pants);
    return;
  }
  if (part === 'shin') {
    drawRigCapsule(g, 7, 15, calf);
    return;
  }
  if (part === 'hand') {
    g.fillStyle(skin, 1);
    g.fillCircle(4, 4, 3.6);
    g.lineStyle(1.5, 0x101317, 0.78);
    g.strokeCircle(4, 4, 3.6);
    return;
  }
  if (part === 'foot') {
    g.fillStyle(boot, 1);
    g.fillEllipse(6, 4, 11, 6);
    g.lineStyle(1.5, 0x101317, 0.82);
    g.strokeEllipse(6, 4, 11, 6);
  }
}

export function playerRigTextureSize(part: PlayerRigTexturePart) {
  return part === 'head' ? { w: 24, h: 24 }
    : part === 'torso' ? { w: 22, h: 30 }
      : part === 'hand' ? { w: 8, h: 8 }
        : part === 'foot' ? { w: 12, h: 8 }
          : part === 'thigh' ? { w: 8, h: 16 }
            : { w: 8, h: 15 };
}
