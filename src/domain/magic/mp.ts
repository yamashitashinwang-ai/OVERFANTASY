import { state, getPendingMagicCast } from '../../runtime/state.ts';
import { playerHasEnemyAggro } from './targets.ts';

export function updateMpRegen(dt: number) {
  const p = state.player;
  if (getPendingMagicCast()) return;
  if (p.mpRegenLock > 0 || p.mp >= p.maxMp) {
    p.mp = Math.min(p.maxMp, p.mp);
    return;
  }
  const inCombat = playerHasEnemyAggro();
  const rate = inCombat ? (0.3 + p.maxMp * 0.02) : (1 + p.maxMp * 0.05);
  p.mp = Math.min(p.maxMp, p.mp + rate * dt);
}
