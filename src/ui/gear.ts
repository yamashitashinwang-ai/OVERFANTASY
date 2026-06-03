// Gear sidebar compatibility facade. Event wiring and HTML rendering live
// under `ui/gear/` so sidebar lifecycle stays separate from row generation.

import { registerGameFlowUiHandlers } from "../runtime/game-flow-ui.ts";
import { renderGearPanel } from "./gear/render.ts";

export { attachGearPanel } from "./gear/lifecycle.ts";
export { renderGearPanel };

registerGameFlowUiHandlers({ renderGearPanel });
