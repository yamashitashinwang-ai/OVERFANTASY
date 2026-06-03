import { display as D } from '../runtime.ts';
import { playerLocomotionPose } from '../player-animation-timing.ts';
import { state, runtime } from '../../runtime/state.ts';
import { tile } from '../../runtime/constants.ts';
import { playerAimAngle } from '../../runtime/input.ts';
import { directionFromAngle, handOffsetForFacing, isFacingDir, playerAnimatedMountOffsetsForFacing } from '../facing.ts';
import type { FacingDir, PlayerMountPose } from '../facing.ts';

export function currentFacingDirection(): FacingDir {
  const candidate = runtime.facingDirection || runtime.aimDirection;
  if (isFacingDir(candidate)) return candidate;
  return directionFromAngle(playerAimAngle());
}

export function currentPlayerMountPose(): PlayerMountPose {
  const body = D.playerCircle?.body as { velocity?: { x?: number; y?: number } } | null | undefined;
  const speed = Math.hypot(body?.velocity?.x ?? 0, body?.velocity?.y ?? 0);
  const moving = speed > 1 || state.player.running;
  if (!moving) return 'idle';
  return playerLocomotionPose(state.time, state.player.running);
}

export function playerVisualWeaponAnchor() {
  const facing = currentFacingDirection();
  const rigAnchor = D.playerRig?.weaponAnchorWorld();
  if (rigAnchor) {
    return {
      facing,
      x: rigAnchor.x,
      y: rigAnchor.y,
      front: rigAnchor.front
    };
  }
  const baseX = D.playerCircle?.x ?? state.player.x * tile;
  const baseY = D.playerCircle?.y ?? state.player.y * tile;
  const mounts = playerAnimatedMountOffsetsForFacing(facing, currentPlayerMountPose());
  return {
    facing,
    x: baseX + mounts.weapon.x,
    y: baseY + mounts.weapon.y,
    front: mounts.weapon.front
  };
}

export function playerStaticWeaponAnchor() {
  const facing = currentFacingDirection();
  const baseX = state.player.x * tile;
  const baseY = state.player.y * tile;
  const offset = handOffsetForFacing(facing);
  return {
    facing,
    x: baseX + offset.x,
    y: baseY + offset.y,
    front: offset.front
  };
}
