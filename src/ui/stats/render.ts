import { refreshCombatStats } from "../../domain/combat/weapon.ts";
import { get } from "../dom.ts";
import { statRows } from "./selectors.ts";

export function bindStatsEl(_el: HTMLElement | null) {
  // Deprecated; get.statsEl resolves lazily.
}

export function renderStats() {
  if (!get.statsEl) return;
  refreshCombatStats();
  get.statsEl.innerHTML = statRows()
    .map(([k, v]) => `<div class="stat"><b>${k}</b><span>${v}</span></div>`)
    .join("");
}
