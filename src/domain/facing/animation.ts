import type { FacingDir, PlayerMountOffsets, PlayerMountPose } from './types.ts';
import { playerMountOffsetsForFacing } from './mounts.ts';

function rotateAround(point: { x: number; y: number }, origin: { x: number; y: number }, radians: number) {
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: origin.x + dx * cos - dy * sin,
    y: origin.y + dx * sin + dy * cos
  };
}

function armSwingRadians(pose: PlayerMountPose) {
  if (pose === 'walk0') return -0.16;
  if (pose === 'walk1') return 0.16;
  if (pose === 'run0') return -0.28;
  if (pose === 'run1') return 0.28;
  return 0;
}

export function playerAnimatedMountOffsetsForFacing(
  facing: FacingDir,
  pose: PlayerMountPose = 'idle'
): PlayerMountOffsets {
  const base = playerMountOffsetsForFacing(facing);
  const rightSwing = armSwingRadians(pose);
  const leftSwing = -rightSwing;
  let rightHand = rotateAround(base.rightHand, base.rightShoulder, rightSwing);
  let leftHand = rotateAround(base.leftHand, base.leftShoulder, leftSwing);

  if (pose === 'interact') {
    rightHand = {
      x: base.rightShoulder.x + (base.rightHand.x - base.rightShoulder.x) * 0.35,
      y: base.rightShoulder.y - 7
    };
  } else if (pose === 'attack') {
    const dx = base.rightHand.x - base.rightShoulder.x;
    const dy = base.rightHand.y - base.rightShoulder.y;
    rightHand = {
      x: base.rightHand.x + dx * 0.28,
      y: base.rightHand.y + dy * 0.18
    };
  } else if (pose === 'hurt') {
    rightHand = { x: base.rightHand.x, y: base.rightHand.y + 2 };
    leftHand = { x: base.leftHand.x, y: base.leftHand.y + 2 };
  }

  const weapon = {
    x: rightHand.x,
    y: rightHand.y,
    front: base.weapon.front
  };
  return {
    ...base,
    rightHand,
    leftHand,
    mainHand: rightHand,
    offHand: leftHand,
    weapon
  };
}
