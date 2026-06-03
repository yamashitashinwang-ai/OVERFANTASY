import { state } from '../../state.ts';
import { PLAYER_COOLDOWN_FIELDS } from '../../player-cooldowns.ts';
import { isPlaying } from '../../ui-state.ts';
import type { RuntimeInvariant } from '../types.ts';

export const playerHpNeverNegativeInvariant: RuntimeInvariant = {
  id: 'player-hp-never-negative',
  check() {
    if (state.player.hp < 0) return `player.hp = ${state.player.hp}`;
    return null;
  }
};

export const playerPositionNeverNanInvariant: RuntimeInvariant = {
  id: 'player-position-never-nan',
  check() {
    if (!Number.isFinite(state.player.x) || !Number.isFinite(state.player.y)) {
      return `player.x=${state.player.x} y=${state.player.y}`;
    }
    return null;
  }
};

export const cooldownMustTickDownInvariant: RuntimeInvariant = {
  id: 'cooldown-must-tick-down',
  check(dt) {
    if (!isPlaying()) return null;
    const p = state.player;
    this._lastValues ??= {};
    this._stuckFor ??= {};
    for (const field of PLAYER_COOLDOWN_FIELDS) {
      const cur = p[field] || 0;
      const last = this._lastValues[field];
      if (cur > 0 && last !== undefined && Math.abs(cur - last) < 1e-9) {
        this._stuckFor[field] = (this._stuckFor[field] || 0) + dt;
        if (this._stuckFor[field] > 1.5) {
          this._stuckFor[field] = 0;
          this._lastValues[field] = cur;
          return `state.player.${field} stuck at ${cur.toFixed(3)} for >1.5s; player cooldown tick is not advancing`;
        }
      } else {
        this._stuckFor[field] = 0;
      }
      this._lastValues[field] = cur;
    }
    return null;
  }
};
