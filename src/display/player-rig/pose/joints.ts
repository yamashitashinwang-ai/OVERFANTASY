import type { RigPoint } from "../types.ts";
import { mid, normalize, sub } from "./math.ts";

export function elbowPoint(shoulder: RigPoint, hand: RigPoint, body: RigPoint, side: RigPoint, bend: number): RigPoint {
  const shoulderToHand = sub(hand, shoulder);
  const acrossBody = normalize(sub(shoulder, body), side);
  const alongArm = normalize(shoulderToHand, { x: 0, y: 1 });
  const m = mid(shoulder, hand);
  return {
    x: m.x + acrossBody.x * bend + alongArm.x * 1.2,
    y: m.y + acrossBody.y * bend + alongArm.y * 1.2
  };
}

export function kneePoint(hip: RigPoint, foot: RigPoint, facing: RigPoint, side: RigPoint, bend: number): RigPoint {
  const m = mid(hip, foot);
  return {
    x: m.x + facing.x * bend * 0.35 + side.x * bend * 0.25,
    y: m.y + 2 + facing.y * bend * 0.25 + side.y * bend * 0.2
  };
}
