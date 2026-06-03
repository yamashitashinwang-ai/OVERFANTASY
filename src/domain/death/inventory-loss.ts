import { state } from '../../runtime/state.ts';
import { clonePlain } from '../math.ts';
import { syncResourceTotals } from '../inventory.ts';
import type { DeathInventorySnapshot, LostPackageContents, ResourceBag } from '../types.ts';

const UNIQUE_GEAR_IDS = new Set(['conceptSword']);

function bagAdd(bag: ResourceBag, name: string, amount: number) {
  if (amount <= 0) return;
  bag[name] = (bag[name] || 0) + amount;
}

function contentAdd(contents: LostPackageContents, key: 'gold' | 'herbs' | 'potions' | 'arrows', amount: number) {
  if (amount <= 0) return;
  contents[key] = (contents[key] || 0) + amount;
}

function splitCount(amount: number, allowPermanentLoss: boolean): { keep: number; packageAmount: number; lost: number } {
  let keep = 0;
  let packageAmount = 0;
  let lost = 0;
  for (let i = 0; i < Math.max(0, Math.floor(amount)); i += 1) {
    const roll = Math.random();
    if (roll < 0.67) keep += 1;
    else if (roll < 0.97 || !allowPermanentLoss) packageAmount += 1;
    else lost += 1;
  }
  return { keep, packageAmount, lost };
}

export function inventorySnapshot(): DeathInventorySnapshot {
  return {
    gold: state.player.gold || 0,
    herbs: state.player.herbs || 0,
    potions: state.player.potions || 0,
    arrows: state.player.arrows || 0,
    rings: state.player.rings || 0,
    reversePotions: state.player.reversePotions || 0,
    resources: clonePlain(state.player.resources || {}),
    materials: clonePlain(state.player.materials || {}),
    gearBag: [...(state.player.gearBag || [])]
  };
}

function rollCountField(key: 'gold' | 'herbs' | 'potions' | 'arrows', contents: LostPackageContents, permanentLosses: LostPackageContents) {
  const current = Math.max(0, Math.floor(Number(state.player[key] || 0)));
  const split = splitCount(current, true);
  state.player[key] = split.keep;
  contentAdd(contents, key, split.packageAmount);
  contentAdd(permanentLosses, key, split.lost);
}

function rollBag(source: ResourceBag, contentsBag: ResourceBag, lostBag: ResourceBag) {
  for (const [name, amount] of Object.entries({ ...source })) {
    const split = splitCount(amount, true);
    if (split.keep > 0) source[name] = split.keep;
    else delete source[name];
    bagAdd(contentsBag, name, split.packageAmount);
    bagAdd(lostBag, name, split.lost);
  }
}

function rollUnequippedGear(contents: LostPackageContents) {
  const equipped = new Set(Object.values(state.player.gear || {}).filter(Boolean));
  const nextGearBag: string[] = [];
  for (const gearId of state.player.gearBag || []) {
    if (equipped.has(gearId) || UNIQUE_GEAR_IDS.has(gearId)) {
      nextGearBag.push(gearId);
      continue;
    }
    if (Math.random() < 0.1) {
      if (!contents.gearBag) contents.gearBag = [];
      contents.gearBag.push(gearId);
    } else {
      nextGearBag.push(gearId);
    }
  }
  state.player.gearBag = nextGearBag;
}

export function rollDeathInventoryLoss(): { packageContents: LostPackageContents; permanentLosses: LostPackageContents } {
  const packageContents: LostPackageContents = { materials: {}, resources: {}, gearBag: [] };
  const permanentLosses: LostPackageContents = { materials: {}, resources: {} };
  rollCountField('gold', packageContents, permanentLosses);
  rollCountField('herbs', packageContents, permanentLosses);
  rollCountField('potions', packageContents, permanentLosses);
  rollCountField('arrows', packageContents, permanentLosses);
  rollBag(state.player.materials || {}, packageContents.materials, permanentLosses.materials);
  rollBag(state.player.resources || {}, packageContents.resources, permanentLosses.resources);
  syncResourceTotals();
  rollUnequippedGear(packageContents);
  if (!Object.keys(packageContents.materials).length) delete packageContents.materials;
  if (!Object.keys(packageContents.resources).length) delete packageContents.resources;
  if (!packageContents.gearBag?.length) delete packageContents.gearBag;
  if (!Object.keys(permanentLosses.materials).length) delete permanentLosses.materials;
  if (!Object.keys(permanentLosses.resources).length) delete permanentLosses.resources;
  return { packageContents, permanentLosses };
}
