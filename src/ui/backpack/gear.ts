import DATA from "../../data.ts";
import { state } from "../../runtime/state.ts";
import { log, toast } from "../../runtime/services.ts";
import { refreshCombatStats } from "../../domain/combat/weapon.ts";
import { equipGear } from "../../domain/inventory.ts";
import { htmlCache } from "../cache.ts";
import { renderBackpack } from "./render.ts";

const { gearCatalog } = DATA;

export function toggleBackpackGear(id: string) {
  const gear = gearCatalog[id];
  if (!gear) return;
  if (state.player.gear[gear.slot] === id) {
    if (gear.slot === "weapon") return toast("武器不能空手卸下。");
    state.player.gear[gear.slot] = null;
    refreshCombatStats();
    log(`卸下了${gear.name}。`);
  } else {
    equipGear(id);
  }
  htmlCache.backpack = "";
  renderBackpack();
}
