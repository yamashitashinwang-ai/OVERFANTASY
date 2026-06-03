import { state } from '../../runtime/state.ts';
import { makeRuntimeId, worldOwnerId } from '../session.ts';
import type { PickupState } from '../types.ts';

interface PickupOptions {
  id?: string;
  ownerId?: string;
  reservedFor?: string | null;
  sourceId?: string | null;
}

type ScatterPickup = Pick<PickupState, 'kind' | 'name' | 'x' | 'y' | 'color'> & { value?: number };

// Some legacy weapon pickups have been removed from the world but may still
// be referenced in old save files. Skip them on rehydrate.
const removedMapWeaponPickupNames = new Set(['短木弓', '铁剑', '石剑', '橡木锤', '战锤', '剑的概念']);

export function isRemovedMapWeaponPickup(pickup: PickupState | null | undefined): boolean {
  return pickup?.kind === 'weapon' && removedMapWeaponPickupNames.has(pickup?.name);
}

export function addPickup(kind: string, name: string, x: number, y: number, color: string, value = 1, options: PickupOptions = {}): PickupState {
  const pickup: PickupState = {
    id: options.id || makeRuntimeId("pickup"),
    ownerId: options.ownerId || worldOwnerId,
    reservedFor: options.reservedFor || null,
    sourceId: options.sourceId || null,
    kind,
    name,
    x,
    y,
    color,
    value,
    taken: false,
    takenBy: null
  };
  state.pickups.push(pickup);
  return pickup;
}

export function scatterPickups(list: ScatterPickup[]) {
  for (const p of list) addPickup(p.kind, p.name, p.x, p.y, p.color, p.value || 1);
}
