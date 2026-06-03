import { readBrowserStorageItem, writeBrowserStorageItem } from '../../runtime/browser-storage.ts';
import { isValidLanguage, languageStorageKey, type LanguageId } from './options.ts';

export function readLanguageSetting(): LanguageId {
  const stored = readBrowserStorageItem(languageStorageKey);
  return isValidLanguage(stored) ? stored : 'zh';
}

export function writeLanguageSetting(language: LanguageId) {
  writeBrowserStorageItem(languageStorageKey, language);
}
