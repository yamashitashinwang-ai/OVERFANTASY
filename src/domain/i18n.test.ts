import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bus, Events } from '../runtime/events.ts';
import { state } from '../runtime/state.ts';
import {
  currentLanguage,
  isValidLanguage,
  languageOptions,
  raceLabel,
  readLanguageSetting,
  setLanguage,
  t,
  uiText
} from './i18n.ts';

const languageStorageKey = 'overfantasy.language.v1';
const originalLanguage = state.settings.language;

describe('i18n facade', () => {
  beforeEach(() => {
    state.settings.language = 'zh';
    window.localStorage.clear();
  });

  afterEach(() => {
    state.settings.language = originalLanguage;
    window.localStorage.clear();
  });

  it('keeps language options and catalog keys aligned', () => {
    expect(languageOptions.map(option => option.id)).toEqual(['zh', 'ja', 'en']);
    const zhKeys = Object.keys(uiText.zh).sort();
    expect(Object.keys(uiText.ja).sort()).toEqual(zhKeys);
    expect(Object.keys(uiText.en).sort()).toEqual(zhKeys);
  });

  it('keeps validation and translation fallback behavior stable', () => {
    expect(isValidLanguage('zh')).toBe(true);
    expect(isValidLanguage('xx')).toBe(false);

    state.settings.language = 'en';
    expect(currentLanguage()).toBe('en');
    expect(t('action.attack')).toBe('Attack');
    expect(raceLabel('人类')).toBe('Human');
    expect(t('missing.translation.key')).toBe('missing.translation.key');
  });

  it('reads stored language settings with invalid values falling back to zh', () => {
    window.localStorage.setItem(languageStorageKey, 'ja');
    expect(readLanguageSetting()).toBe('ja');

    window.localStorage.setItem(languageStorageKey, 'invalid');
    expect(readLanguageSetting()).toBe('zh');
  });

  it('persists setLanguage and emits exactly one language-change event', () => {
    const listener = vi.fn();
    bus.on(Events.LANGUAGE_CHANGED, listener);

    setLanguage('ja');
    expect(state.settings.language).toBe('ja');
    expect(window.localStorage.getItem(languageStorageKey)).toBe('ja');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ language: 'ja' });

    setLanguage('invalid');
    expect(state.settings.language).toBe('ja');
    expect(listener).toHaveBeenCalledTimes(1);

    bus.off(Events.LANGUAGE_CHANGED, listener);
  });
});
