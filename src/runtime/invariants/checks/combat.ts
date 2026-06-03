import { state } from '../../state.ts';
import { isPlaying } from '../../ui-state.ts';
import {
  CONFIG,
  clearLiveness,
  hasRecentDamageEvent,
  livenessElapsed,
  setLiveness
} from '../memory.ts';
import type { RuntimeInvariant } from '../types.ts';

export const adjacentMonsterMustDamageInvariant: RuntimeInvariant = {
  id: 'adjacent-monster-must-damage',
  check(dt) {
    if (!isPlaying()) { clearLiveness('adjacent-monster-must-damage'); return null; }
    const p = state.player;
    if (p.monsterForm) { clearLiveness('adjacent-monster-must-damage'); return null; }
    if ((p.invuln || 0) > 0) { clearLiveness('adjacent-monster-must-damage'); return null; }

    const nearMonster = state.entities.find(e =>
      e.alive && e.faction === 'monster' &&
      Math.hypot(e.x - p.x, e.y - p.y) < 0.9
    );
    if (!nearMonster) { clearLiveness('adjacent-monster-must-damage'); return null; }

    if (hasRecentDamageEvent()) { clearLiveness('adjacent-monster-must-damage'); return null; }

    const elapsed = livenessElapsed('adjacent-monster-must-damage', dt);
    if (elapsed > CONFIG.ADJACENT_DAMAGE_GRACE_SECONDS) {
      clearLiveness('adjacent-monster-must-damage');
      return `monster "${nearMonster.name}" has been adjacent for ${elapsed.toFixed(1)}s with no damage dealt (player.invuln=${(p.invuln || 0).toFixed(2)}, monster.cooldown=${(nearMonster.cooldown || 0).toFixed(2)})`;
    }
    return null;
  }
};

export const monsterFormSuppressesMonsterDamageInvariant: RuntimeInvariant = {
  id: 'monsterform-suppresses-monster-damage',
  severity: 'info',
  check(dt) {
    if (!isPlaying()) { clearLiveness('monsterform-warning'); return null; }
    const p = state.player;
    if (!p.monsterForm) { clearLiveness('monsterform-warning'); return null; }
    const adjacent = state.entities.find(e =>
      e.alive && e.faction === 'monster' &&
      Math.hypot(e.x - p.x, e.y - p.y) < 0.9
    );
    if (!adjacent) { clearLiveness('monsterform-warning'); return null; }
    const elapsed = livenessElapsed('monsterform-warning', dt);
    if (elapsed > 6) {
      setLiveness('monsterform-warning', 0);
      return `player is in monsterForm — monsters (e.g. "${adjacent.name}") are friendly and will not attack. Cleanse at the white shrine to revert.`;
    }
    return null;
  }
};
