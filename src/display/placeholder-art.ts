// Generated placeholder art. These textures are deliberately simple and live
// in code so gameplay data, collision, and visual size stay separate.

import type Phaser from 'phaser';
import { hexToInt } from './colors.ts';
import type { ActorState, PetState, WorldObjectState } from '../domain/types.ts';
import { playerAnimatedMountOffsetsForFacing } from '../domain/facing.ts';

type Graphics = Phaser.GameObjects.Graphics;
export type FacingDir = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
export type PlayerPose = 'idle' | 'walk0' | 'walk1' | 'run0' | 'run1' | 'interact' | 'hurt' | 'attack';
export type ReservedPlayerAttackAnimationName =
  | 'attack_sword'
  | 'attack_dagger'
  | 'attack_spear'
  | 'attack_hammer'
  | 'attack_bow'
  | 'cast_magic';

const actorDirs: FacingDir[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
const playerPoses: PlayerPose[] = ['idle', 'walk0', 'walk1', 'run0', 'run1', 'interact', 'hurt', 'attack'];
const playerTextureW = 48;
const playerTextureH = 64;
const playerTextureCenterX = playerTextureW / 2;
const playerTextureFootY = 56;
export const reservedPlayerAttackAnimationNames: ReservedPlayerAttackAnimationName[] = [
  'attack_sword',
  'attack_dagger',
  'attack_spear',
  'attack_hammer',
  'attack_bow',
  'cast_magic'
];
const graphicsConfig = (config: object) => config as Phaser.Types.GameObjects.Graphics.Options;

function makeTexture(scene: Phaser.Scene, key: string, w: number, h: number, draw: (g: Graphics) => void) {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics(graphicsConfig({ x: 0, y: 0, add: false }));
  draw(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

export function dirVector(dir: FacingDir) {
  const map: Record<FacingDir, { x: number; y: number }> = {
    n: { x: 0, y: -1 },
    ne: { x: 0.7, y: -0.7 },
    e: { x: 1, y: 0 },
    se: { x: 0.7, y: 0.7 },
    s: { x: 0, y: 1 },
    sw: { x: -0.7, y: 0.7 },
    w: { x: -1, y: 0 },
    nw: { x: -0.7, y: -0.7 }
  };
  return map[dir];
}

export function facingFromDelta(dx: number, dy: number, fallback: FacingDir): FacingDir {
  if (Math.hypot(dx, dy) < 0.35) return fallback;
  const angle = Math.atan2(dy, dx);
  const oct = Math.round(angle / (Math.PI / 4));
  return (['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'][((oct % 8) + 8) % 8] || fallback) as FacingDir;
}

export function playerTextureKey(dir: FacingDir, pose: PlayerPose, monsterForm?: boolean): string;
export function playerTextureKey(dir: FacingDir, moving: boolean, phase?: 0 | 1, monsterForm?: boolean): string;
export function playerTextureKey(
  dir: FacingDir,
  poseOrMoving: PlayerPose | boolean,
  phaseOrMonsterForm: 0 | 1 | boolean = 0,
  monsterForm = false
) {
  let pose: PlayerPose;
  let form = monsterForm;
  if (typeof poseOrMoving === 'boolean') {
    const phase = phaseOrMonsterForm === 1 ? 1 : 0;
    pose = poseOrMoving ? (phase === 0 ? 'walk0' : 'walk1') : 'idle';
  } else {
    pose = poseOrMoving;
    form = typeof phaseOrMonsterForm === 'boolean' ? phaseOrMonsterForm : monsterForm;
  }
  return `of:player:${form ? 'monster' : 'human'}:${dir}:${pose}`;
}

export function entityTextureKey(actor: ActorState): string {
  if (actor.kind === 'npc') {
    const faction = ['elf', 'dwarf', 'human'].includes(actor.faction || '') ? actor.faction : 'human';
    return `of:npc:${actor.wounded ? 'wounded' : faction}`;
  }
  if (actor.kind === 'friendly' || actor.species === 'treant') return 'of:creature:treant';
  if (actor.species === 'rabbit' || actor.kind === 'animal') return 'of:creature:rabbit';
  if (actor.species) return `of:monster:${actor.species}`;
  if (actor.faction === 'monster') return 'of:monster:slime';
  return 'of:npc:human';
}

export function petTextureKey(pet: PetState): string {
  if (pet.injured) return 'of:pet:injured';
  if (pet.name.includes('狼')) return 'of:pet:wolf';
  if (pet.name.includes('树')) return 'of:pet:treant';
  return 'of:pet:default';
}

export function objectTextureKey(obj: WorldObjectState): string {
  if (obj.kind === 'tree') return 'of:object:tree';
  if (obj.kind === 'bush') return 'of:object:bush';
  if (obj.kind === 'leafPile') return 'of:object:leafPile';
  if (obj.kind === 'windFlag') return 'of:object:windFlag';
  if (obj.kind === 'roadSign') return 'of:object:roadSign';
  if (obj.action === 'dungeon') return 'of:object:ruinsGate';
  if (obj.action === 'demonKeep') return 'of:object:demonGate';
  if (obj.kind === 'magicCottage') return 'of:object:magic';
  if (['shop', 'guild', 'forge', 'shrine', 'house', 'dungeon'].includes(obj.kind)) return `of:object:${obj.kind}`;
  return 'of:object:default';
}

function localPlayerMount(
  dir: FacingDir,
  pose: PlayerPose,
  name: 'foot' | 'body' | 'rightShoulder' | 'leftShoulder' | 'rightHand' | 'leftHand' | 'weapon'
) {
  const offset = playerAnimatedMountOffsetsForFacing(dir, pose)[name];
  return { x: playerTextureCenterX + offset.x, y: playerTextureFootY + offset.y };
}

function drawCapsuleLine(g: Graphics, fromX: number, fromY: number, toX: number, toY: number, color: number, width: number) {
  const outlineR = width / 2 + 1;
  const fillR = width / 2;
  g.lineStyle(width + 2, 0x101317, 0.72);
  g.lineBetween(fromX, fromY, toX, toY);
  g.fillStyle(0x101317, 0.72);
  g.fillCircle(fromX, fromY, outlineR);
  g.fillCircle(toX, toY, outlineR);
  g.lineStyle(width, color, 1);
  g.lineBetween(fromX, fromY, toX, toY);
  g.fillStyle(color, 1);
  g.fillCircle(fromX, fromY, fillR);
  g.fillCircle(toX, toY, fillR);
}

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

function drawHumanoid(g: Graphics, base: number, trim: number, face: number, dir: FacingDir, pose: PlayerPose, monster = false) {
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

function drawNpc(g: Graphics, base: number, trim: number, wounded = false) {
  g.fillStyle(0x050608, 0.25);
  g.fillEllipse(20, 48, 22, 8);
  g.fillStyle(wounded ? 0x7a3737 : 0x262931, 1);
  g.fillRoundedRect(14, 32, 5, 14, 2);
  g.fillRoundedRect(21, 32, 5, 14, 2);
  g.fillStyle(base, 1);
  g.fillRoundedRect(10, 18, 20, 22, 4);
  g.fillStyle(trim, 1);
  g.fillRect(10, 26, 20, 4);
  g.fillStyle(0xf0caa6, 1);
  g.fillCircle(20, 12, 8);
  g.fillStyle(wounded ? 0xff8f70 : 0x16202a, 1);
  g.fillCircle(17, 13, 1.5);
  g.fillCircle(23, 13, 1.5);
  g.lineStyle(2, 0x101317, 0.9);
  g.strokeRoundedRect(10, 18, 20, 22, 4);
}

function drawTreant(g: Graphics) {
  g.fillStyle(0x051106, 0.22);
  g.fillEllipse(22, 46, 28, 9);
  g.fillStyle(0x5f3c25, 1);
  g.fillRoundedRect(16, 22, 12, 24, 5);
  g.fillStyle(0x69bf74, 1);
  g.fillCircle(14, 18, 9);
  g.fillCircle(25, 14, 11);
  g.fillCircle(31, 23, 9);
  g.fillStyle(0xd9ffd1, 1);
  g.fillCircle(19, 28, 1.8);
  g.fillCircle(25, 28, 1.8);
  g.lineStyle(2, 0x18351f, 1);
  g.strokeCircle(25, 14, 11);
  g.strokeRoundedRect(16, 22, 12, 24, 5);
}

function drawRabbit(g: Graphics) {
  g.fillStyle(0x050608, 0.22);
  g.fillEllipse(22, 42, 30, 8);
  g.fillStyle(0xd8d1b1, 1);
  g.fillEllipse(22, 31, 24, 16);
  g.fillEllipse(13, 21, 6, 18);
  g.fillEllipse(22, 18, 6, 19);
  g.fillCircle(32, 28, 7);
  g.fillStyle(0x15191f, 1);
  g.fillCircle(34, 26, 1.6);
  g.lineStyle(2, 0x574f42, 0.85);
  g.strokeEllipse(22, 31, 24, 16);
}

function drawSlime(g: Graphics) {
  g.fillStyle(0x080405, 0.25);
  g.fillEllipse(22, 44, 31, 8);
  g.fillStyle(0xb95a68, 1);
  g.fillEllipse(22, 31, 31, 25);
  g.fillStyle(0xe88993, 0.75);
  g.fillEllipse(16, 25, 9, 6);
  g.fillStyle(0x281116, 1);
  g.fillCircle(17, 31, 2);
  g.fillCircle(27, 31, 2);
  g.lineStyle(2, 0x501e28, 1);
  g.strokeEllipse(22, 31, 31, 25);
}

function drawWolf(g: Graphics) {
  g.fillStyle(0x050608, 0.28);
  g.fillEllipse(24, 44, 34, 8);
  g.fillStyle(0x8b58ba, 1);
  g.fillEllipse(22, 31, 27, 15);
  g.fillTriangle(32, 22, 39, 16, 37, 28);
  g.fillTriangle(14, 25, 9, 17, 18, 22);
  g.fillStyle(0x2b1538, 1);
  g.fillRect(14, 36, 5, 9);
  g.fillRect(27, 36, 5, 9);
  g.fillStyle(0xf4e6ff, 1);
  g.fillCircle(34, 24, 2);
  g.lineStyle(2, 0x281133, 1);
  g.strokeEllipse(22, 31, 27, 15);
}

function drawSkeleton(g: Graphics) {
  g.fillStyle(0x050608, 0.24);
  g.fillEllipse(21, 47, 24, 7);
  g.fillStyle(0xd7d0be, 1);
  g.fillCircle(21, 13, 8);
  g.fillRoundedRect(17, 22, 8, 18, 2);
  g.lineStyle(3, 0xd7d0be, 1);
  g.lineBetween(13, 24, 7, 35);
  g.lineBetween(29, 24, 35, 35);
  g.lineBetween(18, 39, 13, 48);
  g.lineBetween(24, 39, 29, 48);
  g.fillStyle(0x1c1a16, 1);
  g.fillCircle(18, 13, 2);
  g.fillCircle(24, 13, 2);
}

function drawWisp(g: Graphics) {
  g.fillStyle(0x183a3c, 0.28);
  g.fillEllipse(22, 46, 24, 7);
  g.fillStyle(0x6ee0d2, 0.92);
  g.fillEllipse(22, 29, 23, 31);
  g.fillStyle(0xc8fff6, 0.85);
  g.fillTriangle(22, 9, 13, 32, 31, 32);
  g.fillStyle(0x16343a, 1);
  g.fillCircle(18, 29, 2);
  g.fillCircle(26, 29, 2);
}

function drawGargoyle(g: Graphics) {
  g.fillStyle(0x050608, 0.3);
  g.fillEllipse(22, 47, 34, 7);
  g.fillStyle(0x8f8a9a, 1);
  g.fillTriangle(8, 22, 21, 31, 7, 40);
  g.fillTriangle(36, 22, 23, 31, 37, 40);
  g.fillRoundedRect(14, 18, 16, 25, 4);
  g.fillStyle(0xd0ceda, 1);
  g.fillCircle(18, 23, 2);
  g.fillCircle(26, 23, 2);
  g.lineStyle(2, 0x36333f, 1);
  g.strokeRoundedRect(14, 18, 16, 25, 4);
}

function drawDemonKnight(g: Graphics) {
  g.fillStyle(0x050608, 0.3);
  g.fillEllipse(22, 47, 28, 8);
  g.fillStyle(0x4c2028, 1);
  g.fillRoundedRect(13, 19, 18, 25, 4);
  g.fillStyle(0xeb5f73, 1);
  g.fillRoundedRect(15, 10, 14, 13, 3);
  g.fillTriangle(15, 11, 9, 4, 17, 8);
  g.fillTriangle(29, 11, 35, 4, 27, 8);
  g.fillStyle(0xffd0d6, 1);
  g.fillRect(17, 16, 10, 2);
  g.lineStyle(2, 0x1c0d12, 1);
  g.strokeRoundedRect(13, 19, 18, 25, 4);
}

function drawPet(g: Graphics, kind: 'default' | 'wolf' | 'treant' | 'injured') {
  if (kind === 'treant') {
    drawTreant(g);
    return;
  }
  if (kind === 'wolf') {
    g.fillStyle(0x050608, 0.25);
    g.fillEllipse(22, 43, 30, 7);
    g.fillStyle(0xc8b49b, 1);
    g.fillEllipse(21, 31, 24, 14);
    g.fillTriangle(31, 24, 37, 18, 36, 29);
    g.fillStyle(0x4a3828, 1);
    g.fillCircle(32, 26, 1.6);
    return;
  }
  g.fillStyle(0x050608, 0.22);
  g.fillEllipse(22, 43, 28, 7);
  g.fillStyle(kind === 'injured' ? 0x6a6262 : 0xf0d789, 1);
  g.fillEllipse(22, 31, 23, 16);
  g.fillCircle(32, 27, 7);
  g.fillStyle(0x34291c, 1);
  g.fillCircle(34, 25, 1.6);
}

function drawObjectTexture(g: Graphics, kind: string) {
  g.fillStyle(0x050608, 0.18);
  g.fillEllipse(32, 57, 50, 10);
  if (kind === 'tree') {
    g.fillStyle(0x5c3a22, 1);
    g.fillRoundedRect(27, 31, 10, 23, 4);
    g.fillStyle(0x2d6f3d, 1);
    g.fillCircle(19, 26, 15);
    g.fillCircle(34, 19, 18);
    g.fillCircle(45, 31, 14);
    g.fillStyle(0x4d9a55, 0.9);
    g.fillCircle(27, 14, 10);
    g.lineStyle(2, 0x153b22, 0.85);
    g.strokeCircle(34, 19, 18);
    g.strokeRoundedRect(27, 31, 10, 23, 4);
    return;
  }
  if (kind === 'bush') {
    g.fillStyle(0x2f8b4a, 1);
    g.fillCircle(20, 38, 11);
    g.fillCircle(32, 31, 14);
    g.fillCircle(44, 39, 11);
    g.fillStyle(0x66c66e, 0.8);
    g.fillCircle(29, 27, 6);
    g.lineStyle(2, 0x18542a, 0.8);
    g.strokeCircle(32, 31, 14);
    return;
  }
  if (kind === 'leafPile') {
    g.fillStyle(0x8c6a2f, 1);
    g.fillEllipse(32, 41, 37, 15);
    g.fillStyle(0xd7a14a, 0.9);
    g.fillTriangle(18, 39, 30, 28, 33, 43);
    g.fillStyle(0xa94f38, 0.9);
    g.fillTriangle(34, 44, 45, 30, 49, 46);
    g.fillStyle(0xe0b85d, 0.75);
    g.fillEllipse(30, 38, 18, 8);
    return;
  }
  if (kind === 'windFlag') {
    g.fillStyle(0x5b3c22, 1);
    g.fillRect(29, 14, 5, 40);
    g.fillStyle(0x8d77a6, 1);
    g.fillTriangle(34, 16, 58, 23, 34, 31);
    g.fillStyle(0xf3c45b, 1);
    g.fillCircle(31, 13, 4);
    g.lineStyle(2, 0x2b1a10, 1);
    g.lineBetween(31, 14, 31, 54);
    return;
  }
  if (kind === 'roadSign') {
    g.fillStyle(0x5b3c22, 1);
    g.fillRect(30, 20, 5, 32);
    g.fillStyle(0xb89055, 1);
    g.fillRoundedRect(15, 13, 34, 17, 3);
    g.lineStyle(2, 0x2b1a10, 1);
    g.strokeRoundedRect(15, 13, 34, 17, 3);
    g.fillTriangle(45, 16, 55, 21, 45, 26);
    return;
  }
  if (kind === 'forge') {
    g.fillStyle(0x41434a, 1);
    g.fillRoundedRect(14, 30, 36, 18, 4);
    g.fillStyle(0xff8a4c, 1);
    g.fillCircle(32, 25, 9);
    g.fillStyle(0x2f3034, 1);
    g.fillRect(19, 47, 26, 7);
    return;
  }
  if (kind === 'shrine') {
    g.fillStyle(0xdce2ea, 1);
    g.fillRoundedRect(24, 18, 16, 29, 4);
    g.fillStyle(0x9aa6b4, 1);
    g.fillRect(18, 43, 28, 8);
    g.fillStyle(0x9ed6ff, 1);
    g.fillCircle(32, 27, 4);
    return;
  }
  if (kind === 'magic') {
    g.fillStyle(0x24384e, 1);
    g.fillRoundedRect(11, 23, 42, 26, 3);
    g.fillStyle(0x5f83b7, 1);
    g.fillTriangle(8, 24, 32, 8, 56, 24);
    g.fillStyle(0xd9d4ff, 1);
    g.fillCircle(32, 34, 6);
    return;
  }
  if (kind === 'guild') {
    g.fillStyle(0x59406d, 1);
    g.fillRoundedRect(8, 24, 48, 25, 3);
    g.fillStyle(0x8d77a6, 1);
    g.fillTriangle(5, 25, 32, 7, 59, 25);
    g.fillStyle(0xf3c45b, 1);
    g.fillRect(29, 31, 6, 18);
    g.fillTriangle(35, 18, 52, 22, 35, 26);
    return;
  }
  if (kind === 'shop') {
    g.fillStyle(0x5f7080, 1);
    g.fillRoundedRect(10, 24, 44, 25, 3);
    g.fillStyle(0xaebbd0, 1);
    g.fillTriangle(7, 25, 32, 8, 57, 25);
    g.fillStyle(0xf3c45b, 1);
    g.fillCircle(23, 35, 5);
    g.fillCircle(41, 35, 5);
    return;
  }
  if (kind === 'ruinsGate' || kind === 'demonGate' || kind === 'dungeon') {
    const base = kind === 'demonGate' ? 0x5b2d43 : 0x4b4a59;
    g.fillStyle(base, 1);
    g.fillRoundedRect(13, 14, 38, 38, 5);
    g.fillStyle(0x101317, 1);
    g.fillRoundedRect(23, 28, 18, 24, 8);
    g.fillStyle(kind === 'demonGate' ? 0xeb5f73 : 0x9aa0ad, 1);
    g.fillCircle(32, 23, 5);
    return;
  }
  g.fillStyle(0x8b6a4c, 1);
  g.fillRoundedRect(10, 24, 44, 25, 3);
  g.fillStyle(0xb28d65, 1);
  g.fillTriangle(7, 25, 32, 8, 57, 25);
  g.fillStyle(0x3a2518, 1);
  g.fillRect(28, 35, 9, 14);
}

export function drawTileCell(g: Graphics, type: string, x: number, y: number, size: number, color: string) {
  const c = hexToInt(color);
  g.fillStyle(c, 1);
  g.fillRect(x, y, size, size);
  if (type === 'grass' || type === 'paleGrove') {
    g.lineStyle(1, 0x8ac978, 0.55);
    g.lineBetween(x + 7, y + 25, x + 10, y + 16);
    g.lineBetween(x + 21, y + 27, x + 24, y + 18);
  } else if (type === 'forest' || type === 'silverleaf') {
    g.fillStyle(type === 'silverleaf' ? 0xb9d9a2 : 0x3f7a4a, 0.82);
    g.fillCircle(x + 10, y + 10, 8);
    g.fillCircle(x + 24, y + 16, 9);
    g.fillStyle(0x4b3422, 0.7);
    g.fillRect(x + 16, y + 17, 4, 11);
  } else if (type === 'road' || type === 'elvenRoad') {
    g.lineStyle(2, type === 'elvenRoad' ? 0xd5deb7 : 0xb49a70, 0.45);
    g.lineBetween(x + 3, y + 11, x + 29, y + 8);
    g.lineBetween(x + 4, y + 22, x + 28, y + 25);
  } else if (type === 'water' || type === 'swamp') {
    g.lineStyle(2, type === 'swamp' ? 0x6f9b83 : 0x75b8d8, 0.55);
    g.lineBetween(x + 3, y + 11, x + 13, y + 8);
    g.lineBetween(x + 18, y + 19, x + 30, y + 16);
  } else if (type === 'mountain' || type === 'ore') {
    g.fillStyle(0x8c877d, 0.75);
    g.fillTriangle(x + 4, y + 27, x + 13, y + 8, x + 22, y + 27);
    g.fillTriangle(x + 13, y + 27, x + 23, y + 12, x + 31, y + 27);
  } else if (type === 'wall' || type === 'dungeon' || type === 'ruins' || type === 'castle') {
    g.lineStyle(1, 0x9aa0ad, 0.2);
    g.strokeRect(x + 3, y + 4, 12, 10);
    g.strokeRect(x + 15, y + 14, 14, 11);
    g.strokeRect(x + 3, y + 25, 18, 6);
  } else if (type === 'village') {
    g.fillStyle(0x8a7d5a, 0.65);
    g.fillRect(x + 4, y + 5, 8, 7);
    g.fillRect(x + 18, y + 13, 9, 8);
    g.fillRect(x + 8, y + 24, 10, 5);
  } else if (type === 'ash' || type === 'chasm' || type === 'seal') {
    g.lineStyle(2, 0xb2a6c8, 0.22);
    g.lineBetween(x + 7, y + 25, x + 16, y + 8);
    g.lineBetween(x + 18, y + 8, x + 27, y + 26);
  }
  g.lineStyle(1, 0x000000, 0.1);
  g.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
}

export function ensurePlaceholderArt(scene: Phaser.Scene) {
  for (const monsterForm of [false, true]) {
    for (const dir of actorDirs) {
      for (const pose of playerPoses) {
        makeTexture(scene, playerTextureKey(dir, pose, monsterForm), playerTextureW, playerTextureH, g =>
          drawHumanoid(g, monsterForm ? 0x5d327d : 0x3f78c7, monsterForm ? 0xd986ff : 0xf3c45b, 0x101317, dir, pose, monsterForm)
        );
      }
    }
  }

  [
    ['of:npc:human', 0x407cb5, 0xf3c45b, false],
    ['of:npc:elf', 0x56a66d, 0xcff4b4, false],
    ['of:npc:dwarf', 0xa76b38, 0xe1b178, false],
    ['of:npc:wounded', 0x8f4f45, 0xff8f70, true]
  ].forEach(([key, base, trim, wounded]) => {
    makeTexture(scene, key as string, 40, 54, g => drawNpc(g, base as number, trim as number, wounded as boolean));
  });

  makeTexture(scene, 'of:creature:treant', 44, 52, drawTreant);
  makeTexture(scene, 'of:creature:rabbit', 44, 48, drawRabbit);
  makeTexture(scene, 'of:monster:slime', 44, 50, drawSlime);
  makeTexture(scene, 'of:monster:wolf', 44, 50, drawWolf);
  makeTexture(scene, 'of:monster:skeleton', 44, 52, drawSkeleton);
  makeTexture(scene, 'of:monster:wisp', 44, 52, drawWisp);
  makeTexture(scene, 'of:monster:gargoyle', 44, 52, drawGargoyle);
  makeTexture(scene, 'of:monster:demonKnight', 44, 52, drawDemonKnight);
  makeTexture(scene, 'of:pet:default', 44, 48, g => drawPet(g, 'default'));
  makeTexture(scene, 'of:pet:wolf', 44, 48, g => drawPet(g, 'wolf'));
  makeTexture(scene, 'of:pet:treant', 44, 52, g => drawPet(g, 'treant'));
  makeTexture(scene, 'of:pet:injured', 44, 48, g => drawPet(g, 'injured'));

  ['shop', 'guild', 'forge', 'shrine', 'magic', 'house', 'roadSign', 'ruinsGate', 'demonGate', 'dungeon', 'tree', 'bush', 'leafPile', 'windFlag', 'default']
    .forEach(kind => makeTexture(scene, `of:object:${kind}`, 64, 64, g => drawObjectTexture(g, kind)));
}
