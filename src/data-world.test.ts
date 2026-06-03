import { describe, expect, it } from 'vitest';
import DATA from './data.ts';

describe('DATA world, resource, material, and pet integrity', () => {
  it('keeps world labels and color tokens mechanically usable', () => {
    for (const [regionId, region] of Object.entries(DATA.regions)) {
      expect(regionId.trim()).not.toBe('');
      expect(region.name.trim()).not.toBe('');
      expect(region.trust).toBeGreaterThanOrEqual(0);
      expect(region.trust).toBeLessThanOrEqual(100);
      expect(region.hate).toBeGreaterThanOrEqual(0);
      expect(region.hate).toBeLessThanOrEqual(100);
    }

    for (const [token, color] of Object.entries(DATA.colors)) {
      expect(token.trim()).not.toBe('');
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    }

    for (const [sceneId, sceneName] of Object.entries(DATA.sceneNames)) {
      expect(sceneId.trim()).not.toBe('');
      expect(sceneName.trim()).not.toBe('');
    }
  });

  it('keeps resource and material records mechanically usable', () => {
    const validResourceGroups = new Set(['wood', 'stone', 'special']);

    for (const [name, resource] of Object.entries(DATA.resourceCatalog)) {
      expect(name.trim()).not.toBe('');
      expect(validResourceGroups.has(resource.group)).toBe(true);
      expect(resource.desc.trim()).not.toBe('');
    }

    for (const [name, material] of Object.entries(DATA.materialCatalog)) {
      expect(name.trim()).not.toBe('');
      expect(material.desc?.trim()).toBeTruthy();
      expect(material.sell == null || material.sell > 0).toBe(true);

      for (const key of ['atk', 'def', 'thorns', 'slow', 'aoeSlow', 'radius', 'duration'] as const) {
        const value = material[key];
        if (value != null) expect(Number.isFinite(value)).toBe(true);
      }
    }
  });

  it('keeps pet records mechanically usable', () => {
    for (const [petId, pet] of Object.entries(DATA.petCatalog)) {
      expect(petId.trim()).not.toBe('');
      expect(pet.name.trim()).not.toBe('');
      expect(pet.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(pet.r).toBeGreaterThan(0);
      expect(pet.maxHp).toBeGreaterThan(0);
      expect(pet.atk).toBeGreaterThanOrEqual(0);
      expect(pet.speed).toBeGreaterThan(0);
      expect(pet.roamRadius).toBeGreaterThan(0);
      expect(pet.attackRange).toBeGreaterThan(0);
      expect(pet.guardRange).toBeGreaterThanOrEqual(pet.attackRange);
      expect(pet.cooldown).toBeGreaterThan(0);
    }
  });

  it('keeps material pet contracts usable', () => {
    for (const material of Object.values(DATA.materialCatalog)) {
      if (material.pet) expect(DATA.petCatalog[material.pet]).toBeDefined();
    }
  });
});
