import { runtime } from "../../runtime/state.ts";
import { restoreGameInputFocus } from "../../runtime/input.ts";
import { uiState } from "../../runtime/ui-state.ts";
import { get } from "../dom.ts";

export function toggleBackpack(force: boolean | undefined = undefined) {
  const s = runtime.pSceneRef;
  if (!s) return;
  const active = s.scene.isActive("BackpackScene");
  const target = typeof force === "boolean" ? force : !active;
  if (target && !active) { s.scene.launch("BackpackScene"); s.scene.pause(); }
  else if (!target && active) {
    // Scene handles its own close path (Esc / close button). External close
    // calls land here; tell the scene to stop and resume GameScene.
    s.scene.stop("BackpackScene"); s.scene.resume();
    restoreGameInputFocus(s);
    get.backpackEl.classList.add("hidden");
    uiState.backpackOpen = false;
  }
}
