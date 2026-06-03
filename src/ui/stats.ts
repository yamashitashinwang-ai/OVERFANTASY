// Stats sidebar compatibility facade. Event wiring, selectors, and DOM
// rendering live under `ui/stats/` by responsibility.

export { attachStatsPanel } from "./stats/lifecycle.ts";
export { bindStatsEl, renderStats } from "./stats/render.ts";
