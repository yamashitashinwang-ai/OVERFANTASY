// Combat - bow + arrow flight compatibility facade.

export { addArrowPickup, dropEmbeddedArrows } from "./arrows.ts";
export { bowProjectileOrigin } from "./bow-trajectory.ts";
export { isBowWeapon, bowShotStats } from "./bow/stats.ts";
export {
  bowChargeProgress,
  beginBowCharge,
  releaseBowCharge,
  cancelBowCharge
} from "./bow/charge.ts";
export { fireArrow } from "./bow/firing.ts";
export { resolveArrowHit } from "./bow/hits.ts";
export { updateFlyingArrows } from "./bow/flight.ts";
