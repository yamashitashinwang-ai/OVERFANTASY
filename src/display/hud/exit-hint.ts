import { state } from "../../runtime/state.ts";
import { display as D } from "../runtime.ts";

export function syncDungeonExitHint() {
  if (!D.exitHintText) return;
  let showExit = false;
  if (state.mode === "dungeon") {
    const exitObj = state.objects.find(o => o.kind === "exit");
    if (exitObj && Math.abs(state.player.x - 3) < 1.2 && Math.abs(state.player.y - 9.5) < 2.0) showExit = true;
  }
  D.exitHintText.setVisible(showExit);
}
