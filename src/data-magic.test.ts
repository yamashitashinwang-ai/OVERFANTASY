import { describe, expect, it } from 'vitest';
import DATA from './data.ts';
import { normalizeMagicTerm } from './domain/magic-input/normalize.ts';

describe('DATA magic integrity', () => {
  it('keeps magic entries mechanically castable and alias-normalized uniquely', () => {
    const aliases = new Map<string, string>();

    for (const [spellId, spell] of Object.entries(DATA.magicCatalog)) {
      expect(spell.name.trim()).not.toBe('');
      expect(spell.aliases.length).toBeGreaterThan(0);
      expect(spell.cost).toBeGreaterThan(0);
      expect(spell.radius).toBeGreaterThan(0);
      expect(spell.color).toMatch(/^#[0-9a-f]{6}$/i);
      if (spell.chant != null) expect(spell.chant).toBeGreaterThanOrEqual(0);
      if (spell.effectDuration != null) expect(spell.effectDuration).toBeGreaterThan(0);

      for (const alias of spell.aliases) {
        const normalized = normalizeMagicTerm(alias);
        expect(normalized).not.toBe('');
        expect(aliases.get(normalized)).toBeUndefined();
        aliases.set(normalized, spellId);
      }

      if (spell.kind === 'heal') {
        expect(Number(spell.heal || 0)).toBeGreaterThan(0);
      } else if (spell.kind === 'zone') {
        expect(Number(spell.damagePerSecond || 0)).toBeGreaterThan(0);
        expect(Number(spell.slowPower || 0)).toBeGreaterThanOrEqual(0);
      } else {
        expect(Number(spell.damage || 0)).toBeGreaterThan(0);
      }
    }
  });

  it('keeps every known magic alias usable', () => {
    for (const spell of Object.values(DATA.magicCatalog)) {
      expect(spell.aliases.length).toBeGreaterThan(0);
      expect(spell.cost).toBeGreaterThan(0);
    }
  });
});
