// Internationalisation domain service facade. Text data and storage helpers live
// in `domain/i18n/`; this module preserves the existing public API used by UI,
// persistence, and scene code.

import { bus, Events } from '../runtime/events.ts';
import { state } from '../runtime/state.ts';
import { uiText } from './i18n/catalog.ts';
import { isValidLanguage, type LanguageId } from './i18n/options.ts';
import { writeLanguageSetting } from './i18n/storage.ts';

export { uiText } from './i18n/catalog.ts';
export { isValidLanguage, languageOptions } from './i18n/options.ts';
export type { LanguageId } from './i18n/options.ts';
export { readLanguageSetting } from './i18n/storage.ts';

export function currentLanguage(): LanguageId {
  return isValidLanguage(state.settings?.language) ? state.settings.language : 'zh';
}

export function t(key: string): string {
  const lang = currentLanguage();
  return uiText[lang]?.[key] ?? uiText.zh[key] ?? key;
}

export function raceLabel(race: string): string {
  return t(`race.${race}`);
}

/**
 * Switch active language. Persists to localStorage and emits LANGUAGE_CHANGED
 * so UI layers can re-render. Does NOT touch the DOM directly.
 */
export function setLanguage(language: string) {
  if (!isValidLanguage(language)) return;
  if (!state.settings || typeof state.settings !== 'object') state.settings = { language };
  state.settings.language = language;
  writeLanguageSetting(language);
  bus.emit(Events.LANGUAGE_CHANGED, { language });
}
