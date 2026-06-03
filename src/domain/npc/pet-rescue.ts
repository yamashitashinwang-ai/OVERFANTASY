import { state } from '../../runtime/state.ts';
import { log, toast } from '../../runtime/services.ts';
import { ownedByCurrentPlayer } from '../session.ts';
import { dist, rand } from '../math.ts';
import { currentPetScene } from '../world.ts';
import type { PetRemainState } from '../types.ts';
import { isNearAction } from './spatial.ts';
import { publishPlayerInteraction } from './interaction-events.ts';

export function handlePetRescue() {
  const carried = state.pets.find(pet => ownedByCurrentPlayer(pet) && pet.injured && pet.carried && !pet.lost);
  if (carried) {
    if (isNearAction("cleanse", 2.5)) return false;
    toast(`你正抱着${carried.name}。带它去白石祠、树根祠或残破圣像。`);
    return true;
  }
  const sceneKey = currentPetScene();
  const pet = state.pets.find(candidate => ownedByCurrentPlayer(candidate) && candidate.injured && !candidate.carried && !candidate.lost && candidate.scene === sceneKey && dist(candidate, state.player) < 1.5);
  if (!pet) return false;
  publishPlayerInteraction();
  pet.carried = true;
  pet.x = state.player.x;
  pet.y = state.player.y;
  log(`你抱起了重伤的${pet.name}。剩余${Math.ceil(pet.rescueTimer / 60)}分钟。`);
  return true;
}

export function restoreInjuredPets() {
  const sceneKey = currentPetScene();
  const targets = state.pets.filter(pet => ownedByCurrentPlayer(pet) && pet.injured && !pet.lost && (pet.carried || (pet.scene === sceneKey && dist(pet, state.player) < 2.0)));
  if (!targets.length) return false;
  for (const pet of targets) {
    pet.injured = false;
    pet.carried = false;
    pet.alive = true;
    pet.hp = pet.maxHp;
    pet.rescueTimer = 0;
    pet.scene = sceneKey;
    pet.x = state.player.x + rand(-1.0, 1.0);
    pet.y = state.player.y + rand(-1.0, 1.0);
    pet.cooldownTimer = 0.5;
  }
  log(`神龛恢复了${targets.map(pet => pet.name).join("、")}。`);
  return true;
}

function nearestPetRemain(kind: string, range = 1.45): PetRemainState | null {
  const sceneKey = currentPetScene();
  let best: PetRemainState | null = null, bestD = Infinity;
  for (const remain of state.petRemains) {
    if (!ownedByCurrentPlayer(remain)) continue;
    if (remain.kind !== kind || remain.scene !== sceneKey) continue;
    const d = dist(remain, state.player);
    if (d < range && d < bestD) { best = remain; bestD = d; }
  }
  return best;
}

export function handlePetMemorial() {
  const corpse = nearestPetRemain('corpse');
  if (!corpse) return false;
  corpse.kind = 'grave';
  corpse.age = 0;
  corpse.decay = 0;
  corpse.decayClock = 0;
  log('"YOU ARE THE BEST...MY DEAR DEAR FRIEND..."');
  log(`原地留下了${corpse.petName}的坟墓。`);
  return true;
}
