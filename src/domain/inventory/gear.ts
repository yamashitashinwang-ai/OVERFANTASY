import { state } from '../../runtime/state.ts';
import DATA from '../../data.ts';
import { bus, Events } from '../../runtime/events.ts';
import { autoSave } from '../../runtime/autosave.ts';
import { log, toast } from '../../runtime/services.ts';
import { refreshCombatStats } from '../combat/weapon.ts';
import type { PickupState } from '../types.ts';

const { gearCatalog } = DATA;
const gearNameToId: Record<string, string> = Object.fromEntries(Object.entries(gearCatalog).map(([id, gear]) => [gear.name, id]));

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
