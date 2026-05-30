import { runtime, state } from '../../runtime/state.ts';
import { tile } from '../../runtime/constants.ts';
import { directionFromAngle, handOffsetForFacing, isFacingDir } from '../facing.ts';

export function bowProjectileOrigin(angle: number) {
  const candidate = runtime.facingDirection || runtime.aimDirection;
  const facing = isFacingDir(candidate) ? candidate : directionFromAngle(angle);
  const offset = handOffsetForFacing(facing);
  return {
    x: state.player.x + offset.x / tile,
    y: state.player.y + offset.y / tile
  };
}
