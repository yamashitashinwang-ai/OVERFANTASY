import { describe, expect, it } from 'vitest';
import DATA from './data.ts';
import { initialState } from './runtime/state.ts';

describe('DATA gear integrity', () => {
  it('keeps initial player gear references resolvable', () => {
    const initialGear = initialState.player.gear;
    const initialGearBag = new Set(initialState.player.gearBag);

    for (const [slot, gearId] of Object.entries(initialGear)) {
      if (!gearId) continue;
      const gear = DATA.gearCatalog[gearId];
      expect(gear).toBeDefined();
      expect(gear.slot).toBe(slot);
      expect(initialGearBag.has(gearId)).toBe(true);
    }

    for (const gearId of initialState.player.gearBag) {
      expect(DATA.gearCatalog[gearId]).toBeDefined();
    }
    expect(DATA.gearCatalog[initialGear.weapon || '']?.name).toBe(initialState.player.weapon);
  });

  it('keeps gear catalog records mechanically usable', () => {
    const gearNames = new Set<string>();

    for (const [id, gear] of Object.entries(DATA.gearCatalog)) {
      expect(id.trim()).not.toBe('');
      expect(gear.name.trim()).not.toBe('');
      expect(gearNames.has(gear.name)).toBe(false);
      gearNames.add(gear.name);

      if (gear.slot === 'weapon') {
        expect(gear.type).toBeTruthy();
        expect(Number(gear.atk || 0)).toBeGreaterThanOrEqual(0);
        expect(Number(gear.range || 0)).toBeGreaterThan(0);
        expect(Number(gear.cooldown || 0)).toBeGreaterThan(0);
        expect(Number(gear.stamina || 0)).toBeGreaterThan(0);
      } else {
        expect(['head', 'body', 'legs', 'feet', 'accessory']).toContain(gear.slot);
        expect(Number(gear.atk || 0)).toBeGreaterThanOrEqual(0);
        expect(Number(gear.def || 0)).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
