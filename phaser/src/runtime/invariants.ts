// Runtime invariant checker. A central place where gameplay-truth assertions
// live, evaluated every frame. When an invariant breaks, we emit a single
// well-known event (INVARIANT_BROKEN) carrying a stable id + a human-readable
// message — never silently fail. E2E probes subscribe to this and fail the
// build the moment a regression appears, instead of waiting for someone to
// notice it during play.
//
// Pattern: each invariant is `{ id, check(state) -> string | null }`. Return
// `null` if OK; return a description string if violated.
//
// Adding a new invariant takes ~5 lines. Add to INVARIANTS below. The probe
// in test/probe-invariants.mjs runs the game for 10+ seconds and asserts
// zero violations.

import { bus, Events } from './events.ts';
import { state, runtime } from './state.ts';
import { PLAYER_COOLDOWN_FIELDS } from './player-cooldowns.ts';
import type { PlayerCooldownField } from './player-cooldowns.ts';
import { isPlaying } from './ui-state.ts';
import { log, NS } from './log.ts';

type InvariantSeverity = 'error' | 'info';

interface InvariantViolation {
  t: number;
  id: string;
  message: string;
  severity: InvariantSeverity;
}

interface RuntimeInvariant {
  id: string;
  severity?: InvariantSeverity;
  _lastValues?: Partial<Record<PlayerCooldownField, number>>;
  _stuckFor?: Partial<Record<PlayerCooldownField, number>>;
  check(this: RuntimeInvariant, dt: number): string | null;
}

// Each tracked invariant maintains a small bit of history so we can detect
// "this should have happened by now" (liveness) violations.
const violations: InvariantViolation[] = [];
const livenessClocks = new Map<string, number>(); // id -> seconds since condition first held

const CONFIG = {
  // If a hostile monster is adjacent to the player for this many seconds
  // while playing, the player MUST have taken damage. Otherwise the AI →
  // damage chain is broken.
  ADJACENT_DAMAGE_GRACE_SECONDS: 2.5,

  // If player HP changed, that's an automatic reset of the liveness clock.
  // We watch HP via PLAYER_HURT events.
};

// In-memory damage event log (timestamps, recent only).
const damageEventTimes: number[] = [];
bus.on(Events.PLAYER_HURT, () => damageEventTimes.push(performance.now()));

function recordViolation(id: string, message: string, severity: InvariantSeverity = 'error') {
  const v = { t: Date.now(), id, message, severity };
  violations.push(v);
  bus.emit(Events.INVARIANT_BROKEN, v);
  // Two console prefixes:
  //   [invariant] — something is broken; CI probes should fail
  //   [game-info] — by-design behaviour with non-obvious cause (e.g. monsterForm
  //                 suppresses monster damage); never fails CI but logs once
  //                 so the cause is visible when a player complains.
  const prefix = severity === 'info' ? '[game-info]' : '[invariant]';
  console.warn(`${prefix} ${id}: ${message}`);
  // Also route through the structured logger so the timeline shows it.
  log(severity === 'info' ? NS.INVARIANT_INFO : NS.INVARIANT_BROKEN, '%s: %s', id, message);
}

function clearLiveness(id: string) {
  livenessClocks.delete(id);
}

