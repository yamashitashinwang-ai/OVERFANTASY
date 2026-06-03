// Player world-display compatibility facade. Camera anchoring, movement
// detection, aim-facing sync, rig/sprite sync, and corruption aura drawing live
// under `world/player/` by responsibility.

export type { CameraScrollInput, PlayerDisplayMotionInput } from './player/types.ts';
export { computeCameraScrollForAnchor, syncCameraToPlayerAnchor } from './player/camera.ts';
export { playerDisplayMotionFromKinematics, resetPlayerDisplayPixel } from './player/motion.ts';
export { syncPlayerDisplay } from './player/sync.ts';
