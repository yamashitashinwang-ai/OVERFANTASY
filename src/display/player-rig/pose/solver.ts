import { playerAnimatedMountOffsetsForFacing, playerMountOffsetsForFacing } from "../../../domain/facing.ts";
import type { FacingDir } from "../../../domain/facing.ts";
import {
  armAttachmentLiftY,
  facingVector,
  limbBaseLength
} from "../constants.ts";
import type {
  PlayerRigDebugPointName,
  PlayerRigMagicCastOverlay,
  PlayerRigPose,
  PlayerRigPoseResult,
  RigPoint
} from "../types.ts";
import { elbowPoint, kneePoint } from "./joints.ts";
import {
  add,
  clamp01,
  easeOutCubic,
  mixPoint,
  normalize,
  smoothPositiveHalfWave,
  sub
} from "./math.ts";
import { poseProgress } from "./progress.ts";
import { armDepthsForFacing, pointTransform, segmentTransform } from "./transforms.ts";

export function solvePlayerRigPose(
  facing: FacingDir,
  pose: PlayerRigPose = "idle",
  animationProgress = poseProgress(pose),
  magicCast?: PlayerRigMagicCastOverlay | null
): PlayerRigPoseResult {
  const base = playerMountOffsetsForFacing(facing);
  const animated = playerAnimatedMountOffsetsForFacing(facing, pose);
  const forward = facingVector[facing];
  const running = pose === "run0" || pose === "run1";
  const moving = pose === "walk0" || pose === "walk1" || running;
  const actionPose = pose === "interact" || pose === "hurt" || pose === "attack";
  const phase = animationProgress * Math.PI * 2;
  const legWave = moving ? Math.sin(phase) : 0;
  const armWave = -legWave;
  const idleBreath = pose === "idle" ? Math.sin(phase) : 0;
  const stepBounce = moving ? Math.sin(phase) ** 2 : 0;
  const bodyBob = moving ? -stepBounce * (running ? 1.8 : 0.9) : idleBreath * -0.55;
  const stride = moving ? (running ? 6.2 : 3.8) : 0;
  const armStride = moving ? (running ? 6.1 : 3.7) : 0;
  const footLift = moving ? (running ? 1.8 : 0.9) : 0;
  const bodyLift = bodyBob;
  const hurtShift = pose === "hurt" ? -2 : 0;
  const body = { x: base.body.x + hurtShift, y: base.body.y + bodyLift };
  const foot = { ...base.foot };
  const head = { x: body.x + forward.x * 2.1, y: body.y - 18 + forward.y * 0.8 + idleBreath * -0.25 };
  const rightBodyShoulder = { x: base.rightShoulder.x + hurtShift, y: base.rightShoulder.y + bodyLift };
  const leftBodyShoulder = { x: base.leftShoulder.x + hurtShift, y: base.leftShoulder.y + bodyLift };
  const rightShoulder = { x: rightBodyShoulder.x, y: rightBodyShoulder.y + armAttachmentLiftY };
  const leftShoulder = { x: leftBodyShoulder.x, y: leftBodyShoulder.y + armAttachmentLiftY };
  const rightSide = normalize(sub(rightBodyShoulder, body), { x: 1, y: 0 });
  const leftSide = normalize(sub(leftBodyShoulder, body), { x: -1, y: 0 });
  const rightArmForward = armWave;
  const leftArmForward = -armWave;
  const idleHandDrift = pose === "idle" ? Math.sin(phase + Math.PI * 0.35) * 0.35 : 0;
  const rightHand = actionPose
    ? { x: animated.rightHand.x + hurtShift, y: animated.rightHand.y + bodyLift + armAttachmentLiftY }
    : add(
      { x: base.rightHand.x + hurtShift, y: base.rightHand.y + bodyLift + armAttachmentLiftY + idleHandDrift },
      forward,
      rightArmForward * armStride
    );
  let leftHand = actionPose
    ? { x: animated.leftHand.x + hurtShift, y: animated.leftHand.y + bodyLift + armAttachmentLiftY }
    : add(
      { x: base.leftHand.x + hurtShift, y: base.leftHand.y + bodyLift + armAttachmentLiftY - idleHandDrift },
      forward,
      leftArmForward * armStride
    );
  if (magicCast) {
    const raise = magicCast.stage === "charge"
      ? easeOutCubic(magicCast.progress / 0.28)
      : 1;
    const raisedLeftHand = add(
      add(leftShoulder, forward, 4.6),
      { x: 0, y: -10.5 }
    );
    const chargeHand = mixPoint(leftHand, raisedLeftHand, raise);
    if (magicCast.stage === "release") {
      const releaseProgress = clamp01(magicCast.progress);
      const releaseArc = Math.sin(releaseProgress * Math.PI);
      leftHand = mixPoint(chargeHand, leftHand, easeOutCubic(releaseProgress));
      leftHand = add(leftHand, forward, releaseArc * 5.8);
      leftHand.y += releaseArc * 4.5;
    } else {
      leftHand = chargeHand;
    }
  }
  const armBend = moving ? (running ? 3.9 : 3.1) : 2.7 + Math.max(0, idleBreath) * 0.25;
  const rightElbow = elbowPoint(rightShoulder, rightHand, body, rightSide, armBend);
  const leftElbow = elbowPoint(leftShoulder, leftHand, body, leftSide, armBend);
  const hipBody = moving || actionPose ? body : { x: base.body.x + hurtShift, y: base.body.y };
  const hipY = hipBody.y + 11;
  const rightHip = { x: hipBody.x + rightSide.x * 5.1, y: hipY + rightSide.y * 1.1 };
  const leftHip = { x: hipBody.x + leftSide.x * 5.1, y: hipY + leftSide.y * 1.1 };
  const rightForward = legWave * stride;
  const leftForward = -legWave * stride;
  const rightFoot = add(add(foot, rightSide, 5), forward, rightForward * 0.58);
  rightFoot.y += moving ? -smoothPositiveHalfWave(legWave) * footLift : 0;
  const leftFoot = add(add(foot, leftSide, 5), forward, leftForward * 0.58);
  leftFoot.y += moving ? -smoothPositiveHalfWave(-legWave) * footLift : 0;
  const kneeBend = running ? 4.2 : moving ? 3.1 : 2.4;
  const rightKnee = kneePoint(rightHip, rightFoot, forward, rightSide, kneeBend);
  const leftKnee = kneePoint(leftHip, leftFoot, forward, leftSide, kneeBend);
  const armsInFront = forward.y >= -0.15;
  const legsInFront = forward.y >= 0.35;
  const armDepth = armsInFront ? 3 : 0.3;
  const armDepths = armDepthsForFacing(facing, armDepth);
  const legDepth = legsInFront ? 1.25 : 0.1;
  const torsoDepth = 1.7;
  const headDepth = forward.y < -0.35 ? 1.1 : 3.4;
  const footDepth = legsInFront ? 1.6 : 0.4;
  const rightHandDepth = armDepths.right + 0.1;
  const leftHandDepth = armDepths.left + 0.05;
  const points: Record<PlayerRigDebugPointName, RigPoint> = {
    foot,
    body,
    head,
    rightShoulder,
    rightElbow,
    rightHand,
    leftShoulder,
    leftElbow,
    leftHand,
    rightHip,
    rightKnee,
    rightFoot,
    leftHip,
    leftKnee,
    leftFoot,
    weapon: { x: rightHand.x, y: rightHand.y }
  };
  return {
    facing,
    pose,
    points,
    weaponFront: rightHandDepth > torsoDepth,
    parts: {
      head: pointTransform(head, headDepth),
      torso: pointTransform(body, torsoDepth),
      rightUpperArm: segmentTransform(rightShoulder, rightElbow, armDepths.right, limbBaseLength.rightUpperArm ?? 13),
      rightForearm: segmentTransform(rightElbow, rightHand, armDepths.right + 0.05, limbBaseLength.rightForearm ?? 13),
      leftUpperArm: segmentTransform(leftShoulder, leftElbow, armDepths.left - 0.05, limbBaseLength.leftUpperArm ?? 13),
      leftForearm: segmentTransform(leftElbow, leftHand, armDepths.left, limbBaseLength.leftForearm ?? 13),
      rightThigh: segmentTransform(rightHip, rightKnee, legDepth, limbBaseLength.rightThigh ?? 14),
      rightShin: segmentTransform(rightKnee, rightFoot, legDepth + 0.05, limbBaseLength.rightShin ?? 13),
      leftThigh: segmentTransform(leftHip, leftKnee, legDepth - 0.05, limbBaseLength.leftThigh ?? 14),
      leftShin: segmentTransform(leftKnee, leftFoot, legDepth, limbBaseLength.leftShin ?? 13),
      rightHand: pointTransform(rightHand, rightHandDepth),
      leftHand: pointTransform(leftHand, leftHandDepth),
      rightFoot: pointTransform(rightFoot, footDepth),
      leftFoot: pointTransform(leftFoot, footDepth - 0.05)
    }
  };
}
