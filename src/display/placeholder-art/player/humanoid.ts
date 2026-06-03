import type { FacingDir, Graphics, PlayerPose } from '../types.ts';
import {
  dirVector,
  drawCapsuleLine,
  localPlayerMount,
  playerTextureCenterX,
  playerTextureFootY
} from './geometry.ts';

function drawSegmentedArm(g: Graphics, shoulder: { x: number; y: number }, elbow: { x: number; y: number }, hand: { x: number; y: number }, sleeve: number, skin: number) {
  drawCapsuleLine(g, shoulder.x, shoulder.y, elbow.x, elbow.y, sleeve, 5);
  drawCapsuleLine(g, elbow.x, elbow.y, hand.x, hand.y, skin, 4);
  g.fillStyle(0xf3c45b, 0.72);
  g.fillCircle(elbow.x, elbow.y, 2.1);
  g.fillStyle(skin, 1);
  g.fillCircle(hand.x, hand.y, 3.2);
}

function drawSegmentedLeg(g: Graphics, hip: { x: number; y: number }, knee: { x: number; y: number }, foot: { x: number; y: number }, thighColor: number, calfColor: number, bootColor: number) {
  drawCapsuleLine(g, hip.x, hip.y, knee.x, knee.y, thighColor, 5);
  drawCapsuleLine(g, knee.x, knee.y, foot.x, foot.y, calfColor, 4);
  g.fillStyle(0xf3c45b, 0.5);
  g.fillCircle(knee.x, knee.y, 2);
  g.fillStyle(bootColor, 1);
  g.fillEllipse(foot.x, foot.y + 1.3, 8, 4.6);
  g.lineStyle(1, 0x101317, 0.75);
  g.strokeEllipse(foot.x, foot.y + 1.3, 8, 4.6);
}

