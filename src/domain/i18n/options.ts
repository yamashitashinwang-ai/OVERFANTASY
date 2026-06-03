export const languageStorageKey = 'overfantasy.language.v1';

export const languageOptions = [
  { id: "zh", htmlLang: "zh-CN", label: "中文" },
  { id: "ja", htmlLang: "ja", label: "日本語" },
  { id: "en", htmlLang: "en", label: "English" }
] as const;

export type LanguageId = typeof languageOptions[number]['id'];
export type UiTextCatalog = Record<string, string>;

export function isValidLanguage(value: unknown): value is LanguageId {
  return languageOptions.some(option => option.id === value);
}
