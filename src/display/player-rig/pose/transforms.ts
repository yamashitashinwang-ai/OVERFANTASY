import type { FacingDir } from "../../../domain/facing.ts";
import type { PlayerRigPartTransform, RigPoint } from "../types.ts";

export function segmentTransform(from: RigPoint, to: RigPoint, depth: number, baseLength: number): PlayerRigPartTransform {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return {
    x: from.x,
    y: from.y,
    rotation: Math.atan2(dy, dx) - Math.PI / 2,
    scaleX: 1,
    scaleY: Math.max(0.45, Math.hypot(dx, dy) / baseLength),
    depth
  };
}

export function pointTransform(point: RigPoint, depth: number): PlayerRigPartTransform {
  return {
    ...point,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    depth
  };
}

export function armDepthsForFacing(facing: FacingDir, defaultArmDepth: number) {
  if (facing === "nw" || facing === "w" || facing === "sw") {
    return { right: 0.3, left: 3 };
  }
  if (facing === "ne" || facing === "e" || facing === "se") {
    return { right: 3, left: 0.3 };
  }
  return { right: defaultArmDepth, left: defaultArmDepth };
}
