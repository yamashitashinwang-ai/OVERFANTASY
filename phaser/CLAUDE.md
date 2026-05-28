# OVERFANTASY — Phaser 4 port

## Architecture

Layer responsibilities (low coupling, high cohesion):

```
src/
├── data.js                          # Static catalogs: regions, gear, materials, quests, magic
├── main.js                          # Phaser config + scene registration
├── runtime/                         # Engine-tied state + services
│   ├── state.js                     #   Single mutable runtime singleton (replaces 30+ `let`s)
│   ├── ui-state.js                  #   uiState + isMenuOpen/isPaused/isPlaying predicates
│   ├── services.js                  #   bus-driven log/toast
│   ├── events.js                    #   Phaser.Events.EventEmitter bus
│   ├── input.js                     #   bindMovementKeys, bindActions, routeEscape
│   ├── timers.js                    #   startCooldown / schedulePeriodic / scheduleOnce
│   └── registry.js                  #   Phaser DataManager mirror, emits PLAYER_STATS
├── domain/                          # Engine-agnostic game logic
│   ├── math.js                      #   clamp/dist/rand/choice/normalize/escapeHtml
│   ├── i18n.js                      #   languageOptions, t(), raceLabel
│   ├── world.js, world-spawn.js     #   tile map, addEntity, spawnCreature
│   ├── ai.js                        #   updateEntities / updatePets / updatePetRemains
│   ├── player.js                    #   updatePlayer, pickupItems
│   ├── combat/
│   │   ├── damage.js                #   damagePlayer, damagePet, defeatEntity, playerDefeated
│   │   ├── actions.js               #   playerAttack, playerDefend, playerDodge
│   │   ├── bow.js                   #   begin/release bow charge, fireArrow, updateFlyingArrows
│   │   ├── targeting.js             #   nearestEntity, attackSpecForWeapon
│   │   ├── weapon.js                #   currentWeapon, refreshCombatStats, gearModList
│   │   └── race.js                  #   playableRaces, raceDamageMultiplier, …
│   ├── magic.js                     #   beginMagicCast, resolveMagicCast, updateMpRegen
│   ├── inventory.js                 #   addMaterial, addResource, equipGear
│   ├── economy.js                   #   buyPotion, sellMaterial, forgeRing, forgeMaterial, forgeWeapon
│   ├── quest.js                     #   acceptMajorQuest, settleMajorQuest, updateQuestProgress
│   ├── npc.js                       #   talkOrUse, gift, rest, isNearAction
│   ├── npc-memory.js                #   npcMemoryFor, adjustNpcMemory
│   ├── dungeon.js                   #   enterDungeon, leaveDungeon, generateDungeon
│   ├── persistence.js               #   readSaveSlots, buildSaveRecord, commitSaveRecord
│   ├── session.js                   #   ensureSessionState, ownedByCurrentPlayer
│   └── game-flow.js                 #   startNewGame, startLoadedSave, saveCurrentGame
├── display/                         # Phaser renderers (Sprites, Graphics, Tweens)
│   ├── physics.js                   #   Arcade Physics bodies + colliders
│   ├── world.js                     #   syncEntityDisplay (Sprites per entity)
│   ├── effects.js                   #   syncWeaponDisplay, syncEffectsDisplay
│   ├── animations.js                #   triggerHitTween for hit reactions
│   └── …
├── scenes/                          # Phaser Scenes
│   ├── Boot.js
│   ├── Menu.js, Pause.js            #   Overlay scenes
│   ├── PanelScenes.js               #   Backpack/Quest/Shop/Forge/Magic scenes
│   ├── Game.js                      #   Main world scene (≤250 lines)
│   └── game-scene-helpers.js        #   installInputs / installButtonHandlers / installKeyBindings
└── ui/                              # HTML panel renderers (innerHTML strings)
    ├── stats.js, gear.js            #   Bus-subscribed sidebar
    ├── log.js, toast.js             #   Bus-subscribed bottom UI
    ├── backpack/quest/shop/forge/magic.js
    ├── panels-helpers.js            #   shared HTML factories
    ├── dom-chrome.js                #   applyLanguage, resetRuntimeUi
    └── wire.js                      #   menu click router
```

