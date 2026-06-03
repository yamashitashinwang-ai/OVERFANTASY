import { autoSave } from "../../runtime/autosave.ts";
import { log } from "../../runtime/services.ts";
import { flyingArrows, setBowCharge, state } from "../../runtime/state.ts";
import { recallPets } from "../inventory.ts";
import { interruptPendingMagicCast } from "../magic-casting.ts";
import { makeMap } from "../world.ts";
import { spawnWorld } from "../world-spawn.ts";
import type { SceneKey } from "../types.ts";
import { rebuildDisplayIfReady } from "./display.ts";
import { generateDungeon } from "./generate.ts";

function resetTransientCombatState() {
  interruptPendingMagicCast("mapChange");
  setBowCharge(null);
  flyingArrows.length = 0;
}

export function loadScene(scene: SceneKey, x: number, y: number, message: string) {
  resetTransientCombatState();
  makeMap(scene);
  spawnWorld(scene);
  state.player.x = x;
  state.player.y = y;
  recallPets();
  state.spawnClock = 6;
  rebuildDisplayIfReady();
  log(message);
  autoSave();
}

export function enterDungeon() {
  resetTransientCombatState();
  state.mode = "dungeon";
  state.player.x = 5.5;
  state.player.y = 5.5;
  generateDungeon();
  recallPets();
  rebuildDisplayIfReady();
  log("进入旧王城的排列迷宫。房间由模板重新组合，深处藏着唯一武器。 ");
  autoSave();
}

export function leaveDungeon() {
  loadScene("ruins", 50.5, 36.5, "离开迷宫，回到旧王城入口。 ");
}
