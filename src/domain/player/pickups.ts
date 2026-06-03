import { autoSave } from "../game-flow.ts";
import { addGearToBag, addMaterial, addResource, gearIdForPickup } from "../inventory.ts";
import { claimLostPackage } from "../lost-packages.ts";
import { restoreInjuredPets } from "../npc.ts";
import { currentPlayerId } from "../session.ts";
import { state } from "../../runtime/state.ts";
import { log } from "../../runtime/services.ts";

export function pickupItems() {
  for (const p of state.pickups) {
    if (p.taken) continue;
    if (p.reservedFor && p.reservedFor !== currentPlayerId()) continue;
    if (Math.hypot(state.player.x - p.x, state.player.y - p.y) < 0.75) {
      if (p.kind === "lostPackage") {
        claimLostPackage(p);
        continue;
      }
      p.taken = true;
      p.takenBy = currentPlayerId();
      if (p.kind === "herb") state.player.herbs += p.value;
      if (p.kind === "potion") state.player.potions += p.value;
      if (p.kind === "arrow") state.player.arrows = (state.player.arrows || 0) + p.value;
      if (p.kind === "gold") state.player.gold += p.value;
      if (p.kind === "material") addMaterial(p.name, p.value);
      if (p.kind === "wood" || p.kind === "stone" || p.kind === "resource") addResource(p.name, p.value);
      if (p.kind === "weapon" || p.kind === "gear" || p.kind === "armor" || p.kind === "accessory" || p.kind === "ring") {
        const gearId = gearIdForPickup(p);
        if (gearId) addGearToBag(gearId);
        else {
          state.player.rings += p.value;
          autoSave();
        }
      }
      if (p.kind === "conceptSword") {
        addGearToBag("conceptSword");
        state.player.conceptSword = true;
        autoSave();
      }
      if (p.kind === "cleanse") {
        state.player.corruption = Math.max(0, (state.player.corruption || 0) - 25);
        restoreInjuredPets();
      }
      log(p.kind === "arrow" ? "拾回了箭。" : `拾取了${p.name}。`);
    }
  }
}