## Testing strategy

Two layers:

1. **Unit tests** — pure-function logic, run in Node via Vitest:
   - `npm run test:unit` — runs `src/**/*.test.js` (e.g. `src/domain/math.test.js`)
   - Fast (~500ms), no browser, no Phaser. Use for math, formulas, parsers.

2. **E2E probes** — full game running in real Chromium via Playwright:
   - `npm test` runs every probe sequentially via `test/run-all.mjs`
   - Probes drive UI + verify state via `window.__state`, `__runtime`, `__api` (DEV-only diagnostic hooks)
   - **Critical**: use `window.__api.spawnCreature` (real API), not bare `state.entities.push()` — bare pushes skip template hydration and miss bugs

E2E probe checklist:
- `probe-comprehensive.mjs` (21) — boot/race/panels/persistence/i18n
- `probe-e2e.mjs` (14) — gameplay integration
- `probe-deep.mjs` (16) — domain APIs
- `probe-ui-flows.mjs` (15) — button clicks
- `probe-combat-checklist.mjs` (24) — combat/AI/damage/quest/magic; pauses game scene to remove timing nondeterminism
- `probe-live-combat.mjs` (4) — live-play, no scene pause, uses real `spawnCreature` API
- `probe-weapons.mjs` (5) — every weapon equip + attack path (catches per-weapon-type bugs like the bow `clearCd` crash)
- `probe-playthrough.mjs` — 25s random play, asserts zero runtime errors

Adding a new feature ⇒ add a test in the matching probe (or new probe). Test runs through `npm test`. CI gate: 0 console errors + 0 failures.

## Engine-native features in use

| Concern | Solution |
|---|---|
| State container | `runtime/state.js` singleton + Phaser DataManager mirror |
| Modal panels | Each panel is its own Phaser Scene (parallel overlay) — see `PanelScenes.js` |
| Inputs | `runtime/input.js` wraps Phaser keyboard/pointer plugins |
| Cooldowns | `startCooldown` uses Phaser Tween for linear countdown |
| Periodic events | `schedulePeriodic` / `scheduleOnce` use Phaser TimerEvents |
| Hit reactions | Color/position Tweens in `display/animations.js` |
| Cross-scene events | `runtime/events.js` Phaser EventEmitter bus |
| Physics | Arcade Physics for player/entity/pet bodies + map+building colliders |

## Common bugs found & lessons

- **Pixel→tile→pixel round trip** caused weapon jitter during movement.
  Fix: read body's pixel position directly (`D.playerCircle.x`), never via `state.player.x * tile`.
- **`clearCd is not defined`** in bow.js — a helper used by sword combat (`actions.js`) but never imported into the bow weapon path. Per-weapon probe (`probe-weapons.mjs`) now exercises every weapon type.
- **Main menu div covered the canvas** after race selection — `wire.js` was re-rendering after `startNewGame` even though the MenuScene had closed. Fix: skip re-render for `startRace`/`continue`/`loadSelected` actions.
- **`isPlaying()` returned false at scene-start** — `runtime.pSceneRef.scene.isActive('MenuScene')` returns false during MenuScene's own create(). Fix: predicate checks the explicit `uiState.appMode` first, falls back to scene state.

## Recommended third-party libraries (post-MVP)

For a Phaser RPG, the following packages would simplify development further:

- **phaser3-rex-plugins** — production-grade UI widgets (Dialog, ScrollablePanel, ToggleSwitch, Slider). Replaces custom HTML modal code with engine-native widgets.
- **localforage** — drop-in async wrapper over localStorage that falls back to IndexedDB. Eliminates the 5 MB quota cliff for save slots.
- **nanoid** — replace ad-hoc `makeRuntimeId` with collision-resistant ID generator.
- **zod** — runtime schema validation when loading save records (catches schema drift).
- **@vitest/coverage-v8** — coverage reports for unit tests.
- **eslint + @eslint/js + globals** — catch import errors at lint time (would have caught `clearCd is not defined` in CI).

