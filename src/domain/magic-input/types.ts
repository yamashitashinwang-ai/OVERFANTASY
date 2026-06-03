import type { MagicCatalogItem } from "../types.ts";

export type MagicSpell = MagicCatalogItem & { id: string };

export interface ForbiddenMagicInput {
  aliases: string[];
  message: string;
}
