import { restoreGameInputFocus } from "../../runtime/input.ts";
import { runtime } from "../../runtime/state.ts";
import { uiState } from "../../runtime/ui-state.ts";
import { htmlCache } from "../cache.ts";
import { get } from "../dom.ts";
import { renderCharacterPanel } from "./render.ts";

export function openCharacterPanel() {
  const s = runtime.pSceneRef;
  if (!s) return;
  if (s.scene.isActive("CharacterScene")) {
    htmlCache.character = "";
    renderCharacterPanel();
    return;
  }
  s.scene.launch("CharacterScene");
  s.scene.pause();
}

export function closeCharacterPanel() {
  const s = runtime.pSceneRef;
  if (s?.scene?.isActive?.("CharacterScene")) {
    s.scene.stop("CharacterScene");
    s.scene.resume();
    restoreGameInputFocus(s);
  }
  uiState.characterOpen = false;
  get.characterPanelEl.classList.add("hidden");
  htmlCache.character = "";
}
