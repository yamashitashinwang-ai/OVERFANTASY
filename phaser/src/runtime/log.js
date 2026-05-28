// Structured logging built on `debug` (https://www.npmjs.com/package/debug).
//
// Design rules — keep noise low, signal high:
//
//   1. **Namespace tree is fixed and documented in NAMESPACES below.**
//      Adding a new line ⇒ pick an existing namespace, OR add a new key here
//      with a one-line comment. No ad-hoc `console.log` anywhere else.
//
//   2. **Levels are encoded as the last segment** of the namespace:
//      `:trace`  → spammy per-frame events (AI tick, position sync)
//      `:event`  → user/system events (attack fired, damage taken, panel opened)
//      `:warn`   → unexpected state, but recoverable
//      `:error`  → broken invariants / caught throws
//
//   3. **Toggle at runtime** without rebuilding:
//        localStorage.debug = 'overfantasy:*'                   // everything
//        localStorage.debug = 'overfantasy:combat:*'            // combat only
//        localStorage.debug = 'overfantasy:*:event,overfantasy:*:warn,overfantasy:*:error'
//      Then refresh the page. Disabled namespaces are zero-cost (debug
//      short-circuits before the format string is built).
//
//   4. **All output is also captured into a ring buffer** so the user can
//      dump the last N events as one paste-friendly string via
//      `window.__dumpLogs()` — the dev hook in scenes/Game.js wires this up.

import createDebug from 'debug';

const ROOT = 'overfantasy';

// ─── Canonical namespace tree ─────────────────────────────────────────────
// Add a new key here (with a comment) BEFORE using it from gameplay code.
export const NAMESPACES = {
  // Combat — attack inputs, damage application, defeats
  COMBAT_PLAYER_ATTACK:  `${ROOT}:combat:player-attack:event`,
  COMBAT_PLAYER_HURT:    `${ROOT}:combat:player-hurt:event`,
  COMBAT_ENEMY_ATTACK:   `${ROOT}:combat:enemy-attack:event`,
  COMBAT_ENTITY_HIT:     `${ROOT}:combat:entity-hit:event`,
  COMBAT_DEFEAT:         `${ROOT}:combat:defeat:event`,
  COMBAT_DODGE:          `${ROOT}:combat:dodge:event`,
  COMBAT_BLOCK:          `${ROOT}:combat:block:event`,
  COMBAT_BOW:            `${ROOT}:combat:bow:event`,

  // AI per-frame state (spammy — disable unless investigating)
  AI_TICK_TRACE:         `${ROOT}:ai:tick:trace`,
  AI_AGGRO_CHANGE:       `${ROOT}:ai:aggro:event`,

  // Magic
  MAGIC_CAST_BEGIN:      `${ROOT}:magic:cast-begin:event`,
  MAGIC_CAST_RESOLVE:    `${ROOT}:magic:cast-resolve:event`,
  MAGIC_LEARNED:         `${ROOT}:magic:learned:event`,

  // Inventory / economy
  INVENTORY_CHANGED:     `${ROOT}:inventory:changed:event`,
  GEAR_EQUIPPED:         `${ROOT}:gear:equipped:event`,
  ECONOMY_TRANSACTION:   `${ROOT}:economy:transaction:event`,

  // Quest
  QUEST_LIFECYCLE:       `${ROOT}:quest:lifecycle:event`,

  // Scene + game-flow lifecycle
  SCENE_TRANSITION:      `${ROOT}:scene:transition:event`,
  GAME_LIFECYCLE:        `${ROOT}:game:lifecycle:event`,
  PANEL_LIFECYCLE:       `${ROOT}:panel:lifecycle:event`,

  // Input
  INPUT_KEY:             `${ROOT}:input:key:trace`,
  INPUT_POINTER:         `${ROOT}:input:pointer:trace`,

  // Runtime invariants + persistence
  INVARIANT_BROKEN:      `${ROOT}:invariant:broken:warn`,
  INVARIANT_INFO:        `${ROOT}:invariant:info:event`,
  PERSISTENCE:           `${ROOT}:persistence:event`,
  PERSISTENCE_ERROR:     `${ROOT}:persistence:error`,
};

// ─── Ring buffer (paste-friendly) ─────────────────────────────────────────
const BUFFER_MAX = 500;
const buffer = []; // { t, ns, msg, args }

function bufferPush(ns, args) {
  if (buffer.length >= BUFFER_MAX) buffer.shift();
  buffer.push({
    t: performance.now(),
    ns,
    msg: args[0],
    args: args.slice(1)
  });
}

// ─── Per-namespace logger cache ───────────────────────────────────────────
const cache = new Map();

function getLogger(ns) {
  if (!cache.has(ns)) {
    const fn = createDebug(ns);
    // Wrap so every call also writes to the ring buffer (irrespective of
    // whether the namespace is enabled in `debug` — buffer captures
    // everything for post-hoc dumping).
    const wrapped = (...args) => {
      bufferPush(ns, args);
      fn(...args);
    };
    wrapped.enabled = () => fn.enabled;
    cache.set(ns, wrapped);
  }
  return cache.get(ns);
}

// ─── Public API ────────────────────────────────────────────────────────────
// Usage:
//   import { log, NS } from '../runtime/log.js';
//   log(NS.COMBAT_PLAYER_HURT, 'hp %d -> %d  source=%o', before, after, source);
//
// `NS` is an alias for `NAMESPACES` for terser call sites.

export const NS = NAMESPACES;

export function log(ns, ...args) {
  getLogger(ns)(...args);
}

// Dump the recent log buffer as a paste-friendly string. Useful for
// "paste your console log here" support flows.
export function dumpLogs(limit = 200) {
  const recent = buffer.slice(-limit);
  return recent
    .map(({ t, ns, msg, args }) => {
      const ts = (t / 1000).toFixed(2).padStart(8);
      const rest = args.length
        ? ' ' + args.map(a => {
            if (a == null) return String(a);
            if (typeof a === 'string') return a;
            try { return JSON.stringify(a); } catch { return String(a); }
          }).join(' ')
        : '';
      return `${ts}s [${ns}] ${msg}${rest}`;
    })
    .join('\n');
}

export function clearLogs() { buffer.length = 0; }

// Convenience: enable a debug pattern at runtime (instead of localStorage edit).
export function setLogPattern(pattern) {
  if (typeof localStorage === 'undefined') return;
  if (pattern) localStorage.setItem('debug', pattern);
  else localStorage.removeItem('debug');
  // Apply immediately (no refresh needed)
  createDebug.enable(pattern || '');
}

// Useful default for "paste console for support" flow: keep events+warns+errors,
// drop traces. Call this once at game boot if no `debug` pattern is set.
export function enableDefaultPattern() {
  if (typeof localStorage === 'undefined') return;
  if (localStorage.getItem('debug')) return;
  setLogPattern(`${ROOT}:*:event,${ROOT}:*:warn,${ROOT}:*:error`);
}
