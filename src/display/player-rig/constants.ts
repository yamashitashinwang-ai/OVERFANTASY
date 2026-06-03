import type { FacingDir } from '../../domain/facing.ts';
import type { PlayerRigTexturePart } from '../placeholder-art.ts';
import type { PlayerRigPartName, RigPoint } from './types.ts';

export const partTexture: Record<PlayerRigPartName, PlayerRigTexturePart> = {
  head: 'head',
  torso: 'torso',
  rightUpperArm: 'upperArm',
  rightForearm: 'forearm',
  leftUpperArm: 'upperArm',
  leftForearm: 'forearm',
  rightThigh: 'thigh',
  rightShin: 'shin',
  leftThigh: 'thigh',
  leftShin: 'shin',
  rightHand: 'hand',
  leftHand: 'hand',
  rightFoot: 'foot',
  leftFoot: 'foot'
};

export const limbBaseLength: Partial<Record<PlayerRigPartName, number>> = {
  rightUpperArm: 13,
  leftUpperArm: 13,
  rightForearm: 13,
  leftForearm: 13,
  rightThigh: 14,
  leftThigh: 14,
  rightShin: 13,
  leftShin: 13
};

export const partOrigins: Record<PlayerRigPartName, { x: number; y: number }> = {
  head: { x: 0.5, y: 0.5 },
  torso: { x: 0.5, y: 0.5 },
  rightUpperArm: { x: 0.5, y: 0.13 },
  rightForearm: { x: 0.5, y: 0.13 },
  leftUpperArm: { x: 0.5, y: 0.13 },
  leftForearm: { x: 0.5, y: 0.13 },
  rightThigh: { x: 0.5, y: 0.13 },
  rightShin: { x: 0.5, y: 0.13 },
  leftThigh: { x: 0.5, y: 0.13 },
  leftShin: { x: 0.5, y: 0.13 },
  rightHand: { x: 0.5, y: 0.5 },
  leftHand: { x: 0.5, y: 0.5 },
  rightFoot: { x: 0.5, y: 0.5 },
  leftFoot: { x: 0.5, y: 0.5 }
};

export const armAttachmentLiftY = -3;

export const facingVector: Record<FacingDir, RigPoint> = {
  n: { x: 0, y: -1 },
  ne: { x: 0.7, y: -0.7 },
  e: { x: 1, y: 0 },
  se: { x: 0.7, y: 0.7 },
  s: { x: 0, y: 1 },
  sw: { x: -0.7, y: 0.7 },
  w: { x: -1, y: 0 },
  nw: { x: -0.7, y: -0.7 }
};
