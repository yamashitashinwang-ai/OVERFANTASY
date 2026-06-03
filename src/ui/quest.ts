// Quest UI compatibility facade. Rendering and modal-scene lifecycle live
// under `ui/quest/` so quest HTML stays separate from scene control.

export {
  renderCurrentQuestPanel,
  renderGuildPanel,
  renderNpcQuestPanel,
  renderQuestPanel
} from "./quest/render.ts";
export {
  openCurrentQuestPanel,
  openGuildQuestPanel,
  openNpcQuestPanel,
  closeQuestPanel
} from "./quest/scene.ts";
