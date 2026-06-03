import { setOpenMagicPanelHandler } from "../../runtime/panel-actions.ts";
import { bus, Events } from "../../runtime/events.ts";
import { releaseWorldPointerInput, restoreGameInputFocus } from "../../runtime/input.ts";
import { runtime } from "../../runtime/state.ts";
import { uiState } from "../../runtime/ui-state.ts";
import { htmlCache } from "../cache.ts";
import { get } from "../dom.ts";
import { renderMagicPanel } from "./render.ts";

type SceneController = {
  get?: (key: string) => unknown;
  isActive?: (key: string) => boolean;
  launch?: (key: string) => void;
  pause?: () => void;
  resume?: () => void;
  stop?: (key?: string) => void;
};

type SceneRef = {
  scene?: SceneController;
};

function releaseMagicPanelInput(sceneRef: SceneRef | null | undefined) {
  releaseWorldPointerInput(sceneRef);
  const magicScene = sceneRef?.scene?.get?.("MagicScene");
  if (magicScene && magicScene !== sceneRef) releaseWorldPointerInput(magicScene);
}

export function closeMagicPanel() {
  const s = runtime.pSceneRef;
  releaseMagicPanelInput(s);
  if (s?.scene?.isActive?.("MagicScene")) {
    s.scene.stop("MagicScene");
    s.scene.resume();
    restoreGameInputFocus(s);
  }
  uiState.magicOpen = false;
  get.magicPanelEl.classList.add("hidden");
  htmlCache.magic = "";
}

export function openMagicPanel(mode = "book", title: string | null = null) {
  const s = runtime.pSceneRef;
  releaseMagicPanelInput(s);
  uiState.magicMode = mode;
  uiState.magicPanelTitle = title || (mode === "study" ? "魔法爱好者小屋" : "魔法");
  uiState.magicInput = "";
  if (!s) return;
  if (s.scene.isActive("MagicScene")) {
    htmlCache.magic = "";
    renderMagicPanel();
    return;
  }
  s.scene.launch("MagicScene");
  s.scene.pause();
}
function closeMagicPanelAfterCastEvent() {
  const activeScene = runtime.pSceneRef?.scene?.isActive?.("MagicScene");
  if (!uiState.magicOpen && !activeScene) return;
  closeMagicPanel();
}

bus.on(Events.MAGIC_CAST_BEGIN, closeMagicPanelAfterCastEvent);
bus.on(Events.MAGIC_CAST_RESOLVE, closeMagicPanelAfterCastEvent);
setOpenMagicPanelHandler(openMagicPanel);
