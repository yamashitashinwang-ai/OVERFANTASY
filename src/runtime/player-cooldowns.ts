// Player cooldown infrastructure.
//
// Every cooldown field on state.player is an accessor:
//   - getter reads from a private storage slot.
//   - setter writes to that slot.
//
// GameScene.update() calls tickPlayerCooldowns() once per frame to decay each
// slot toward 0. Direct assignment is the only cooldown write model:
// `state.player.invuln = 0.34`.
//
// Call `installPlayerCooldowns(state.player)` once at game boot **and** after
// each full state restore (`resetGameState`, `startLoadedSave`), because
// `replaceObject` blows away accessors when it copies fields.

// The full list of cooldown-tracked fields on the player. Add new fields
// here AND nowhere else.
import type { PlayerState } from '../domain/types.ts';

export const PLAYER_COOLDOWN_FIELDS = [
  'invuln',
  'attackCooldown',
  'dodgeCooldown',
  'dodgeTimer',
  'blockTimer',
  'mpRegenLock',
  'giftCooldown',
] as const;

export type PlayerCooldownField = typeof PLAYER_COOLDOWN_FIELDS[number];

function storageKey(field: PlayerCooldownField) { return `__cd_${field}`; }

export function installPlayerCooldowns(player: PlayerState | null | undefined) {
  if (!player) return;
  const cooldownStorage = player as PlayerState & Record<string, number>;
  for (const field of PLAYER_COOLDOWN_FIELDS) {
    // Capture any value already on the property before we overwrite it.
    // After a save load this might be a non-zero remaining cooldown.
    const initial = typeof player[field] === 'number' ? player[field] : 0;
    const key = storageKey(field);

    Object.defineProperty(player, key, {
      value: initial,
      writable: true,
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(player, field, {
      get() { return cooldownStorage[key] || 0; },
      set(v: number) { cooldownStorage[key] = Math.max(0, Number(v) || 0); },
      enumerable: true,
      configurable: true
    });
  }
}

// Per-frame decrement. Called from GameScene.update() — mirrors the original
// game.js model (`state.player.invuln = Math.max(0, state.player.invuln - dt)`).
export function tickPlayerCooldowns(player: PlayerState | null | undefined, dt: number) {
  if (!player) return;
  const cooldownStorage = player as PlayerState & Record<string, number>;
  for (const field of PLAYER_COOLDOWN_FIELDS) {
    const key = storageKey(field);
    const cur = cooldownStorage[key];
    if (cur > 0) cooldownStorage[key] = Math.max(0, cur - dt);
  }
}
