import { magicList } from "./catalog.ts";
import { normalizeMagicTerm } from "./normalize.ts";

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
