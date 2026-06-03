import type { FacingDir, PlayerMountOffsets } from './types.ts';

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

export function handOffsetForFacing(facing: FacingDir) {
  return combatHandOffsets[facing];
}

export function playerMountOffsetsForFacing(facing: FacingDir): PlayerMountOffsets {
  return mountOffsets[facing];
}
