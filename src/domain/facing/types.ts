import type { Direction8 } from '../types.ts';

export type FacingDir = Direction8;

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
