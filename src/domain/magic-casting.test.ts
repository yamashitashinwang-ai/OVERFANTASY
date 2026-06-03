import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setPendingMagicCast, state } from '../runtime/state.ts';
import * as magicCasting from './magic-casting.ts';
import { interruptPendingMagicCast } from './magic-casting/interrupt.ts';

describe('magic-casting domain facade and empty interrupt behavior', () => {
  let originalMpRegenLock = 0;

  beforeEach(() => {
    originalMpRegenLock = state.player.mpRegenLock || 0;
    setPendingMagicCast(null);
    state.player.mpRegenLock = 0;
  });

  afterEach(() => {
    setPendingMagicCast(null);
    state.player.mpRegenLock = originalMpRegenLock;
  });

  it('re-exports split magic-casting modules through the legacy entry point', () => {
    expect(magicCasting.interruptPendingMagicCast).toBe(interruptPendingMagicCast);
  });

  it('does not interrupt or lock MP regen when no cast is pending', () => {
    expect(interruptPendingMagicCast()).toBe(false);
    expect(state.player.mpRegenLock).toBe(0);
  });
});
