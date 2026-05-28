// Inventory domain — gear bag, materials bag, resources (wood/stone/special),
// pet adoption from material drops. Pure state mutation; emits bus events
// so HUD/panels can refresh without being called directly.

import { state } from '../runtime/state.ts';
import DATA from '../data.ts';
import { rand } from './math.ts';
import {
  currentPlayerId, currentPartyId, ownedByCurrentPlayer
} from './session.ts';
import { refreshCombatStats } from './combat/weapon.ts';
import { bus, Events } from '../runtime/events.ts';
import { autoSave } from '../runtime/autosave.ts';
import { log, toast } from '../runtime/services.ts';
import type { PetState, PickupState } from './types.ts';

const { gearCatalog, materialCatalog, petCatalog, resourceCatalog = {} } = DATA;
const gearNameToId: Record<string, string> = Object.fromEntries(Object.entries(gearCatalog).map(([id, gear]) => [gear.name, id]));

function petsForCurrentPlayer() {
  return state.pets.filter(pet => ownedByCurrentPlayer(pet));
}

function currentPetScene() {
  return state.mode === 'dungeon' ? 'dungeon' : state.scene;
}

export function addMaterial(name: string, amount = 1) {
  state.player.materials[name] = (state.player.materials[name] || 0) + amount;
  bus.emit(Events.INVENTORY_CHANGED, { kind: 'material', name, amount });
}

export function resourceGroup(name: string): string | null {
  return resourceCatalog[name]?.group || null;
}

export function syncResourceTotals() {
  const resources = state.player.resources || {};
  let wood = 0;
  let stone = 0;
  for (const [name, count] of Object.entries(resources)) {
    const amount = Math.max(0, Number(count) || 0);
    if (resourceGroup(name) === "wood") wood += amount;
    if (resourceGroup(name) === "stone") stone += amount;
  }
  state.player.wood = wood;
  state.player.stone = stone;
}

export function addResource(name: string, amount = 1) {
  if (!state.player.resources || typeof state.player.resources !== "object") state.player.resources = {};
  state.player.resources[name] = (state.player.resources[name] || 0) + amount;
  syncResourceTotals();
  bus.emit(Events.INVENTORY_CHANGED, { kind: 'resource', name, amount });
}

export function resourceCount(name: string): number {
  return state.player.resources?.[name] || 0;
}

export function consumeResource(name: string, amount = 1): boolean {
  if (resourceCount(name) < amount) return false;
  state.player.resources[name] -= amount;
  if (state.player.resources[name] <= 0) delete state.player.resources[name];
  syncResourceTotals();
  bus.emit(Events.INVENTORY_CHANGED, { kind: 'resource', name, amount: -amount });
  return true;
}

export function consumeAnyResource(group: string, preferredName?: string | null, amount = 1): boolean {
  if (group === "wood" && (state.player.wood || 0) < amount) return false;
  if (group === "stone" && (state.player.stone || 0) < amount) return false;
  let remaining = amount;
  if (preferredName && resourceGroup(preferredName) === group) {
    const used = Math.min(resourceCount(preferredName), remaining);
    if (used > 0) {
      state.player.resources[preferredName] -= used;
      if (state.player.resources[preferredName] <= 0) delete state.player.resources[preferredName];
      remaining -= used;
    }
  }
  for (const name of Object.keys(state.player.resources || {})) {
    if (remaining <= 0) break;
    if (resourceGroup(name) !== group) continue;
    const used = Math.min(resourceCount(name), remaining);
    state.player.resources[name] -= used;
    if (state.player.resources[name] <= 0) delete state.player.resources[name];
    remaining -= used;
  }
  syncResourceTotals();
  return remaining <= 0;
}

export function materialCount() {
  return Object.values(state.player.materials).reduce((sum, count) => sum + count, 0);
}

export function sellableMaterialCount() {
  return Object.entries(state.player.materials)
    .filter(([name]) => !materialCatalog[name]?.unsellable && materialCatalog[name]?.sell != null)
    .reduce((sum, [, count]) => sum + count, 0);
}

export function materialSummary(limit = 3) {
  const entries = Object.entries(state.player.materials).filter(([, count]) => count > 0);
  if (!entries.length) return "无";
  return entries.slice(0, limit).map(([name, count]) => `${name}${count}`).join(" ");
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

export function addGearToBag(gearId: string): boolean {
  const gear = gearCatalog[gearId];
  if (!gear) return false;
  if (!state.player.gearBag.includes(gearId)) state.player.gearBag.push(gearId);
  bus.emit(Events.INVENTORY_CHANGED, { kind: 'gear', gearId });
  log(`获得装备：${gear.name}。已放入装备栏，点击装备栏里的“装备”来更换。`);
  autoSave();
  return true;
}

export function gearIdForPickup(p: PickupState): string | null {
  if (p.kind === "conceptSword") return "conceptSword";
  return gearNameToId[p.name] || null;
}

export function equipGear(gearId: string) {
  const gear = gearCatalog[gearId];
  if (!gear || !state.player.gearBag.includes(gearId)) return;
  if (state.player.monsterForm) {
    toast("魔物化状态下无法整理装备。");
    return;
  }
  state.player.gear[gear.slot] = gearId;
  refreshCombatStats();
  bus.emit(Events.GEAR_EQUIPPED, { slot: gear.slot, gearId });
  log(`装备了${gear.name}。`);
}
