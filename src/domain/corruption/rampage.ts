import DATA from '../../data.ts';
import { state } from '../../runtime/state.ts';
import { log } from '../../runtime/services.ts';
import { moveActor } from '../../runtime/actor-movement.ts';
import { clamp, dist, rand } from '../math.ts';
import { currentPetScene, regionAt } from '../world.ts';
import { currentPartyId, currentPlayerId } from '../session.ts';
import type { ActorState, PetState } from '../types.ts';

const { regions } = DATA;

export function hasCorruptionControlLock(): boolean {
  const p = state.player;
  return !!p.corruptionChoicePending || (p.corruptionRampageWarningTimer || 0) > 0 || (p.corruptionRampageTimer || 0) > 0;
}

export function isCorruptionRampaging(): boolean {
  return (state.player.corruptionRampageTimer || 0) > 0;
}

function woundPetDuringRampage(pet: PetState, amount: number) {
  if (!pet.alive || pet.injured || pet.lost) return;
  pet.hp -= Math.max(1, Math.ceil(amount));
  if (pet.hp > 0) return;
  pet.alive = false;
  pet.injured = true;
  pet.carried = false;
  pet.scene = currentPetScene();
  pet.rescueTimer = 900;
  pet.hp = 0;
  log(`${pet.name}被失控的你重伤倒下。`);
}

function defeatFriendlyDuringRampage(target: ActorState) {
  target.alive = false;
  const region = regions[target.region] || regionAt(target.x || state.player.x, target.y || state.player.y);
  region.trust = clamp(region.trust - 22, 0, 100);
  region.hate = clamp(region.hate + 26, 0, 100);
  log(`${target.name || '友方'}在你的暴走中倒下了。${region.name}信任下降，仇恨上升。`);
}

function nearestRampageTarget(): ActorState | PetState | null {
  const candidates: Array<ActorState | PetState> = [];
  for (const e of state.entities) {
    if (!e.alive) continue;
    if (e.kind === 'npc' || e.kind === 'friendly' || e.kind === 'animal') candidates.push(e);
  }
  for (const pet of state.pets) {
    if (pet.lost || pet.injured || !pet.alive) continue;
    if (pet.ownerId === currentPlayerId() || pet.partyId === currentPartyId()) candidates.push(pet);
  }
  return candidates
    .filter(candidate => dist(candidate, state.player) < 10)
    .sort((a, b) => dist(a, state.player) - dist(b, state.player))[0] || null;
}

function fleeRampagingPlayer(dt: number) {
  for (const pet of state.pets) {
    if (pet.lost || pet.injured || !pet.alive) continue;
    const d = dist(pet, state.player);
    if (d <= 0 || d > 4.2) continue;
    moveActor(pet, (pet.x - state.player.x) / d, (pet.y - state.player.y) / d, (pet.speed || 2.2) * 1.35, dt);
  }
}

export function updateRampage(dt: number) {
  const p = state.player;
  const target = nearestRampageTarget();
  if (target) {
    const d = Math.max(0.001, dist(target, p));
    if (d > 0.8) moveActor(p, (target.x - p.x) / d, (target.y - p.y) / d, 4.25, dt);
    p.corruptionRampageAttackCooldown = Math.max(0, (p.corruptionRampageAttackCooldown || 0) - dt);
    if (d <= 1.0 && p.corruptionRampageAttackCooldown <= 0) {
      const amount = Math.max(4, Math.ceil(p.atk * 0.85));
      if ('petId' in target || ('roamRadius' in target && 'guardRange' in target)) {
        woundPetDuringRampage(target as PetState, amount);
      } else {
        const actor = target as ActorState;
        actor.hp = (actor.hp || 1) - amount;
        log(`失控的你攻击${actor.name || '友方'}，造成${amount}点伤害。`);
        if ((actor.hp || 0) <= 0) defeatFriendlyDuringRampage(actor);
      }
      p.corruptionRampageAttackCooldown = 0.72;
    }
  } else {
    moveActor(p, rand(-1, 1), rand(-1, 1), 2.8, dt);
  }
  fleeRampagingPlayer(dt);
}
