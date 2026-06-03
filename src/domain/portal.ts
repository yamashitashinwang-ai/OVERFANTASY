// Portal compatibility facade. Portal target types, action encoding, and scene
// spawn resolution live under `domain/portal/` by responsibility.

export type { PortalTarget, SceneSpawnResolution } from './portal/types.ts';
export { portalAction, parsePortalAction } from './portal/actions.ts';
export { sceneSpawnPoints, resolveSceneSpawn } from './portal/spawns.ts';
