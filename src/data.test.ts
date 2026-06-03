import { describe, expect, it } from 'vitest';
import DATA, {
  regions,
  colors,
  sceneNames,
  bestiary,
  gearCatalog,
  materialCatalog,
  resourceCatalog,
  weaponForgeCatalog,
  petCatalog,
  magicCatalog,
  questCatalog,
  graveDecayInterval,
  graveMaxDecay
} from './data.ts';

describe('DATA catalog facade', () => {
  it('assembles the split static catalogs under the existing default export', () => {
    expect(DATA.regions).toBe(regions);
    expect(DATA.colors).toBe(colors);
    expect(DATA.sceneNames).toBe(sceneNames);
    expect(DATA.bestiary).toBe(bestiary);
    expect(DATA.gearCatalog).toBe(gearCatalog);
    expect(DATA.materialCatalog).toBe(materialCatalog);
    expect(DATA.resourceCatalog).toBe(resourceCatalog);
    expect(DATA.weaponForgeCatalog).toBe(weaponForgeCatalog);
    expect(DATA.petCatalog).toBe(petCatalog);
    expect(DATA.magicCatalog).toBe(magicCatalog);
    expect(DATA.questCatalog).toBe(questCatalog);
    expect(DATA.graveDecayInterval).toBe(graveDecayInterval);
    expect(DATA.graveMaxDecay).toBe(graveMaxDecay);
  });

  it('keeps expected catalog counts stable', () => {
    expect(Object.keys(DATA.regions)).toHaveLength(11);
    expect(Object.keys(DATA.bestiary)).toHaveLength(8);
    expect(Object.keys(DATA.gearCatalog)).toHaveLength(39);
    expect(Object.keys(DATA.materialCatalog)).toHaveLength(15);
    expect(Object.keys(DATA.resourceCatalog)).toHaveLength(12);
    expect(Object.keys(DATA.weaponForgeCatalog)).toHaveLength(5);
    expect(Object.keys(DATA.petCatalog)).toHaveLength(2);
    expect(Object.keys(DATA.magicCatalog)).toHaveLength(5);
    expect(DATA.questCatalog.major).toHaveLength(2);
    expect(DATA.questCatalog.small).toHaveLength(2);
  });

  it('keeps grave decay timing constants mechanically usable', () => {
    expect(Number.isFinite(DATA.graveDecayInterval)).toBe(true);
    expect(DATA.graveDecayInterval).toBeGreaterThan(0);
    expect(Number.isFinite(DATA.graveMaxDecay)).toBe(true);
    expect(Number.isInteger(DATA.graveMaxDecay)).toBe(true);
    expect(DATA.graveMaxDecay).toBeGreaterThanOrEqual(0);
  });
});
