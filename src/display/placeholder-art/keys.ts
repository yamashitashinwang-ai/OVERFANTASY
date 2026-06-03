import type { ActorState, PetState, WorldObjectState } from '../../domain/types.ts';
import type {
  FacingDir,
  PlayerPose,
  PlayerRigTexturePart,
  ReservedPlayerAttackAnimationName
} from './types.ts';

export const actorDirs: FacingDir[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
export const playerPoses: PlayerPose[] = ['idle', 'walk0', 'walk1', 'run0', 'run1', 'interact', 'hurt', 'attack'];
export const playerRigTextureParts: PlayerRigTexturePart[] = ['head', 'torso', 'upperArm', 'forearm', 'thigh', 'shin', 'hand', 'foot'];
export const reservedPlayerAttackAnimationNames: ReservedPlayerAttackAnimationName[] = [
  'attack_sword',
  'attack_dagger',
  'attack_spear',
  'attack_hammer',
  'attack_bow',
  'cast_magic'
];

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

export function playerRigTextureKey(part: PlayerRigTexturePart, monsterForm = false) {
  return `of:playerRig:${monsterForm ? 'monster' : 'human'}:${part}`;
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
