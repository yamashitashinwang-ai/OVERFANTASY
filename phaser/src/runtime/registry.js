// Phaser DataManager registry facade. The legacy `state.player` object holds
// dozens of mutable scalars — HP, MP, stamina, gold, cooldowns, etc. Each one
// is a candidate for `scene.registry` (Phaser.Data.DataManager) so that
// listeners can subscribe to `changedata-<key>` events instead of polling
// state every frame.
//
// This module is the bridge. It mirrors a small set of player stats from the
// legacy `state.player` into the Phaser registry every frame (so the registry
// stays canonical for cross-scene reads / future migration). Once the rest of
// the codebase reads via `registry.get()`, the legacy state object can shed
// these fields entirely.
//
// Reference pattern: see ui/stats.js for how a UI module could swap from
// `state.player.hp` to `bus.on('player:stats')` (which we emit on change).

import { bus, Events } from './events.js';

let scene = null;
let lastSnapshot = {};

const TRACKED_KEYS = [
  'hp', 'maxHp',
  'mp', 'maxMp',
  'stamina',
  'gold', 'arrows', 'herbs', 'potions',
  'atk', 'def',
  'race', 'job',
  'attackCooldown', 'dodgeCooldown', 'blockTimer', 'dodgeTimer', 'invuln'
];

/** Wire the registry to the active GameScene. Call once from create(). */
export function seedRegistry(gameScene, state) {
  scene = gameScene;
  const reg = scene.registry;
  for (const key of TRACKED_KEYS) {
    reg.set(`player.${key}`, state.player[key]);
    lastSnapshot[key] = state.player[key];
  }
}

/**
 * Called every frame (cheap). Diffs state.player against the cached snapshot;
 * if a tracked key changed, write it through to the registry. DataManager
 * fires `changedata` events automatically, so subscribers re-render reactively.
 */
export function syncRegistry(state) {
  if (!scene) return;
  const reg = scene.registry;
  let anyChanged = false;
  for (const key of TRACKED_KEYS) {
    const cur = state.player[key];
    if (cur !== lastSnapshot[key]) {
      reg.set(`player.${key}`, cur);
      lastSnapshot[key] = cur;
      anyChanged = true;
    }
  }
  if (anyChanged) bus.emit(Events.PLAYER_STATS);
}

/** Read a tracked stat from the registry (engine-canonical source). */
export function getPlayerStat(key) {
  return scene?.registry.get(`player.${key}`);
}

/** Subscribe to a single key. Returns an unsubscribe function. */
export function onPlayerStat(key, fn) {
  if (!scene) return () => {};
  const ev = `changedata-player.${key}`;
  scene.registry.events.on(ev, fn);
  return () => scene.registry.events.off(ev, fn);
}
