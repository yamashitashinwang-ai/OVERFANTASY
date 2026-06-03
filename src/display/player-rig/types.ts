import type { FacingDir, PlayerMountPose } from '../../domain/facing.ts';

export type PlayerRigPose = PlayerMountPose;

export const playerRigPartNames = [
  'head',
  'torso',
  'rightUpperArm',
  'rightForearm',
  'leftUpperArm',
  'leftForearm',
  'rightThigh',
  'rightShin',
  'leftThigh',
  'leftShin',
  'rightHand',
  'leftHand',
  'rightFoot',
  'leftFoot'
] as const;

export type PlayerRigPartName = typeof playerRigPartNames[number];

export const playerRigDebugPointNames = [
  'foot',
  'body',
  'head',
  'rightShoulder',
  'rightElbow',
  'rightHand',
  'leftShoulder',
  'leftElbow',
  'leftHand',
  'rightHip',
  'rightKnee',
  'rightFoot',
  'leftHip',
  'leftKnee',
  'leftFoot',
  'weapon'
] as const;

export type PlayerRigDebugPointName = typeof playerRigDebugPointNames[number];

export interface RigPoint {
  x: number;
  y: number;
}

export interface PlayerRigPartTransform extends RigPoint {
  rotation: number;
  scaleX: number;
  scaleY: number;
  depth: number;
}

export interface PlayerRigPoseResult {
  facing: FacingDir;
  pose: PlayerRigPose;
  parts: Record<PlayerRigPartName, PlayerRigPartTransform>;
  points: Record<PlayerRigDebugPointName, RigPoint>;
  weaponFront: boolean;
}

export interface PlayerRigMagicCastOverlay {
  stage: 'charge' | 'release';
  progress: number;
}

export interface PlayerRigSyncOptions {
  x: number;
  y: number;
  facing: FacingDir;
  pose: PlayerRigPose;
  animationProgress?: number;
  magicCast?: PlayerRigMagicCastOverlay | null;
  monsterForm: boolean;
  visualOffsetX?: number;
  visualOffsetY?: number;
  visualScale?: number;
  tint?: number | null;
  depth?: number;
}
