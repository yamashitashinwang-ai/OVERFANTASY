import { display as D } from '../runtime.ts';
import { state, flyingArrows, getBowCharge } from '../../runtime/state.ts';
import { tile } from '../../runtime/constants.ts';
import { currentWeapon } from '../../domain/combat/weapon.ts';
import { bowChargeProgress, bowShotStats, isBowWeapon } from '../../domain/combat/bow.ts';
import { canUseWorldActions } from '../../domain/combat/targeting.ts';
import { playerAimAngle } from '../../runtime/input.ts';
import { playerStaticWeaponAnchor } from './anchors.ts';
import { drawArrowShapeGfx, drawDashedLineGfx } from './shapes.ts';

export function syncArrowsDisplay() {
  if (!D.arrowGfx) return;
  D.arrowGfx.clear();
  if (flyingArrows.length) {
    for (const arrow of flyingArrows) {
      drawArrowShapeGfx(
        D.arrowGfx,
        arrow.x * tile, arrow.y * tile,
        arrow.angle, 1,
        { color: 0xdbe4ea, alpha: 1 },
        0x101317, 1.5, 1
      );
    }
  }
  if (getBowCharge() && canUseWorldActions() && isBowWeapon() && (state.player.arrows || 0) > 0) {
    const weapon = currentWeapon();
    const charge = bowChargeProgress();
    const stats = bowShotStats(weapon, charge);
    const angle = playerAimAngle();
    const hand = playerStaticWeaponAnchor();
    const x = hand.x;
    const y = hand.y;
    const endX = x + Math.cos(angle) * stats.range * tile;
    const endY = y + Math.sin(angle) * stats.range * tile;
    D.arrowGfx.lineStyle(2 + charge * 2, 0xedf3f7, 0.48 + charge * 0.42);
    drawDashedLineGfx(D.arrowGfx, x, y, endX, endY, 8, 7);
    drawArrowShapeGfx(
      D.arrowGfx, endX, endY, angle, 0.85,
      { color: 0xf3c45b, alpha: 0.6 + charge * 0.35 },
      0x101317, 1, 0.9
    );
  }
}
