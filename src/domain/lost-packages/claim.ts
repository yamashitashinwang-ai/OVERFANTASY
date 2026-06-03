import { bus, Events } from '../../runtime/events.ts';
import { log, toast } from '../../runtime/services.ts';
import { state } from '../../runtime/state.ts';
import { addMaterial, addResource, syncResourceTotals } from '../inventory.ts';
import { currentPlayerId } from '../session.ts';
import type { PickupState } from '../types.ts';

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