## How to run

```bash
npm install
npm run dev                   # vite dev server at http://localhost:5173
npm run dev -- --port 5174    # E2E probes expect this port
npm run build                 # production bundle
npm test                      # E2E probes (9 suites)
npm run test:unit             # vitest unit tests
npm run lint                  # ESLint — catches undefined identifiers
```

## Player cooldowns are auto-decayed accessor properties

**Don't write `state.player.invuln = N` thinking it freezes — and don't try to
"protect" it with `Math.max(current, N)`.** `state.player.invuln` and the other
fields listed in `runtime/player-cooldowns.js > PLAYER_COOLDOWN_FIELDS` are
**accessor properties** installed at game boot:

- `get` reads from a hidden `__cd_<field>` slot.
- `set` writes the slot.
- `tickPlayerCooldowns(dt)` decays every slot once per frame in `GameScene.update()`.

So `state.player.invuln = 0.34` is the entire API. The value will tick to 0
automatically. The old `cd()` / `clearCd()` wrappers still exist as semantic
sugar but they just write the property.

If you ever need to add another player-side cooldown field, **only add it to
`PLAYER_COOLDOWN_FIELDS`** — no other registration needed.

`installPlayerCooldowns(state.player)` must be called after every state
restore that goes through `replaceObject(state, …)`, because that helper
deletes accessors. This is wired into `resetGameState`, `startLoadedSave`,
and the GameScene boot.

## One-shot debug dumps

```
npm run test:dump            # dodge + wolves + save-load scenarios
npm run test:dump dodge      # one scenario
```

Writes everything to `test-output/`:

- `report.json` — per-scenario state snapshots (HP, cooldowns, positions)
- `browser-console.log` — every browser console message
- `errors.log` — just the errors
- `invariants.log` — just the `[invariant]` warnings
- `ingame-debug.log` — the structured-log timeline
- `*.png` — per-scenario screenshots

Don't run multiple probes by hand. Run `npm run test:dump`, read the folder.

## Logging (debug + ring buffer)

`runtime/log.js` wraps the `debug` npm package. **All gameplay logging goes
through it** — no ad-hoc `console.log` in domain/scene code.

Use:

```js
import { log, NS } from '../runtime/log.js';
log(NS.COMBAT_PLAYER_HURT, 'hp %d->%d src=%s', before, after, source?.name);
```

The `NS` table is the canonical namespace tree (see `runtime/log.js` top).
Adding a new line ⇒ pick an existing namespace OR add a new key there with a
one-line comment. Don't free-form namespaces.

Levels are encoded as the namespace's last segment:
- `:trace` — per-frame events (AI tick, position sync). Disabled by default.
- `:event` — user/system actions (attack fired, damage taken, panel opened).
- `:warn`  — recoverable surprise.
- `:error` — broken invariant / caught throw.

Toggle at runtime (no rebuild):
```js
localStorage.debug = 'overfantasy:*'           // everything
localStorage.debug = 'overfantasy:combat:*'    // combat only
localStorage.debug = 'overfantasy:*:event,overfantasy:*:warn,overfantasy:*:error'  // default
```

Even when a namespace is disabled in `debug`, the call still pushes to an
**in-memory ring buffer** (last 500 entries). Dev hooks:
- `window.__dumpLogs(n)` returns the last `n` entries as a paste-friendly string.
- `window.__clearLogs()` resets the buffer.
- `window.__setLogPattern(pattern)` toggles patterns without touching localStorage.
- **F3 in-game** copies the recent log dump to clipboard — paste it into support.
- **F2 in-game** toggles the live debug HUD overlay.