export function drawHumanoid(g: Graphics, base: number, trim: number, face: number, dir: FacingDir, pose: PlayerPose, monster = false) {
  const v = dirVector(dir);
  const movingPose = pose === 'walk0' || pose === 'walk1' || pose === 'run0' || pose === 'run1';
  const phaseSign = pose === 'walk0' || pose === 'run0' ? -1 : 1;
  const runPose = pose === 'run0' || pose === 'run1';
  const step = movingPose ? phaseSign * (runPose ? 5 : 3) : 0;
  const hurtLean = pose === 'hurt' ? -2 : 0;
  const bodyLift = runPose ? -1 : 0;
  const body = localPlayerMount(dir, pose, 'body');
  const foot = localPlayerMount(dir, pose, 'foot');
  const rightShoulderMount = localPlayerMount(dir, pose, 'rightShoulder');
  const leftShoulderMount = localPlayerMount(dir, pose, 'leftShoulder');
  const rightHand = localPlayerMount(dir, pose, 'rightHand');
  const leftHand = localPlayerMount(dir, pose, 'leftHand');
  const skin = monster ? 0xb482ff : 0xf1c49a;
  const hair = monster ? 0x432060 : 0x2a2018;
  const pants = monster ? 0x32203f : 0x222a36;
  const calfColor = monster ? 0x261a33 : 0x303b4a;
  const boots = 0x171a1f;
  const torsoX = body.x - 8 + hurtLean;
  const torsoY = body.y - 6 + bodyLift;
  const hipY = body.y + 10 + bodyLift;
  const headX = body.x + v.x * 2 + hurtLean;
  const headY = body.y - 18 + v.y * 0.8 + bodyLift;
  const armSwing = movingPose ? -phaseSign * (runPose ? 3.2 : 2.1) : 0;
  const leftHipX = body.x - 5 + hurtLean;
  const rightHipX = body.x + 5 + hurtLean;
  const legSwing = movingPose ? step * 0.48 : 0;
  const leftFoot = { x: foot.x - 5 + hurtLean + legSwing, y: foot.y - 1 + Math.max(0, phaseSign) * 1 + bodyLift };
  const rightFoot = { x: foot.x + 5 + hurtLean - legSwing, y: foot.y - 1 + Math.max(0, -phaseSign) * 1 + bodyLift };
  const leftKnee = { x: (leftHipX + leftFoot.x) / 2 + v.x * 0.7 - legSwing * 0.16, y: (hipY + leftFoot.y) / 2 + 2 };
  const rightKnee = { x: (rightHipX + rightFoot.x) / 2 + v.x * 0.7 + legSwing * 0.16, y: (hipY + rightFoot.y) / 2 + 2 };
  const leftShoulder = { x: leftShoulderMount.x + hurtLean, y: leftShoulderMount.y + bodyLift };
  const rightShoulder = { x: rightShoulderMount.x + hurtLean, y: rightShoulderMount.y + bodyLift };
  const leftHandPos = { x: leftHand.x + hurtLean, y: leftHand.y + bodyLift };
  const rightHandPos = { x: rightHand.x + hurtLean, y: rightHand.y + bodyLift };
  const leftElbow = { x: (leftShoulder.x + leftHandPos.x) / 2 - 1.6 - v.x * 0.4, y: (leftShoulder.y + leftHandPos.y) / 2 + 1.2 - armSwing * 0.12 };
  const rightElbow = { x: (rightShoulder.x + rightHandPos.x) / 2 + 1.6 + v.x * 0.4, y: (rightShoulder.y + rightHandPos.y) / 2 + 1.2 + armSwing * 0.12 };

  g.fillStyle(0x050608, 0.28);
  g.fillEllipse(playerTextureCenterX, playerTextureFootY + 2, 28, 8);

  drawSegmentedLeg(g, { x: leftHipX, y: hipY }, leftKnee, leftFoot, pants, calfColor, boots);
  drawSegmentedLeg(g, { x: rightHipX, y: hipY }, rightKnee, rightFoot, pants, calfColor, boots);

  if (v.y < 0) {
    drawSegmentedArm(g, leftShoulder, leftElbow, leftHandPos, base, skin);
    drawSegmentedArm(g, rightShoulder, rightElbow, rightHandPos, base, skin);
  }

  g.fillStyle(base, 1);
  g.fillRoundedRect(torsoX, torsoY, 16, 18, 5);
  g.fillStyle(base, 0.92);
  g.fillRoundedRect(torsoX + 2, torsoY + 15, 12, 7, 4);
  g.fillStyle(trim, 1);
  g.fillRect(torsoX + 2, torsoY + 8, 12, 3);
  g.fillStyle(0x101317, 0.72);
  g.fillRect(torsoX + 3, torsoY + 15, 10, 2);

  if (v.y >= 0) {
    drawSegmentedArm(g, leftShoulder, leftElbow, leftHandPos, base, skin);
    drawSegmentedArm(g, rightShoulder, rightElbow, rightHandPos, base, skin);
  }

  if (pose === 'interact') {
    g.fillStyle(0xf3c45b, 0.75);
    g.fillCircle(rightHandPos.x, rightHandPos.y, 5);
  } else if (pose === 'attack') {
    g.lineStyle(2, 0xf4f2d0, 0.9);
    g.lineBetween(rightHandPos.x, rightHandPos.y, rightHandPos.x + v.x * 9, rightHandPos.y + v.y * 9);
  }

  g.fillStyle(skin, 1);
  g.fillEllipse(headX, headY, 22, 20);
  g.fillStyle(hair, 1);
  g.fillRoundedRect(headX - 11, headY - 10, 22, 9, 5);
  g.fillCircle(headX - 6 + v.x * 2, headY - 3, 4);
  g.fillCircle(headX + 6 + v.x * 2, headY - 3, 4);
  g.fillStyle(face, 1);
  if (pose === 'hurt') {
    g.fillStyle(0xf25f5c, 1);
    g.fillRect(headX - 4, headY - 2, 4, 2);
    g.fillRect(headX + 3, headY - 2, 4, 2);
  } else if (v.y < -0.35) {
    g.fillStyle(trim, 0.92);
    g.fillCircle(headX + v.x * 3, headY + 3, 2);
  } else {
    g.fillCircle(headX + v.x * 4 - 2, headY + v.y * 2, 1.6);
    g.fillCircle(headX + v.x * 4 + 2, headY + v.y * 2, 1.6);
  }
  if (monster) {
    g.lineStyle(2, 0xd9a7ff, 0.95);
    g.lineBetween(headX - 5, headY - 6, headX - 10, headY - 12);
    g.lineBetween(headX + 5, headY - 6, headX + 10, headY - 12);
  }
  g.lineStyle(2, 0x101317, 0.9);
  g.strokeRoundedRect(torsoX, torsoY, 16, 22, 5);
  g.strokeEllipse(headX, headY, 22, 20);
}
