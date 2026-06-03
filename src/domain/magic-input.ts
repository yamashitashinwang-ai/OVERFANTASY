// Magic-input compatibility facade. Concrete matching helpers live under
// `domain/magic-input/` so catalog lookup, normalization, forbidden phrases,
// and fuzzy matching are independently reviewable.

export type { MagicSpell, ForbiddenMagicInput } from "./magic-input/types.ts";
export { magicList, magicByInput } from "./magic-input/catalog.ts";
export { normalizeMagicTerm } from "./magic-input/normalize.ts";
export { forbiddenMagicInputs, forbiddenMagicByInput } from "./magic-input/forbidden.ts";
export { isNearMagicName } from "./magic-input/fuzzy.ts";
