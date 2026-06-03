// Magic-casting compatibility facade. Interrupt reason typing and cast
// interruption side effects live under `domain/magic-casting/`.

export type { MagicInterruptReason } from './magic-casting/types.ts';
export { interruptPendingMagicCast } from './magic-casting/interrupt.ts';
