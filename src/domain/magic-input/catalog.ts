import DATA from "../../data.ts";
import { normalizeMagicTerm } from "./normalize.ts";
import type { MagicSpell } from "./types.ts";

const { magicCatalog } = DATA;

export function magicList(): MagicSpell[] {
  return Object.entries(magicCatalog || {}).map(([id, spell]) => ({ id, ...spell }));
}

export function magicByInput(input: string): MagicSpell | null {
  const normalized = normalizeMagicTerm(input);
  if (!normalized) return null;
  return magicList().find(spell =>
    spell.aliases.some(alias => normalizeMagicTerm(alias) === normalized)
  ) || null;
}
