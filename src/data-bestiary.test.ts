import { describe, expect, it } from 'vitest';
import DATA from './data.ts';
import type { DropSpec } from './domain/types.ts';

describe('DATA bestiary integrity', () => {
  it('keeps bestiary entries mechanically usable', () => {
    const validDropKinds = new Set(['gold', 'material', 'gear', 'weapon']);
    const checkDropShape = (drop?: DropSpec) => {
      if (!drop) return;
      expect(validDropKinds.has(drop.kind)).toBe(true);
      expect(drop.name.trim()).not.toBe('');
      expect(drop.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(drop.chance).toBeGreaterThan(0);
      expect(drop.chance).toBeLessThanOrEqual(1);
      if (drop.value != null) expect(drop.value).toBeGreaterThan(0);
    };

    for (const [speciesId, entry] of Object.entries(DATA.bestiary)) {
      expect(speciesId.trim()).not.toBe('');
      expect(entry.name.trim()).not.toBe('');
      expect(entry.kind.trim()).not.toBe('');
      expect(entry.faction.trim()).not.toBe('');
      expect(entry.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(entry.r).toBeGreaterThan(0);
      expect(entry.hp).toBeGreaterThan(0);
      expect(entry.atk).toBeGreaterThanOrEqual(0);
      expect(entry.speed).toBeGreaterThan(0);

      for (const flag of ['flee', 'split', 'pounce', 'guard', 'ranged'] as const) {
        const value = entry[flag];
        if (value != null) expect(typeof value).toBe('boolean');
      }

      checkDropShape(entry.commonDrop);
      checkDropShape(entry.rareDrop);
      entry.extraDrops?.forEach(checkDropShape);
    }
  });

  it('keeps bestiary drop references resolvable', () => {
    const gearNames = new Set(Object.values(DATA.gearCatalog).map(gear => gear.name));
    const checkDrop = (drop?: DropSpec) => {
      if (!drop || drop.kind === 'gold') return;
      if (drop.kind === 'material') {
        expect(DATA.materialCatalog[drop.name]).toBeDefined();
      } else if (drop.kind === 'gear' || drop.kind === 'weapon') {
        expect(gearNames.has(drop.name)).toBe(true);
      }
    };

    for (const entry of Object.values(DATA.bestiary)) {
      checkDrop(entry.commonDrop);
      checkDrop(entry.rareDrop);
      entry.extraDrops?.forEach(checkDrop);
    }
  });
});
