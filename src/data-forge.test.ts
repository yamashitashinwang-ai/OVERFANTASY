import { describe, expect, it } from 'vitest';
import DATA from './data.ts';
import { materialMod } from './domain/economy/formulae.ts';
import type { GearMod, GearSlot } from './domain/types.ts';

describe('DATA forge integrity', () => {
  it('keeps weapon forge recipe references resolvable', () => {
    for (const recipes of Object.values(DATA.weaponForgeCatalog)) {
      for (const recipe of recipes) {
        expect(DATA.gearCatalog[recipe.gearId]?.slot).toBe('weapon');
        for (const materialName of Object.keys(recipe.materials)) {
          expect(DATA.resourceCatalog[materialName]).toBeDefined();
        }
      }
    }
  });

  it('keeps material forge mods mechanically usable', () => {
    const forgeSlots: GearSlot[] = ['weapon', 'head', 'body', 'legs', 'feet', 'accessory'];
    const forgeEffectKeys = ['atk', 'def', 'cooldownMult', 'repel', 'thorns', 'slow', 'aoeSlow', 'radius', 'duration'] as const;
    const numericModKeys = ['atk', 'def', 'thorns', 'slowOnHit', 'slowOnBlock', 'aoeSlowOnHit', 'cooldownMult', 'radius', 'duration'] as const;
    const isGearMod = (mod: GearMod | null): mod is GearMod => mod !== null;

    for (const [name, material] of Object.entries(DATA.materialCatalog)) {
      const hasForgeEffect = forgeEffectKeys.some(key => material[key] != null);
      const mods = forgeSlots.map(slot => materialMod(name, slot)).filter(isGearMod);

      if (!hasForgeEffect) {
        expect(mods).toHaveLength(0);
        continue;
      }

      expect(mods.length).toBeGreaterThan(0);
      for (const mod of mods) {
        expect(mod.material).toBe(name);
        expect(mod.label).toBe(name);
        expect(DATA.materialCatalog[mod.material || '']).toBeDefined();
        expect(typeof mod.repelMonsters).toBe('boolean');

        for (const key of numericModKeys) {
          const value = mod[key];
          if (value != null) expect(Number.isFinite(value)).toBe(true);
        }

        if (mod.cooldownMult != null) {
          expect(mod.cooldownMult).toBeGreaterThan(0);
          expect(mod.cooldownMult).toBeLessThanOrEqual(1);
        }
        for (const slowKey of ['slowOnHit', 'slowOnBlock', 'aoeSlowOnHit'] as const) {
          const value = mod[slowKey];
          if (value != null) {
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(1);
          }
        }
      }
    }
  });

  it('keeps weapon forge recipe groups mechanically usable', () => {
    for (const [category, recipes] of Object.entries(DATA.weaponForgeCatalog)) {
      expect(recipes.length).toBeGreaterThan(0);
      for (const recipe of recipes) {
        const gear = DATA.gearCatalog[recipe.gearId];
        expect(gear?.type).toBe(category);
        for (const amount of Object.values(recipe.materials)) {
          expect(amount).toBeGreaterThan(0);
        }
      }
    }
  });
});
