import { display as D } from '../runtime.ts';
import { hexToInt } from '../colors.ts';
import { currentWeapon } from '../../domain/combat/weapon.ts';
import { playerAimAngle } from '../../runtime/input.ts';
import { playerVisualWeaponAnchor } from './anchors.ts';
import { drawOrientedRect } from './shapes.ts';

export function syncWeaponDisplay() {
  if (!D.weaponGfx) return;
  D.weaponGfx.clear();
  // Anchor the weapon on an 8-direction hand mount derived from current facing.
  // The weapon graphic is still visual-only; attack hitboxes keep using aimAngle.
  const hand = playerVisualWeaponAnchor();
  const x = hand.x;
  const y = hand.y;
  const playerDepth = D.playerRig?.depth ?? D.playerSprite?.depth ?? 6;
  D.weaponGfx.setDepth(hand.front ? playerDepth + 0.08 : playerDepth - 0.08);
  const weapon = currentWeapon();
  const angle = playerAimAngle();
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const px = -uy;
  const py = ux;
  const colorHex = weapon.name === '剑的概念' ? '#fff4b0' : (weapon.type === '魔物' ? '#d986ff' : '#dbe4ea');
  const c = hexToInt(colorHex);

  if (weapon.type.includes('剑')) {
    const length = weapon.name === '剑的概念' ? 38 : 28;
    const lw = weapon.name === '剑的概念' ? 5 : 3;
    D.weaponGfx.lineStyle(lw, c, 1);
    D.weaponGfx.beginPath();
    D.weaponGfx.moveTo(x - ux * 4, y - uy * 4);
    D.weaponGfx.lineTo(x + ux * length, y + uy * length);
    D.weaponGfx.strokePath();
    D.weaponGfx.fillStyle(0x6f4a2f, 1);
    D.weaponGfx.fillCircle(x, y, lw + 1);
  } else if (weapon.type === '长枪') {
    D.weaponGfx.lineStyle(3, c, 1);
    D.weaponGfx.beginPath();
    D.weaponGfx.moveTo(x - ux * 10, y - uy * 10);
    D.weaponGfx.lineTo(x + ux * 48, y + uy * 48);
    D.weaponGfx.strokePath();
    D.weaponGfx.fillStyle(c, 1);
    D.weaponGfx.fillTriangle(
      x + ux * 52, y + uy * 52,
      x + ux * 44 + px * 4, y + uy * 44 + py * 4,
      x + ux * 44 - px * 4, y + uy * 44 - py * 4
    );
  } else if (weapon.type === '锤') {
    D.weaponGfx.lineStyle(4, c, 1);
    D.weaponGfx.beginPath();
    D.weaponGfx.moveTo(x - ux * 4, y - uy * 4);
    D.weaponGfx.lineTo(x + ux * 27, y + uy * 27);
    D.weaponGfx.strokePath();
    D.weaponGfx.fillStyle(c, 1);
    drawOrientedRect(D.weaponGfx, x + ux * 30, y + uy * 30, ux, uy, px, py, 6, 9);
  } else if (weapon.type === '匕首') {
    D.weaponGfx.lineStyle(3, c, 1);
    D.weaponGfx.beginPath();
    D.weaponGfx.moveTo(x - ux * 3, y - uy * 3);
    D.weaponGfx.lineTo(x + ux * 19, y + uy * 19);
    D.weaponGfx.strokePath();
    D.weaponGfx.fillStyle(0x6f4a2f, 1);
    D.weaponGfx.fillCircle(x, y, 3);
  } else if (weapon.type === '弓') {
    D.weaponGfx.lineStyle(3, c, 1);
    const bx = x + ux * 8;
    const by = y + uy * 8;
    D.weaponGfx.beginPath();
    D.weaponGfx.arc(bx, by, 15, angle - 1.15, angle + 1.15, false);
    D.weaponGfx.strokePath();
    D.weaponGfx.lineStyle(1.5, c, 1);
    D.weaponGfx.beginPath();
    D.weaponGfx.moveTo(bx + Math.cos(angle - 1.15) * 15, by + Math.sin(angle - 1.15) * 15);
    D.weaponGfx.lineTo(bx + Math.cos(angle + 1.15) * 15, by + Math.sin(angle + 1.15) * 15);
    D.weaponGfx.strokePath();
  } else if (weapon.type === '魔物') {
    D.weaponGfx.lineStyle(2, c, 1);
    for (const offset of [-5, 0, 5]) {
      D.weaponGfx.beginPath();
      D.weaponGfx.moveTo(x + px * offset, y + py * offset);
      D.weaponGfx.lineTo(x + ux * 21 + px * offset, y + uy * 21 + py * offset);
      D.weaponGfx.strokePath();
    }
  }
}
