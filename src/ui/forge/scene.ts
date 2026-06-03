import { setOpenForgePanelHandler } from "../../runtime/panel-actions.ts";
import { restoreGameInputFocus } from "../../runtime/input.ts";
import { runtime } from "../../runtime/state.ts";
import { uiState } from "../../runtime/ui-state.ts";
import { htmlCache } from "../cache.ts";
import { get } from "../dom.ts";

export function closeForgePanel() {
  const s = runtime.pSceneRef;
  if (s?.scene?.isActive?.("ForgeScene")) {
    s.scene.stop("ForgeScene");
    s.scene.resume();
    restoreGameInputFocus(s);
  }
  uiState.forgeOpen = false;
  get.forgePanelEl.classList.add("hidden");
  htmlCache.forge = "";
}

export function openForgePanel() {
  const s = runtime.pSceneRef;
  if (!s) return;
  if (s.scene.isActive("ForgeScene")) return;
  s.scene.launch("ForgeScene");
  s.scene.pause();
}
setOpenForgePanelHandler(openForgePanel);
