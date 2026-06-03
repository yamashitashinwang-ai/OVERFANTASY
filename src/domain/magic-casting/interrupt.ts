import { bus, Events } from '../../runtime/events.ts';
import { toast } from '../../runtime/services.ts';
import { getPendingMagicCast, setPendingMagicCast, state } from '../../runtime/state.ts';
import type { MagicInterruptReason } from './types.ts';

export function interruptPendingMagicCast(reason: MagicInterruptReason = 'interrupted'): boolean {
  const cast = getPendingMagicCast();
  if (!cast) return false;
  setPendingMagicCast(null);
  state.player.mpRegenLock = Math.max(state.player.mpRegenLock || 0, 1.5);
  bus.emit(Events.MAGIC_CAST_INTERRUPTED, { reason, spellId: cast.spellId });
  if (reason === 'insufficientMp') toast("魔力不足，施法中断。");
  else toast("施法被打断。");
  return true;
}
