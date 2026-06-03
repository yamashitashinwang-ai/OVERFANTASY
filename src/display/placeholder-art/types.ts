import type Phaser from 'phaser';

export type Graphics = Phaser.GameObjects.Graphics;
export type FacingDir = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
export type PlayerPose = 'idle' | 'walk0' | 'walk1' | 'run0' | 'run1' | 'interact' | 'hurt' | 'attack';
export type PlayerRigTexturePart = 'head' | 'torso' | 'upperArm' | 'forearm' | 'thigh' | 'shin' | 'hand' | 'foot';
export type ReservedPlayerAttackAnimationName =
  | 'attack_sword'
  | 'attack_dagger'
  | 'attack_spear'
  | 'attack_hammer'
  | 'attack_bow'
  | 'cast_magic';
