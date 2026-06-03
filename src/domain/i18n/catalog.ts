import type { LanguageId, UiTextCatalog } from './options.ts';
import { zhText } from './catalog/zh.ts';
import { jaText } from './catalog/ja.ts';
import { enText } from './catalog/en.ts';

export const uiText: Record<LanguageId, UiTextCatalog> = {
  zh: zhText,
  ja: jaText,
  en: enText
};
