// Facing compatibility facade. Direction helpers, static mount offsets, and
// pose-aware mount animation live under domain/facing/ by responsibility.

export type { FacingDir, PlayerMountOffsets, PlayerMountPose } from './facing/types.ts';
export { facingDirs, isFacingDir, directionFromAngle } from './facing/directions.ts';
export { handOffsetForFacing, playerMountOffsetsForFacing } from './facing/mounts.ts';
export { playerAnimatedMountOffsetsForFacing } from './facing/animation.ts';
