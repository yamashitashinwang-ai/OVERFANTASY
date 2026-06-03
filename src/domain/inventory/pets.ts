import { state } from '../../runtime/state.ts';
import DATA from '../../data.ts';
import { rand } from '../math.ts';
import { currentPlayerId, currentPartyId, ownedByCurrentPlayer } from '../session.ts';
import { log, toast } from '../../runtime/services.ts';
import type { PetState } from '../types.ts';

const { materialCatalog, petCatalog } = DATA;

function petsForCurrentPlayer() {
  return state.pets.filter(pet => ownedByCurrentPlayer(pet));
}

function currentPetScene() {
  return state.mode === 'dungeon' ? 'dungeon' : state.scene;
}

export function makePet(petId: string, x = state.player.x, y = state.player.y): PetState | null {
  const template = petCatalog[petId];
  if (!template) return null;
  return {
    ...template,
    id: `${petId}-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
    ownerId: currentPlayerId(),
    partyId: currentPartyId(),
    petId,
    x: x + rand(-0.8, 0.8),
    y: y + rand(-0.8, 0.8),
    hp: template.maxHp,
    injured: false,
    carried: false,
    lost: false,
    rescueTimer: 0,
    scene: currentPetScene(),
    cooldownTimer: rand(0, 0.7),
    wanderTimer: 0,
    wanderX: rand(-1, 1),
    wanderY: rand(-1, 1),
    alive: true
  };
}

export function adoptPetFromMaterial(name: string) {
  const material = materialCatalog[name];
  if (!material?.pet || (state.player.materials[name] || 0) <= 0) return;
  if (petsForCurrentPlayer().filter(p => !p.lost).length >= 3) {
    toast("当前最多同时带三只宠物。");
    return;
  }
  const pet = makePet(material.pet);
  if (!pet) return;
  state.player.materials[name] -= 1;
  if (state.player.materials[name] <= 0) delete state.player.materials[name];
  state.pets.push(pet);
  log(`${pet.name}成为了你的宠物。它会在你身边游荡，只在你已引发战斗时护主。`);
}

export function recallPets() {
  for (const pet of state.pets) {
    if (!ownedByCurrentPlayer(pet)) continue;
    if (pet.injured || pet.lost) continue;
    pet.x = state.player.x + rand(-1.2, 1.2);
    pet.y = state.player.y + rand(-1.2, 1.2);
    pet.scene = currentPetScene();
    pet.alive = true;
    pet.hp = Math.max(1, pet.hp || pet.maxHp);
    pet.cooldownTimer = 0.4;
  }
}
