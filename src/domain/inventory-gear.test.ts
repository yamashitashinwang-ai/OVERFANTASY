import { beforeEach, describe, expect, it } from 'vitest';
import { bus, Events } from '../runtime/events.ts';
import { state } from '../runtime/state.ts';
import { addGearToBag, equipGear, gearIdForPickup } from './inventory.ts';
import { resetInventoryTestState } from './inventory.test-fixtures.ts';
import type { PickupState } from './types.ts';

describe('inventory gear facade', () => {
  beforeEach(() => {
    resetInventoryTestState();
    bus.off(Events.GEAR_EQUIPPED);
  });

  it('adds, resolves, and equips gear through the public facade', () => {
    const equippedEvents: unknown[] = [];
    bus.on(Events.GEAR_EQUIPPED, event => equippedEvents.push(event));

    expect(addGearToBag('ironSword')).toBe(true);
    expect(state.player.gearBag).toContain('ironSword');
    expect(gearIdForPickup({ kind: 'gear', name: '石剑' } as PickupState)).toBe('ironSword');
    expect(gearIdForPickup({ kind: 'conceptSword', name: '剑的概念' } as PickupState)).toBe('conceptSword');

    equipGear('ironSword');

    expect(state.player.gear.weapon).toBe('ironSword');
    expect(equippedEvents).toEqual([
      expect.objectContaining({ slot: 'weapon', gearId: 'ironSword' })
    ]);
  });
});
