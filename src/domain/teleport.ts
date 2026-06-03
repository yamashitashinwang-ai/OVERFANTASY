// Teleport compatibility facade. Portal target extraction, scene transition,
// cooldown constants, and map-exit triggering live under `domain/teleport/`.

export { TELEPORT_COOLDOWN_SECONDS } from './teleport/constants.ts';
export { portalTargetFor } from './teleport/target.ts';
export { teleportThroughPortal } from './teleport/portal.ts';
export { triggerMapExitIfNeeded } from './teleport/map-exit.ts';
