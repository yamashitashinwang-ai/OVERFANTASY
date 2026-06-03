import { restoreGameInputFocus } from "../../runtime/input.ts";
import {
  setCloseQuestPanelHandler,
  setOpenGuildQuestPanelHandler,
  setOpenNpcQuestPanelHandler
} from "../../runtime/panel-actions.ts";
import { runtime } from "../../runtime/state.ts";
import { uiState } from "../../runtime/ui-state.ts";
import { htmlCache } from "../cache.ts";
import { get } from "../dom.ts";
import { renderQuestPanel } from "./render.ts";

export function openCurrentQuestPanel() {
  uiState.questMode = "current";
  uiState.questNpcName = null;
  launchQuestScene();
}

export function openGuildQuestPanel() {
  uiState.questMode = "guild";
  uiState.questNpcName = null;
  launchQuestScene();
}

export function openNpcQuestPanel(npcName: string) {
  uiState.questMode = "npc";
  uiState.questNpcName = npcName;
  launchQuestScene();
}

function launchQuestScene() {
  const s = runtime.pSceneRef;
  if (!s) return;
  if (s.scene.isActive("QuestScene")) {
    // Same scene already running; refresh content because mode/npcName may have changed.
    htmlCache.quest = "";
    renderQuestPanel();
  } else {
    s.scene.launch("QuestScene");
    s.scene.pause();
  }
}

export function closeQuestPanel() {
  const s = runtime.pSceneRef;
  if (s?.scene?.isActive?.("QuestScene")) {
    s.scene.stop("QuestScene");
    s.scene.resume();
    restoreGameInputFocus(s);
  }
  uiState.questOpen = false;
  get.questPanelEl.classList.add("hidden");
  htmlCache.quest = "";
}

setCloseQuestPanelHandler(closeQuestPanel);
setOpenGuildQuestPanelHandler(openGuildQuestPanel);
setOpenNpcQuestPanelHandler(openNpcQuestPanel);