const INVARIANTS: RuntimeInvariant[] = [
  {
    id: 'adjacent-monster-must-damage',
    check(dt) {
      if (!isPlaying()) { clearLiveness('adjacent-monster-must-damage'); return null; }
      const p = state.player;
      if (p.monsterForm) { clearLiveness('adjacent-monster-must-damage'); return null; }
      if ((p.invuln || 0) > 0) { clearLiveness('adjacent-monster-must-damage'); return null; }

      // Is there any hostile monster within melee range right now?
      const nearMonster = state.entities.find(e =>
        e.alive && e.faction === 'monster' &&
        Math.hypot(e.x - p.x, e.y - p.y) < 0.9
      );
      if (!nearMonster) { clearLiveness('adjacent-monster-must-damage'); return null; }

      // Has a PLAYER_HURT event fired recently? If so, that's the proof we
      // wanted — clear the clock and bail.
      const now = performance.now();
      const recentDamage = damageEventTimes.some(t => now - t < 3000);
      // Prune old events
      while (damageEventTimes.length && now - damageEventTimes[0] > 5000) damageEventTimes.shift();
      if (recentDamage) { clearLiveness('adjacent-monster-must-damage'); return null; }

      // Accumulate "adjacent without damage" time
      const elapsed = (livenessClocks.get('adjacent-monster-must-damage') || 0) + dt;
      livenessClocks.set('adjacent-monster-must-damage', elapsed);
      if (elapsed > CONFIG.ADJACENT_DAMAGE_GRACE_SECONDS) {
        clearLiveness('adjacent-monster-must-damage');
        return `monster "${nearMonster.name}" has been adjacent for ${elapsed.toFixed(1)}s with no damage dealt (player.invuln=${(p.invuln||0).toFixed(2)}, monster.cooldown=${(nearMonster.cooldown||0).toFixed(2)})`;
      }
      return null;
    }
  },
  {
    id: 'player-hp-never-negative',
    check() {
      if (state.player.hp < 0) return `player.hp = ${state.player.hp}`;
      return null;
    }
  },
  {
    id: 'player-position-never-nan',
    check() {
      if (!Number.isFinite(state.player.x) || !Number.isFinite(state.player.y)) {
        return `player.x=${state.player.x} y=${state.player.y}`;
      }
      return null;
    }
  },
  {
    id: 'entity-position-never-nan',
    check() {
      for (const e of state.entities) {
        if (e.alive && (!Number.isFinite(e.x) || !Number.isFinite(e.y))) {
          return `entity ${e.name} x=${e.x} y=${e.y}`;
        }
      }
      return null;
    }
  },
  {
    id: 'scene-runtime-pSceneRef-set',
    check() {
      // After boot we must always have a scene reference (for cooldowns/timers).
      if (!runtime.pSceneRef) return 'runtime.pSceneRef is null after boot';
      return null;
    }
  },
  {
    // Cooldown fields should always decay while gameplay is running.
    // If one stays at the same positive value for more than 1.5 seconds, the
    // central cooldown tick path is broken.
    id: 'cooldown-must-tick-down',
    check(dt) {
      if (!isPlaying()) return null;
      const p = state.player;
      this._lastValues ??= {};
      this._stuckFor ??= {};
      for (const f of PLAYER_COOLDOWN_FIELDS) {
        const cur = p[f] || 0;
        const last = this._lastValues[f];
        if (cur > 0 && last !== undefined && Math.abs(cur - last) < 1e-9) {
          this._stuckFor[f] = (this._stuckFor[f] || 0) + dt;
          if (this._stuckFor[f] > 1.5) {
            this._stuckFor[f] = 0;
            this._lastValues[f] = cur;
            return `state.player.${f} stuck at ${cur.toFixed(3)} for >1.5s; player cooldown tick is not advancing`;
          }
        } else {
          this._stuckFor[f] = 0;
        }
        this._lastValues[f] = cur;
      }
      return null;
    }
  },
  {
    // Diagnostic — fires when the player is in monsterForm + a monster is
    // adjacent + no damage is happening. This is *expected* behaviour (it's a
    // design feature: monsters treat the transformed player as ally), but
    // historically users report this as "damage is broken". Logging it lets
    // us point at the cause from console without re-investigating each time.
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
      const elapsed = (livenessClocks.get('monsterform-warning') || 0) + dt;
      livenessClocks.set('monsterform-warning', elapsed);
      // Fire once per ~6 seconds while the situation persists
      if (elapsed > 6) {
        livenessClocks.set('monsterform-warning', 0);
        return `player is in monsterForm — monsters (e.g. "${adjacent.name}") are friendly and will not attack. Cleanse at the white shrine to revert.`;
      }
      return null;
    }
  }
];

export function tickInvariants(dt: number) {
  for (const inv of INVARIANTS) {
    try {
      const message = inv.check(dt);
      if (message) recordViolation(inv.id, message, inv.severity);
    } catch (e) {
      recordViolation(`${inv.id}-threw`, e instanceof Error ? e.message : String(e));
    }
  }
}

export function getViolations() { return [...violations]; }
export function clearViolations() { violations.length = 0; }
