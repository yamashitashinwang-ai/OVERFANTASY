import { normalizeMagicTerm } from "./normalize.ts";
import type { ForbiddenMagicInput } from "./types.ts";

// Forbidden phrases (easter-egg refusals when the player tries to type
// recognisably-evil spell names). The list is small and intentional.
export const forbiddenMagicInputs: ForbiddenMagicInput[] = [
  { aliases: ["阿瓦达索命", "アバダケダブラ", "Avada Kedavra"], message: "你不可以学这个，你不可以学这个的口牙！" },
  { aliases: ["钻心剜骨", "クルーシオ", "Crucio"],           message: "还是想想你爱的人吧..." },
  { aliases: ["魂魄出窍", "インペリオ", "Imperio"],          message: "你是否想过，朋友不再是朋友，家园不再是家园？" }
];

export function forbiddenMagicByInput(input: string): ForbiddenMagicInput | null {
  const normalized = normalizeMagicTerm(input);
  if (!normalized) return null;
  return forbiddenMagicInputs.find(item =>
    item.aliases.some(alias => normalizeMagicTerm(alias) === normalized)
  ) || null;
}
