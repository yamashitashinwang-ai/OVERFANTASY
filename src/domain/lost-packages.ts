// Lost death packages live outside the current scene pickup list so they can
// survive scene reloads and be restored from saves without re-rolling losses.

import { state } from '../runtime/state.ts';
import { bus, Events } from '../runtime/events.ts';
import { log, toast } from '../runtime/services.ts';
import { addPickup } from './world.ts';
import { addMaterial, addResource, syncResourceTotals } from './inventory.ts';
import { currentPlayerId, currentPartyId, worldOwnerId } from './session.ts';
import type { LostPackageContents, LostPackageState, PickupState, SceneKey } from './types.ts';

export function hasLostPackageContents(contents: LostPackageContents | null | undefined): boolean {
  if (!contents) return false;
  if ((contents.gold || 0) > 0) return true;
  if ((contents.herbs || 0) > 0) return true;
  if ((contents.potions || 0) > 0) return true;
  if ((contents.arrows || 0) > 0) return true;
  if ((contents.gearBag || []).length > 0) return true;
  if (Object.values(contents.materials || {}).some(count => count > 0)) return true;
  if (Object.values(contents.resources || {}).some(count => count > 0)) return true;
  return false;
}

export function normalizeLostPackages() {
  if (!Array.isArray(state.lostPackages)) state.lostPackages = [];
  state.lostPackages = state.lostPackages.filter(pkg => pkg && !pkg.taken && hasLostPackageContents(pkg.contents));
  for (const pkg of state.lostPackages) {
    if (!pkg.ownerId) pkg.ownerId = currentPlayerId();
    if (!pkg.partyId) pkg.partyId = currentPartyId();
    if (!pkg.name) pkg.name = '遗失的包裹';
    if (!pkg.color) pkg.color = '#f3c45b';
    if (!pkg.scene) pkg.scene = state.scene;
    if (typeof pkg.createdAt !== 'number') pkg.createdAt = state.time || 0;
  }
}

export function syncLostPackagePickupsForScene(scene: SceneKey = state.scene) {
  normalizeLostPackages();
  state.pickups = state.pickups.filter(pickup => pickup.kind !== 'lostPackage');
  for (const pkg of state.lostPackages) {
    if (pkg.taken || pkg.scene !== scene) continue;
    const pickup = addPickup('lostPackage', pkg.name || '遗失的包裹', pkg.x, pkg.y, pkg.color || '#f3c45b', 1, {
      id: `pickup-${pkg.id}`,
      ownerId: worldOwnerId,
      reservedFor: pkg.ownerId || currentPlayerId(),
      sourceId: pkg.id
    });
    pickup.scene = pkg.scene;
    pickup.contents = pkg.contents;
  }
}

export function createLostPackage(scene: SceneKey, x: number, y: number, contents: LostPackageContents, deathScene = scene, deathX = x, deathY = y): LostPackageState | null {
  if (!hasLostPackageContents(contents)) return null;
  const pkg: LostPackageState = {
    id: `lost-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    ownerId: currentPlayerId(),
    partyId: currentPartyId(),
    scene,
    name: '遗失的包裹',
    color: '#f3c45b',
    x,
    y,
    contents,
    taken: false,
    createdAt: state.time || 0,
    deathScene,
    deathX,
    deathY
  };
  state.lostPackages.push(pkg);
  if (scene === state.scene && state.mode === 'world') syncLostPackagePickupsForScene(scene);
  return pkg;
}

export function claimLostPackage(pickup: PickupState): boolean {
  if (pickup.kind !== 'lostPackage') return false;
  if (pickup.reservedFor && pickup.reservedFor !== currentPlayerId()) {
    toast('这个遗失包裹不属于你。');
    return true;
  }
  const pkg = state.lostPackages.find(item => item.id === pickup.sourceId && !item.taken);
  if (!pkg) {
    pickup.taken = true;
    toast('这个遗失包裹已经空了。');
    return true;
  }
  const contents = pkg.contents || {};
  state.player.gold += contents.gold || 0;
  state.player.herbs += contents.herbs || 0;
  state.player.potions += contents.potions || 0;
  state.player.arrows += contents.arrows || 0;
  for (const [name, amount] of Object.entries(contents.materials || {})) {
    if (amount > 0) addMaterial(name, amount);
  }
  for (const [name, amount] of Object.entries(contents.resources || {})) {
    if (amount > 0) addResource(name, amount);
  }
  for (const gearId of contents.gearBag || []) {
    if (!state.player.gearBag.includes(gearId)) state.player.gearBag.push(gearId);
  }
  syncResourceTotals();
  pkg.taken = true;
  pickup.taken = true;
  pickup.takenBy = currentPlayerId();
  state.lostPackages = state.lostPackages.filter(item => item.id !== pkg.id);
  bus.emit(Events.INVENTORY_CHANGED, { kind: 'lostPackage', packageId: pkg.id });
  const recoveredKinds = [
    contents.gold ? `${contents.gold}G` : '',
    contents.herbs ? `药草${contents.herbs}` : '',
    contents.potions ? `回复药${contents.potions}` : '',
    contents.arrows ? `箭${contents.arrows}` : '',
    ...Object.entries(contents.materials || {}).map(([name, amount]) => `${name}${amount}`),
    ...Object.entries(contents.resources || {}).map(([name, amount]) => `${name}${amount}`),
    ...(contents.gearBag || []).map(id => `装备${id}`)
  ].filter(Boolean);
  log(`取回遗失的包裹：${recoveredKinds.join('、') || '没有剩余物品'}。`);
  return true;
}
