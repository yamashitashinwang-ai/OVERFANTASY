import { refreshCombatStats } from "../../domain/combat/weapon.ts";
import { display as D } from "../runtime.ts";
import { syncHudResourceBars } from "./bars.ts";
import { syncMagicChantBar } from "./chant.ts";
import { syncDungeonExitHint } from "./exit-hint.ts";
import { syncHudStatusLine } from "./status.ts";

export function syncHudDisplay() {
  if (!D.pScene || !D.hudBarsGfx) return;
  refreshCombatStats();
  syncHudStatusLine();
  syncHudResourceBars();
  syncDungeonExitHint();
  syncMagicChantBar();
}
