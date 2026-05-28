// Magic-input matching domain. The "type a spell name" flow normalises raw
// player input (unicode forms, whitespace, punctuation), then matches against
// either the canonical spell catalog or the curated list of forbidden phrases.
//
// Pure functions: take strings + catalog, return matches. No DOM, no engine.

import DATA from '../data.ts';
import type { MagicCatalogItem } from './types.ts';

const { magicCatalog } = DATA;

export type MagicSpell = MagicCatalogItem & { id: string };

export function magicList(): MagicSpell[] {
  return Object.entries(magicCatalog || {}).map(([id, spell]) => ({ id, ...spell }));
}

export function normalizeMagicTerm(value: unknown): string {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    // eslint-disable-next-line no-irregular-whitespace -- full-width space (U+3000) is intentional input we strip
    .replace(/[\s　"'“”‘’.,，。!?！？・、\-_/\\]/g, '');
}

export function magicByInput(input: string): MagicSpell | null {
  const normalized = normalizeMagicTerm(input);
  if (!normalized) return null;
  return magicList().find(spell =>
    spell.aliases.some(alias => normalizeMagicTerm(alias) === normalized)
  ) || null;
}

// Forbidden phrases (easter-egg refusals when the player tries to type
// recognisably-evil spell names). The list is small and intentional.
export const forbiddenMagicInputs = [
  { aliases: ['阿瓦达索命', 'アバダケダブラ', 'Avada Kedavra'], message: '你不可以学这个，你不可以学这个的口牙！' },
  { aliases: ['钻心剜骨', 'クルーシオ', 'Crucio'],           message: '还是想想你爱的人吧...' },
  { aliases: ['魂魄出窍', 'インペリオ', 'Imperio'],          message: '你是否想过，朋友不再是朋友，家园不再是家园？' }
];

export function forbiddenMagicByInput(input: string): { aliases: string[]; message: string } | null {
  const normalized = normalizeMagicTerm(input);
  if (!normalized) return null;
  return forbiddenMagicInputs.find(item =>
    item.aliases.some(alias => normalizeMagicTerm(alias) === normalized)
  ) || null;
}

// Damerau-light edit distance — used by isNearMagicName for fuzzy matching.
function editDistance(a: string, b: string): number {
  const aa = Array.from(a);
  const bb = Array.from(b);
  const dp = Array.from({ length: aa.length + 1 }, () => Array(bb.length + 1).fill(0));
  for (let i = 0; i <= aa.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= bb.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= aa.length; i += 1) {
    for (let j = 1; j <= bb.length; j += 1) {
      const cost = aa[i - 1] === bb[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[aa.length][bb.length];
}

/**
 * True if `input` is "close" to (but not exactly) a known spell name. Used to
 * tell the player "this looks like a spell but isn't quite right" instead of
 * silently rejecting their attempt.
 */
export function isNearMagicName(input: string): boolean {
  const normalized = normalizeMagicTerm(input);
  if (!normalized) return false;
  return magicList().some(spell => spell.aliases.some(alias => {
    const candidate = normalizeMagicTerm(alias);
    if (!candidate || candidate === normalized) return false;
    if (candidate.includes(normalized) || normalized.includes(candidate)) {
      return Math.min(candidate.length, normalized.length) >= 2;
    }
    return editDistance(normalized, candidate) <= Math.max(1, Math.floor(candidate.length * 0.34));
  }));
}
