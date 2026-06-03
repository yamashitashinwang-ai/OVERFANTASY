import { state } from '../../runtime/state.ts';
import { bus, Events } from '../../runtime/events.ts';
import DATA from '../../data.ts';

const { materialCatalog, resourceCatalog = {} } = DATA;

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
