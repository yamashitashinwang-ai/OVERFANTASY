import type { Direction8 } from './types.ts';

export type FacingDir = Direction8;

export const facingDirs: FacingDir[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

export type PlayerMountPose = 'idle' | 'walk0' | 'walk1' | 'run0' | 'run1' | 'interact' | 'hurt' | 'attack';

export interface PlayerMountOffsets {
  foot: { x: number; y: number };
  body: { x: number; y: number };
  rightShoulder: { x: number; y: number };
  leftShoulder: { x: number; y: number };
  rightHand: { x: number; y: number };
  leftHand: { x: number; y: number };
  mainHand: { x: number; y: number };
  offHand: { x: number; y: number };
  weapon: { x: number; y: number; front: boolean };
}

type MountConfig = Omit<PlayerMountOffsets, 'mainHand' | 'offHand'>;

function withHandAliases(config: MountConfig): PlayerMountOffsets {
  return {
    ...config,
    mainHand: config.rightHand,
    offHand: config.leftHand
  };
}

const mountOffsets: Record<FacingDir, PlayerMountOffsets> = {
  n: withHandAliases({
    foot: { x: 0, y: 0 },
    body: { x: 0, y: -21 },
    rightShoulder: { x: 7, y: -25 },
    leftShoulder: { x: -7, y: -25 },
    rightHand: { x: 9, y: -18 },
    leftHand: { x: -9, y: -19 },
    weapon: { x: 9, y: -18, front: false }
  }),
  ne: withHandAliases({
    foot: { x: 0, y: 0 },
    body: { x: 1, y: -21 },
    rightShoulder: { x: 8, y: -23 },
    leftShoulder: { x: -6, y: -26 },
    rightHand: { x: 13, y: -16 },
    leftHand: { x: -8, y: -20 },
    weapon: { x: 13, y: -16, front: false }
  }),
  e: withHandAliases({
    foot: { x: 0, y: 0 },
    body: { x: 1, y: -20 },
    rightShoulder: { x: 8, y: -18 },
    leftShoulder: { x: -5, y: -23 },
    rightHand: { x: 15, y: -12 },
    leftHand: { x: -8, y: -17 },
    weapon: { x: 15, y: -12, front: true }
  }),
  se: withHandAliases({
    foot: { x: 0, y: 0 },
    body: { x: 1, y: -19 },
    rightShoulder: { x: -7, y: -22 },
    leftShoulder: { x: 7, y: -22 },
    rightHand: { x: -13, y: -11 },
    leftHand: { x: 10, y: -12 },
    weapon: { x: -13, y: -11, front: true }
  }),
  s: withHandAliases({
    foot: { x: 0, y: 0 },
    body: { x: 0, y: -19 },
    rightShoulder: { x: -7, y: -22 },
    leftShoulder: { x: 7, y: -22 },
    rightHand: { x: -10, y: -11 },
    leftHand: { x: 10, y: -11 },
    weapon: { x: -10, y: -11, front: true }
  }),
  sw: withHandAliases({
    foot: { x: 0, y: 0 },
    body: { x: -1, y: -19 },
    rightShoulder: { x: -8, y: -22 },
    leftShoulder: { x: 6, y: -23 },
    rightHand: { x: -13, y: -12 },
    leftHand: { x: 8, y: -17 },
    weapon: { x: -13, y: -12, front: true }
  }),
  w: withHandAliases({
    foot: { x: 0, y: 0 },
    body: { x: -1, y: -20 },
    rightShoulder: { x: -8, y: -18 },
    leftShoulder: { x: 5, y: -23 },
    rightHand: { x: -15, y: -12 },
    leftHand: { x: 8, y: -17 },
    weapon: { x: -15, y: -12, front: true }
  }),
  nw: withHandAliases({
    foot: { x: 0, y: 0 },
    body: { x: -1, y: -21 },
    rightShoulder: { x: 6, y: -26 },
    leftShoulder: { x: -8, y: -23 },
    rightHand: { x: 9, y: -18 },
    leftHand: { x: -12, y: -18 },
    weapon: { x: 9, y: -18, front: false }
  })
};

const combatHandOffsets: Record<FacingDir, { x: number; y: number; front: boolean }> = {
  n: { x: -7, y: -27, front: false },
  ne: { x: 9, y: -27, front: false },
  e: { x: 13, y: -21, front: true },
  se: { x: 11, y: -17, front: true },
  s: { x: 8, y: -16, front: true },
  sw: { x: -11, y: -17, front: true },
  w: { x: -13, y: -21, front: true },
  nw: { x: -9, y: -27, front: false }
};

export function isFacingDir(value: unknown): value is FacingDir {
  return typeof value === 'string' && facingDirs.includes(value as FacingDir);
}

export function directionFromAngle(angle: number): FacingDir {
  const oct = Math.round(angle / (Math.PI / 4));
  return (['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'][((oct % 8) + 8) % 8] || 's') as FacingDir;
}

export function handOffsetForFacing(facing: FacingDir) {
  return combatHandOffsets[facing];
}

export function playerMountOffsetsForFacing(facing: FacingDir): PlayerMountOffsets {
  return mountOffsets[facing];
}

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
  const base = mountOffsets[facing];
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
