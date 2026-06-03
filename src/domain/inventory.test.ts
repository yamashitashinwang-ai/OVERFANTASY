import { beforeEach, describe, expect, it } from 'vitest';
import { bus, Events } from '../runtime/events.ts';
import { state } from '../runtime/state.ts';
import {
  addMaterial,
  addResource,
  consumeAnyResource,
  consumeResource,
  materialCount,
  materialSummary,
  resourceCount,
  sellableMaterialCount,
  syncResourceTotals
} from './inventory.ts';
import { resetInventoryTestState } from './inventory.test-fixtures.ts';

describe('inventory resource facade', () => {
  beforeEach(() => {
    resetInventoryTestState();
    bus.off(Events.INVENTORY_CHANGED);
    bus.off(Events.GEAR_EQUIPPED);
  });

  it('tracks materials and grouped resources through the public facade', () => {
    const inventoryEvents: unknown[] = [];
    bus.on(Events.INVENTORY_CHANGED, event => inventoryEvents.push(event));

    addMaterial('魔狼牙', 2);
    addResource('木材', 2);
    addResource('硬木', 1);
    addResource('反重力石', 3);

    expect(state.player.materials['魔狼牙']).toBe(2);
    expect(materialCount()).toBe(2);
    expect(sellableMaterialCount()).toBe(2);
    expect(materialSummary()).toBe('魔狼牙2');
    expect(state.player.wood).toBe(3);
    expect(state.player.stone).toBe(3);
    expect(resourceCount('硬木')).toBe(1);

    expect(consumeAnyResource('wood', '硬木', 2)).toBe(true);
    expect(state.player.wood).toBe(1);
    expect(resourceCount('硬木')).toBe(0);

    expect(consumeResource('反重力石', 2)).toBe(true);
    expect(state.player.stone).toBe(1);
    expect(inventoryEvents).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'material', name: '魔狼牙', amount: 2 }),
      expect.objectContaining({ kind: 'resource', name: '木材', amount: 2 }),
      expect.objectContaining({ kind: 'resource', name: '反重力石', amount: -2 })
    ]));

    state.player.resources['银叶木'] = 4;
    syncResourceTotals();
    expect(state.player.wood).toBe(5);
  });
});
