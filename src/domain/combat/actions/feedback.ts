import {
  state, magicEffects,
  getAttackEffect, setAttackEffect,
  getBowCharge, setBowCharge
} from "../../../runtime/state.ts";
import { canUseWorldActions } from "../targeting.ts";
import { isBowWeapon, updateFlyingArrows } from "../bow.ts";
import { updateMagicZoneEffect, updatePendingMagicCast } from "../../magic.ts";

export function updateCombatFeedback(dt: number) {
  if (getBowCharge() && (!canUseWorldActions() || !isBowWeapon() || (state.player.arrows || 0) <= 0)) setBowCharge(null);
  if (getBowCharge()) getBowCharge().time += dt;
  updateFlyingArrows(dt);
  if (getAttackEffect()) {
    getAttackEffect().time += dt;
    if (getAttackEffect().time >= getAttackEffect().duration) setAttackEffect(null);
  }
  updatePendingMagicCast(dt);
  for (let i = magicEffects.length - 1; i >= 0; i -= 1) {
    updateMagicZoneEffect(magicEffects[i], dt);
    magicEffects[i].time += dt;
    if (magicEffects[i].time >= magicEffects[i].duration) magicEffects.splice(i, 1);
  }
  // Hit-feedback animations live in the Phaser tween manager and self-dispose.
}
