import { describe, expect, it } from 'vitest';
import * as magicInput from './magic-input.ts';
import { magicByInput, magicList } from './magic-input/catalog.ts';
import { forbiddenMagicByInput, forbiddenMagicInputs } from './magic-input/forbidden.ts';
import { isNearMagicName } from './magic-input/fuzzy.ts';
import { normalizeMagicTerm } from './magic-input/normalize.ts';

describe('magic-input domain facade and pure matching helpers', () => {
  it('re-exports split magic-input modules through the legacy entry point', () => {
    expect(magicInput.magicList).toBe(magicList);
    expect(magicInput.magicByInput).toBe(magicByInput);
    expect(magicInput.normalizeMagicTerm).toBe(normalizeMagicTerm);
    expect(magicInput.forbiddenMagicInputs).toBe(forbiddenMagicInputs);
    expect(magicInput.forbiddenMagicByInput).toBe(forbiddenMagicByInput);
    expect(magicInput.isNearMagicName).toBe(isNearMagicName);
  });

  it('normalizes punctuation, width, whitespace, and case for magic matching', () => {
    expect(normalizeMagicTerm(' Fire-Ball！ ')).toBe('fireball');
    expect(normalizeMagicTerm('ｆｉｒｅ　ｂａｌｌ')).toBe('fireball');
    expect(normalizeMagicTerm(null)).toBe('');
  });

  it('matches known magic aliases and forbidden phrases without mutating state', () => {
    expect(magicByInput(' fire-ball ')?.id).toBe('fireball');
    expect(magicByInput('leaf/cutter')?.id).toBe('leafCutter');
    expect(magicByInput('unknown spell')).toBeNull();

    expect(forbiddenMagicByInput('Avada Kedavra')?.message).toContain('你不可以学这个');
    expect(forbiddenMagicByInput('harmless words')).toBeNull();
  });

  it('detects near magic names while excluding exact aliases and unrelated input', () => {
    expect(isNearMagicName('firebal')).toBe(true);
    expect(isNearMagicName('fireball')).toBe(false);
    expect(isNearMagicName('zzzz')).toBe(false);
  });
});
