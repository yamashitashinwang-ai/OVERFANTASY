import { rebuildDisplayIfRegistered, teleportActorBody } from "../../runtime/display-sync.ts";
import { state, runtime } from "../../runtime/state.ts";

export function rebuildDisplayIfReady() {
  if (!runtime.pSceneRef) return;
  teleportActorBody(state.player);
  rebuildDisplayIfRegistered();
}
