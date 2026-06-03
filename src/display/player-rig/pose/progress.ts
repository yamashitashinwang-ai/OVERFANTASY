import type { PlayerRigPose } from "../types.ts";

export function poseProgress(pose: PlayerRigPose) {
  if (pose === "walk0" || pose === "run0") return 0.25;
  if (pose === "walk1" || pose === "run1") return 0.75;
  return 0;
}
