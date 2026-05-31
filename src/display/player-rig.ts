import type Phaser from 'phaser';
import {
  facingDirs,
  playerAnimatedMountOffsetsForFacing,
  playerMountOffsetsForFacing
} from '../domain/facing.ts';
import type { FacingDir, PlayerMountPose } from '../domain/facing.ts';
import { playerRigTextureKey } from './placeholder-art.ts';
import type { PlayerRigTexturePart } from './placeholder-art.ts';

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

interface PlayerRigSyncOptions {
  x: number;
  y: number;
  facing: FacingDir;
  pose: PlayerRigPose;
  animationProgress?: number;
  monsterForm: boolean;
  visualOffsetX?: number;
  visualOffsetY?: number;
  visualScale?: number;
  tint?: number | null;
  depth?: number;
}

const partTexture: Record<PlayerRigPartName, PlayerRigTexturePart> = {
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

const limbBaseLength: Partial<Record<PlayerRigPartName, number>> = {
  rightUpperArm: 13,
  leftUpperArm: 13,
  rightForearm: 13,
  leftForearm: 13,
  rightThigh: 14,
  leftThigh: 14,
  rightShin: 13,
  leftShin: 13
};

const partOrigins: Record<PlayerRigPartName, { x: number; y: number }> = {
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

const facingVector: Record<FacingDir, RigPoint> = {
  n: { x: 0, y: -1 },
  ne: { x: 0.7, y: -0.7 },
  e: { x: 1, y: 0 },
  se: { x: 0.7, y: 0.7 },
  s: { x: 0, y: 1 },
  sw: { x: -0.7, y: 0.7 },
  w: { x: -1, y: 0 },
  nw: { x: -0.7, y: -0.7 }
};

function add(a: RigPoint, b: RigPoint, scale = 1): RigPoint {
  return { x: a.x + b.x * scale, y: a.y + b.y * scale };
}

function sub(a: RigPoint, b: RigPoint): RigPoint {
  return { x: a.x - b.x, y: a.y - b.y };
}

function normalize(v: RigPoint, fallback: RigPoint): RigPoint {
  const len = Math.hypot(v.x, v.y);
  if (len < 0.001) return fallback;
  return { x: v.x / len, y: v.y / len };
}

function mid(a: RigPoint, b: RigPoint): RigPoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function segmentTransform(from: RigPoint, to: RigPoint, depth: number, baseLength: number): PlayerRigPartTransform {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return {
    x: from.x,
    y: from.y,
    rotation: Math.atan2(dy, dx) - Math.PI / 2,
    scaleX: 1,
    scaleY: Math.max(0.45, Math.hypot(dx, dy) / baseLength),
    depth
  };
}

function pointTransform(point: RigPoint, depth: number): PlayerRigPartTransform {
  return {
    ...point,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    depth
  };
}

function poseProgress(pose: PlayerRigPose) {
  if (pose === 'walk0' || pose === 'run0') return 0.25;
  if (pose === 'walk1' || pose === 'run1') return 0.75;
  return 0;
}

function elbowPoint(shoulder: RigPoint, hand: RigPoint, body: RigPoint, side: RigPoint, bend: number): RigPoint {
  const shoulderToHand = sub(hand, shoulder);
  const acrossBody = normalize(sub(shoulder, body), side);
  const alongArm = normalize(shoulderToHand, { x: 0, y: 1 });
  const m = mid(shoulder, hand);
  return {
    x: m.x + acrossBody.x * bend + alongArm.x * 1.2,
    y: m.y + acrossBody.y * bend + alongArm.y * 1.2
  };
}

function kneePoint(hip: RigPoint, foot: RigPoint, facing: RigPoint, side: RigPoint, bend: number): RigPoint {
  const m = mid(hip, foot);
  return {
    x: m.x + facing.x * bend * 0.35 + side.x * bend * 0.25,
    y: m.y + 2 + facing.y * bend * 0.25 + side.y * bend * 0.2
  };
}

export function solvePlayerRigPose(
  facing: FacingDir,
  pose: PlayerRigPose = 'idle',
  animationProgress = poseProgress(pose)
): PlayerRigPoseResult {
  const base = playerMountOffsetsForFacing(facing);
  const animated = playerAnimatedMountOffsetsForFacing(facing, pose);
  const forward = facingVector[facing];
  const running = pose === 'run0' || pose === 'run1';
  const moving = pose === 'walk0' || pose === 'walk1' || running;
  const actionPose = pose === 'interact' || pose === 'hurt' || pose === 'attack';
  const phase = animationProgress * Math.PI * 2;
  const legWave = moving ? Math.sin(phase) : 0;
  const armWave = -legWave;
  const idleBreath = pose === 'idle' ? Math.sin(phase) : 0;
  const bodyBob = moving ? -Math.abs(Math.sin(phase)) * (running ? 1.8 : 0.9) : idleBreath * -0.55;
  const stride = moving ? (running ? 6.2 : 3.8) : 0;
  const armStride = moving ? (running ? 6.1 : 3.7) : 0;
  const footLift = moving ? (running ? 1.8 : 0.9) : 0;
  const bodyLift = bodyBob;
  const hurtShift = pose === 'hurt' ? -2 : 0;
  const body = { x: base.body.x + hurtShift, y: base.body.y + bodyLift };
  const foot = { ...base.foot };
  const head = { x: body.x + forward.x * 2.1, y: body.y - 18 + forward.y * 0.8 + idleBreath * -0.25 };
  const rightShoulder = { x: base.rightShoulder.x + hurtShift, y: base.rightShoulder.y + bodyLift };
  const leftShoulder = { x: base.leftShoulder.x + hurtShift, y: base.leftShoulder.y + bodyLift };
  const rightSide = normalize(sub(rightShoulder, body), { x: 1, y: 0 });
  const leftSide = normalize(sub(leftShoulder, body), { x: -1, y: 0 });
  const rightArmForward = armWave;
  const leftArmForward = -armWave;
  const idleHandDrift = pose === 'idle' ? Math.sin(phase + Math.PI * 0.35) * 0.35 : 0;
  const rightHand = actionPose
    ? { x: animated.rightHand.x + hurtShift, y: animated.rightHand.y + bodyLift }
    : add(
      { x: base.rightHand.x + hurtShift, y: base.rightHand.y + bodyLift + idleHandDrift },
      forward,
      rightArmForward * armStride
    );
  const leftHand = actionPose
    ? { x: animated.leftHand.x + hurtShift, y: animated.leftHand.y + bodyLift }
    : add(
      { x: base.leftHand.x + hurtShift, y: base.leftHand.y + bodyLift - idleHandDrift },
      forward,
      leftArmForward * armStride
    );
  const armBend = moving ? (running ? 3.9 : 3.1) : 2.7 + Math.max(0, idleBreath) * 0.25;
  const rightElbow = elbowPoint(rightShoulder, rightHand, body, rightSide, armBend);
  const leftElbow = elbowPoint(leftShoulder, leftHand, body, leftSide, armBend);
  const hipY = body.y + 11;
  const rightHip = { x: body.x + rightSide.x * 5.1, y: hipY + rightSide.y * 1.1 };
  const leftHip = { x: body.x + leftSide.x * 5.1, y: hipY + leftSide.y * 1.1 };
  const rightForward = legWave * stride;
  const leftForward = -legWave * stride;
  const rightFoot = add(add(foot, rightSide, 5), forward, rightForward * 0.58);
  rightFoot.y += bodyLift - Math.max(0, legWave) * footLift;
  const leftFoot = add(add(foot, leftSide, 5), forward, leftForward * 0.58);
  leftFoot.y += bodyLift - Math.max(0, -legWave) * footLift;
  const kneeBend = running ? 4.2 : moving ? 3.1 : 2.4;
  const rightKnee = kneePoint(rightHip, rightFoot, forward, rightSide, kneeBend);
  const leftKnee = kneePoint(leftHip, leftFoot, forward, leftSide, kneeBend);
  const armsInFront = forward.y >= -0.15;
  const legsInFront = forward.y >= 0.35;
  const armDepth = armsInFront ? 3 : 0.3;
  const legDepth = legsInFront ? 1.25 : 0.1;
  const torsoDepth = 1.7;
  const headDepth = forward.y < -0.35 ? 1.1 : 3.4;
  const footDepth = legsInFront ? 1.6 : 0.4;
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
    weaponFront: animated.weapon.front,
    parts: {
      head: pointTransform(head, headDepth),
      torso: pointTransform(body, torsoDepth),
      rightUpperArm: segmentTransform(rightShoulder, rightElbow, armDepth, limbBaseLength.rightUpperArm ?? 13),
      rightForearm: segmentTransform(rightElbow, rightHand, armDepth + 0.05, limbBaseLength.rightForearm ?? 13),
      leftUpperArm: segmentTransform(leftShoulder, leftElbow, armDepth - 0.05, limbBaseLength.leftUpperArm ?? 13),
      leftForearm: segmentTransform(leftElbow, leftHand, armDepth, limbBaseLength.leftForearm ?? 13),
      rightThigh: segmentTransform(rightHip, rightKnee, legDepth, limbBaseLength.rightThigh ?? 14),
      rightShin: segmentTransform(rightKnee, rightFoot, legDepth + 0.05, limbBaseLength.rightShin ?? 13),
      leftThigh: segmentTransform(leftHip, leftKnee, legDepth - 0.05, limbBaseLength.leftThigh ?? 14),
      leftShin: segmentTransform(leftKnee, leftFoot, legDepth, limbBaseLength.leftShin ?? 13),
      rightHand: pointTransform(rightHand, armDepth + 0.1),
      leftHand: pointTransform(leftHand, armDepth + 0.05),
      rightFoot: pointTransform(rightFoot, footDepth),
      leftFoot: pointTransform(leftFoot, footDepth - 0.05)
    }
  };
}

function isRigFacingDir(value: unknown): value is FacingDir {
  return typeof value === 'string' && facingDirs.includes(value as FacingDir);
}

export class PlayerRig {
  readonly root: Phaser.GameObjects.Container;

  private readonly parts: Record<PlayerRigPartName, Phaser.GameObjects.Image>;
  private currentPose: PlayerRigPoseResult | null = null;
  private visualOffset: RigPoint = { x: 0, y: 0 };
  private monsterForm = false;

  constructor(scene: Phaser.Scene) {
    this.root = scene.add.container(0, 0).setName('playerRig');
    this.parts = playerRigPartNames.reduce((acc, name) => {
      const texture = playerRigTextureKey(partTexture[name], false);
      const image = scene.add.image(0, 0, texture).setName(`playerRig:${name}`);
      const origin = partOrigins[name];
      image.setOrigin(origin.x, origin.y);
      acc[name] = image;
      return acc;
    }, {} as Record<PlayerRigPartName, Phaser.GameObjects.Image>);
    this.root.add(Object.values(this.parts));
  }

  sync(options: PlayerRigSyncOptions) {
    const facing = isRigFacingDir(options.facing) ? options.facing : 's';
    const pose = options.pose;
    const solved = solvePlayerRigPose(facing, pose, options.animationProgress);
    this.currentPose = solved;
    this.visualOffset = { x: options.visualOffsetX ?? 0, y: options.visualOffsetY ?? 0 };
    this.monsterForm = options.monsterForm;
    this.root.setPosition(options.x, options.y);
    this.root.setDepth(options.depth ?? 6);
    this.root.setVisible(true);
    const visualScale = options.visualScale ?? 1;
    for (const name of playerRigPartNames) {
      const image = this.parts[name];
      const transform = solved.parts[name];
      image.setTexture(playerRigTextureKey(partTexture[name], this.monsterForm));
      image.setPosition(transform.x + this.visualOffset.x, transform.y + this.visualOffset.y);
      image.setRotation(transform.rotation);
      image.setScale(transform.scaleX * visualScale, transform.scaleY * visualScale);
      image.setDepth(transform.depth);
      if (options.tint) image.setTint(options.tint);
      else image.clearTint();
    }
    const sortable = this.root as Phaser.GameObjects.Container & { sort?: (property: string) => void };
    sortable.sort?.('depth');
  }

  weaponAnchorWorld(): { x: number; y: number; front: boolean } | null {
    if (!this.currentPose) return null;
    const weapon = this.currentPose.points.weapon;
    return {
      x: this.root.x + weapon.x + this.visualOffset.x,
      y: this.root.y + weapon.y + this.visualOffset.y,
      front: this.currentPose.weaponFront
    };
  }

  debugPointsWorld(): Record<PlayerRigDebugPointName, RigPoint> | null {
    if (!this.currentPose) return null;
    return playerRigDebugPointNames.reduce((acc, name) => {
      const point = this.currentPose!.points[name];
      acc[name] = {
        x: this.root.x + point.x + this.visualOffset.x,
        y: this.root.y + point.y + this.visualOffset.y
      };
      return acc;
    }, {} as Record<PlayerRigDebugPointName, RigPoint>);
  }

  get depth() {
    return this.root.depth;
  }

  setVisible(visible: boolean) {
    this.root.setVisible(visible);
  }

  destroy() {
    this.root.destroy(true);
  }
}
