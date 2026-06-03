import { getBowCharge } from "../../../runtime/state.ts";
import { clamp } from "../../math.ts";
import { currentWeapon } from "../weapon.ts";
import type { GearCatalogItem } from "../../types.ts";

export function isBowWeapon(weapon: GearCatalogItem = currentWeapon()): boolean {
  return weapon?.type === "弓";
}

export function bowChargeProgress(): number {
  return clamp((getBowCharge()?.time || 0) / 1.25, 0, 1);
}

export function bowShotStats(weapon: GearCatalogItem, charge: number) {
  const minRange = 3.5;
  const maxRange = weapon.range || 10;
  return {
    range: minRange + (maxRange - minRange) * charge,
    speed: 7 + 9 * charge,
    damageScale: 0.55 + 0.75 * charge
  };
}
