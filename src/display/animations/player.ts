import { bus, Events } from '../../runtime/events.ts';
import { display as D } from '../runtime.ts';
import type { FacingDir, PlayerPose, ReservedPlayerAttackAnimationName } from '../placeholder-art.ts';
import { dirVector, playerTextureKey, reservedPlayerAttackAnimationNames } from '../placeholder-art.ts';
import type { VisualAdjust } from './types.ts';
import { activePlayerAction, setPlayerAction } from './action-state.ts';

export const playerAttackAnimationNames = reservedPlayerAttackAnimationNames;

function playerFacingFromTexture(): FacingDir {
  const key = D.playerSprite?.texture?.key || '';
  const dir = key.split(':')[3];
  return (['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'].includes(dir) ? dir : 's') as FacingDir;
}

function playerMonsterFormFromTexture() {
  return (D.playerSprite?.texture?.key || '').includes(':monster:');
}

function applyImmediatePlayerPose(pose: PlayerPose, tint: number, scale = 1.04) {
  if (!D.playerSprite) return;
  D.playerSprite.setTexture(playerTextureKey(playerFacingFromTexture(), pose, playerMonsterFormFromTexture()));
  D.playerSprite.setTint(tint);
  D.playerSprite.setScale(scale);
}

type PlayerAttackStartedPayload = {
  attackName?: unknown;
};

function playerAttackStartedPayload(payload: unknown): PlayerAttackStartedPayload | null {
  if (!payload || typeof payload !== 'object') return null;
  return payload as PlayerAttackStartedPayload;
}

function playerAttackName(payload: unknown): ReservedPlayerAttackAnimationName | 'attack' {
  const event = playerAttackStartedPayload(payload);
  const attackName = event?.attackName;
  if (attackName === 'attack') return 'attack';
  if (typeof attackName === 'string' && reservedPlayerAttackAnimationNames.includes(attackName as ReservedPlayerAttackAnimationName)) {
    return attackName as ReservedPlayerAttackAnimationName;
  }
  return 'attack';
}

function onPlayerAttackStarted(payload: unknown) {
  triggerPlayerAttackPlaceholder(playerAttackName(payload));
}

export function triggerPlayerInteract() {
  setPlayerAction('interact', 260);
  applyImmediatePlayerPose('interact', 0xf3d778, 1.035);
}

export function triggerPlayerHurt() {
  setPlayerAction('hurt', 330);
  applyImmediatePlayerPose('hurt', 0xff8372, 1.05);
}

export function triggerPlayerAttackPlaceholder(attackName: ReservedPlayerAttackAnimationName | 'attack' = 'attack') {
  setPlayerAction('attack', attackName === 'attack_bow' ? 300 : 230, attackName);
  applyImmediatePlayerPose('attack', attackName === 'attack_bow' ? 0xcfe7ff : 0xfff4b0, 1.025);
}

export function currentPlayerPoseOverride(): PlayerPose | null {
  const action = activePlayerAction();
  if (!action) return null;
  if (action.kind === 'interact') return 'interact';
  if (action.kind === 'hurt') return 'hurt';
  return 'attack';
}

export function playerVisualAdjust(facing: FacingDir): VisualAdjust {
  const action = activePlayerAction();
  if (!action) return { offsetX: 0, offsetY: 0, scale: 1, tint: null };
  const pulse = Math.sin(action.progress * Math.PI);
  if (action.kind === 'interact') {
    return { offsetX: 0, offsetY: -3 * pulse, scale: 1 + 0.035 * pulse, tint: 0xf3d778 };
  }
  if (action.kind === 'hurt') {
    const shake = Math.sin(action.progress * Math.PI * 4);
    return { offsetX: shake * 4, offsetY: -1 * pulse, scale: 1 + 0.05 * pulse, tint: 0xff8372 };
  }
  const v = dirVector(facing);
  return {
    offsetX: v.x * 4 * pulse,
    offsetY: v.y * 4 * pulse - 1.5 * pulse,
    scale: 1 + 0.025 * pulse,
    tint: action.attackName === 'attack_bow' ? 0xcfe7ff : 0xfff4b0
  };
}

bus.on(Events.PLAYER_INTERACTED, () => { triggerPlayerInteract(); });
bus.on(Events.PLAYER_ATTACK_STARTED, onPlayerAttackStarted);
