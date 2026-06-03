import type { ArrowProjectile, MagicEffectState } from '../../domain/types.ts';

// Append-only or frame-updated runtime collections. They are not persisted as
// part of save data and are cleared/reset by their owning systems.
export const logs: string[] = [];
export const flyingArrows: ArrowProjectile[] = [];
export const magicEffects: MagicEffectState[] = [];
