import { state } from '../../../runtime/state.ts';
import { log } from '../../../runtime/services.ts';
import { currentPartyId, currentPlayerId } from '../../session.ts';
import { currentPetScene } from '../../world.ts';
import { refreshCombatStats } from '../weapon.ts';
import type { ActorState, PetState } from '../../types.ts';

export function damagePet(pet: PetState | null | undefined, amount: number, source?: ActorState | null) {
  if (!pet || !pet.alive) return;
  pet.hp -= Math.max(1, Math.ceil(amount));
  if (source) {
    if (!source.petAggro) source.petAggro = {};
    source.petAggro[pet.id] = (source.petAggro[pet.id] || 0) + amount;
  }
  if (pet.hp <= 0) {
    pet.alive = false;
    pet.injured = true;
    pet.carried = false;
    pet.rescueTimer = 900;
    pet.scene = currentPetScene();
    pet.hp = 0;
    log(`${pet.name}重伤倒下了。悲怆涌上来：移速和防御提升，攻击几乎消失。15分钟内靠近按E抱起，并带到白石祠恢复。`);
  }
}

export function petDiesIrreversibly(pet: PetState | null | undefined) {
  if (!pet || pet.dead) return;
  pet.dead = true;
  pet.lost = true;
  pet.injured = false;
  pet.carried = false;
  pet.alive = false;
  pet.rescueTimer = 0;
  state.petRemains.push({
    id: `remain-${pet.id}`,
    ownerId: pet.ownerId || currentPlayerId(),
    partyId: pet.partyId || currentPartyId(),
    kind: 'corpse',
    petName: pet.name,
    x: pet.x,
    y: pet.y,
    scene: pet.scene || currentPetScene(),
    color: pet.color,
    age: 0,
    decay: 0,
    decayClock: 0
  });
  refreshCombatStats();
  log(`${pet.name}没能及时送回神龛，已经不可复活地死亡。`);
  log('"AM I A GOOD BOY?"');
}

export function petById(id: string): PetState | null {
  return state.pets.find(pet => pet.id === id && pet.alive && !pet.injured && !pet.lost) || null;
}
