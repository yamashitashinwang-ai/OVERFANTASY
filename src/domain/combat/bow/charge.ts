import {
  state, getBowCharge, setBowCharge,
  getHitStopTimer
} from "../../../runtime/state.ts";
import { toast } from "../../../runtime/services.ts";
import { canUseWorldActions } from "../targeting.ts";
import { currentWeapon } from "../weapon.ts";
import { fireArrow } from "./firing.ts";
import { bowChargeProgress, isBowWeapon } from "./stats.ts";

export { bowChargeProgress };

export function beginBowCharge(): boolean {
  if (!canUseWorldActions() || getHitStopTimer() > 0 || getBowCharge()) return false;
  const weapon = currentWeapon();
  if (!isBowWeapon(weapon)) return false;
  if ((state.player.arrows || 0) <= 0) {
    toast("没有箭。");
    return true;
  }
  if (state.player.stamina < weapon.stamina) {
    toast("体力不足，拉不开弓。");
    return true;
  }
  setBowCharge({ time: 0, rushed: state.player.attackCooldown > 0 });
  state.player.blockTimer = 0;
  return true;
}

export function releaseBowCharge(): boolean {
  if (!getBowCharge()) return false;
  if (!canUseWorldActions()) {
    setBowCharge(null);
    return true;
  }
  const charge = bowChargeProgress();
  const rushed = getBowCharge().rushed;
  setBowCharge(null);
  fireArrow(charge, rushed);
  return true;
}

export function cancelBowCharge(): boolean {
  if (!getBowCharge()) return false;
  setBowCharge(null);
  return true;
}
