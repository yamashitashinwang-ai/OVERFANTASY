// Map-exit compatibility facade. Exit data, path painting, and hit queries
// live under `domain/map-exits/` by responsibility.

export type { ExitRect, ExitPathRect, MapExitConfig } from "./map-exits/types.ts";
export { mapExitConfigs, mapExitConfigFor } from "./map-exits/config.ts";
export { paintMapExitPath } from "./map-exits/paint.ts";
export { mapExitZoneFor, pointInObject, currentMapExit } from "./map-exits/query.ts";
