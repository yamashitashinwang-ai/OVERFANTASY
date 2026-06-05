# OVERFANTASY Project Audit

Last updated: 2026-06-05

This document is the current-state inventory for the game codebase. It is meant to
separate the active source of truth from migration-era notes, generated output,
and temporary test artifacts.

## Scope

Included in this audit:

- `src/` game source
- `test/` browser/runtime probes
- root project config and project documentation

Excluded from source organization:

- `node_modules/` third-party dependencies
- `dist/` Vite build output
- `test-output/` probe artifacts
- `.git/`, `.codegraph/`, `.omx/`

These generated and tool directories are already ignored by `.gitignore`.

## Current Git State

The repository is on `codex/proficiency-mvp`.

There are active uncommitted source and test changes. They should not be
discarded during cleanup because they include recent player rig, input, magic,
combat readability, proficiency MVP, character status panel, and regression-test
work.

Current changed areas:

- `src/display/`: player rig, collision/debug display, world/effect rendering,
  animation tests
- `src/domain/`: AI, combat, magic, death, world, i18n, player, dungeon, type
  definitions, regression tests
- `src/runtime/`: input, state, invariant, and structured log handling
- `src/scenes/`: panel, pause, split game-scene helpers, and scene lifecycle behavior
- `src/ui/`: backpack, menus, forge, magic, split panel helpers, quest, and shop UI behavior
- `src/styles/`: split UI style modules imported by `src/styles.css`
- `src/data/`: split static game catalog modules and static data integrity coverage
- `test/`: browser/runtime probes, including weapon coverage isolation, magic UI pointer isolation, and deterministic forge coverage

Untracked but relevant test/source files currently present:

- `src/data.test.ts`
- `src/data-bestiary.test.ts`
- `src/data-forge.test.ts`
- `src/data-gear.test.ts`
- `src/data-magic.test.ts`
- `src/data-quests.test.ts`
- `src/data-world.test.ts`
- `src/data/`
- `src/domain/ai.test.ts`
- `src/domain/ai-pets.test.ts`
- `src/domain/ai-entities.test.ts`
- `src/domain/ai.test-fixtures.ts`
- `src/domain/ai/`
- `src/domain/combat/damage.test.ts`
- `src/domain/combat/damage-pets.test.ts`
- `src/domain/combat/damage-loot.test.ts`
- `src/domain/combat/damage.test-fixtures.ts`
- `src/domain/combat/visual-events.test.ts`
- `src/domain/combat/bow-firing.test.ts`
- `src/domain/combat/damage/`
- `src/domain/combat/bow/`
- `src/domain/combat/actions/`
- `src/domain/persistence-slots.test.ts`
- `src/domain/persistence-time.test.ts`
- `src/domain/persistence.test-fixtures.ts`
- `src/domain/persistence.test.ts`
- `src/domain/persistence/`
- `src/domain/i18n.test.ts`
- `src/domain/i18n/`
- `src/domain/i18n/catalog/`
- `src/domain/inventory.test.ts`
- `src/domain/inventory-gear.test.ts`
- `src/domain/inventory-pets.test.ts`
- `src/domain/inventory.test-fixtures.ts`
- `src/domain/inventory/`
- `src/ui/magic-panel-input.test.ts`
- `src/ui/panels-helpers.test.ts`
- `src/ui/panels-helpers/`
- `src/ui/backpack/`
- `src/ui/menus/`
- `src/ui/quest/`
- `src/ui/forge/`
- `src/ui/shop/`
- `src/ui/magic/`
- `src/ui/gear/`
- `src/ui/stats/`
- `src/display/animations.test.ts`
- `src/display/animations/`
- `src/display/collision-debug/`
- `src/display/debug-hud/`
- `src/display/hud/`
- `src/display/placeholder-art/`
- `src/display/placeholder-art/actors/`
- `src/display/placeholder-art/player/`
- `src/display/effects/`
- `src/display/player-rig/`
- `src/display/player-rig/pose/`
- `src/display/runtime/`
- `src/display/world/`
- `src/display/world/player/`
- `src/domain/combat/targeting/`
- `src/domain/corruption/`
- `src/domain/economy.test.ts`
- `src/domain/economy-commerce.test.ts`
- `src/domain/economy-forge.test.ts`
- `src/domain/economy.test-fixtures.ts`
- `src/domain/economy/`
- `src/domain/facing/`
- `src/domain/magic-casting.ts`
- `src/domain/magic-casting.test.ts`
- `src/domain/magic-casting/`
- `src/domain/death-corruption-fatigue.test.ts`
- `src/domain/death-inventory-loss.test.ts`
- `src/domain/death.test-fixtures.ts`
- `src/domain/death/`
- `src/domain/lost-packages.test.ts`
- `src/domain/lost-packages/`
- `src/domain/portal-fallback.test.ts`
- `src/domain/portal.test-fixtures.ts`
- `src/domain/portal/`
- `src/domain/teleport.test.ts`
- `src/domain/teleport/`
- `src/domain/math/`
- `src/domain/npc-object-use-panel-actions.test.ts`
- `src/domain/npc-panel-actions.test.ts`
- `src/domain/npc-memory.test.ts`
- `src/domain/npc-memory-ownership.test.ts`
- `src/domain/npc-memory-pets.test.ts`
- `src/domain/npc-memory.test-fixtures.ts`
- `src/domain/npc-memory/`
- `src/domain/dungeon/`
- `src/domain/dungeon.test.ts`
- `src/domain/dungeon-display.test.ts`
- `src/domain/world.test.ts`
- `src/domain/world/`
- `src/domain/world-spawn.test.ts`
- `src/domain/world-spawn/`
- `src/domain/game-flow/`
- `src/domain/game-flow.test.ts`
- `src/domain/game-flow-display.test.ts`
- `src/domain/game-flow-ui-boundary.test.ts`
- `src/domain/session.test.ts`
- `src/domain/session/`
- `src/scenes/panels/`
- `src/scenes/game-scene-helpers/`
- `src/scenes/game-scene/`
- `src/domain/magic.test.ts`
- `src/domain/magic/`
- `src/domain/magic-input.test.ts`
- `src/domain/magic-input/`
- `src/domain/map-exits.test.ts`
- `src/domain/map-exits/`
- `src/domain/npc.test.ts`
- `src/domain/npc/`
- `src/domain/player/`
- `src/domain/player.test.ts`
- `src/domain/quest-major.test.ts`
- `src/domain/quest-small.test.ts`
- `src/domain/quest.test-fixtures.ts`
- `src/domain/quest.test.ts`
- `src/domain/quest/`
- `src/domain/types.test.ts`
- `src/domain/types/`
- `src/runtime/input.test.ts`
- `src/runtime/input/`
- `src/runtime/invariants.test.ts`
- `src/runtime/invariants/`
- `src/runtime/log.test.ts`
- `src/runtime/log/`
- `src/runtime/state.test.ts`
- `src/runtime/state/`
- `src/runtime/actor-movement.ts`
- `src/runtime/browser-storage.ts`
- `src/runtime/browser-storage.test.ts`
- `src/runtime/actor-movement.test.ts`
- `src/runtime/display-sync.ts`
- `src/runtime/display-sync.test.ts`
- `src/runtime/game-flow-ui.ts`
- `src/styles/modal-panels/`
- `src/styles/sidebar/`
- `src/test-support/`
- `test/probe-combat-checklist/`
- `test/probe-comprehensive/`
- `test/probe-deep/`
- `test/probe-dump/`
- `test/probe-e2e/`
- `test/probe-live-combat/`
- `test/probe-portal-runtime/`
- `test/probe-ui-flows/`
- `test/probe-weapons/`

## File Inventory

Source and test scope:

| Area | File count |
|---|---:|
| `src/` root files | 10 |
| `src/data/` | 13 |
| `src/display/` | 99 |
| `src/domain/` | 250 |
| `src/runtime/` | 51 |
| `src/scenes/` | 26 |
| `src/styles/` | 18 |
| `src/ui/` | 45 |
| `src/test-support/` | 1 |
| `test/` | 69 |

Total in `src/` + `test/`: 583 files, 24,138 lines.

Test-like files: 165 (`*.test.ts`, `*.test-fixtures.ts`, plus probe scripts/modules).

Largest current source/test files:

| File | Lines | Note |
|---|---:|---|
| `src/display/player-rig/pose/solver.ts` | 162 | pure segmented player rig pose solver |
| `src/domain/magic.test.ts` | 154 | magic cast MP drain, interruption, and effect event regression coverage |
| `src/display/physics.ts` | 153 | display physics/collider setup and runtime actor movement/body teleport registration |
| `src/domain/types/catalog.ts` | 150 | shared static catalog type definitions |
| `src/scenes/panels/ModalPanelScene.ts` | 145 | shared DOM-backed modal panel scene base |
| `src/display/animations.test.ts` | 145 | animation event listener and magic cast visual regression coverage |
| `src/domain/types/actors.ts` | 141 | shared actor and movement type definitions |
| `src/scenes/panels/ModalPanelScene.test-fixtures.ts` | 136 | shared modal panel test fixtures |
| `src/display/particles/spell-spawners.ts` | 130 | spell-specific particle spawners |
| `src/display/placeholder-art/player/humanoid.ts` | 128 | generated humanoid placeholder art |
| `src/domain/combat/targeting/spec.ts` | 126 | combat targeting shape specifications |
| `src/display/placeholder-art/objects.ts` | 126 | generated object placeholder art |
| `src/scenes/Game.ts` | 119 | main Phaser scene lifecycle facade |
| `src/runtime/state/game-state.ts` | 113 | serializable game-state shape and initial state |
| `src/runtime/input-pointer.test.ts` | 110 | pointer cleanup and canvas focus regression coverage |
| `src/domain/magic/casting.ts` | 110 | magic casting lifecycle and MP drain/interruption |
| `src/runtime/input.test.ts` | 108 | movement-key tracking and modal input regression coverage |
| `src/domain/corruption.test.ts` | 107 | corruption-state regression coverage |
| `src/domain/combat/targeting/score.ts` | 107 | attack target scoring and nearest-target selection |
| `test/probe-live-combat/scenarios.ts` | 107 | live combat probe scenario steps |

## Runtime Organization

Current entry points:

- `src/main.ts`: Phaser game boot/config.
- `src/scenes/Game.ts`: main world scene lifecycle. This file stays small and
  delegates dev tooling, bus subscriptions, frame update, input, world timers,
  and modal helpers to scene modules.
- `src/scenes/PanelScenes.ts`: compatibility facade for modal panel scenes.
- `src/scenes/game-scene-helpers.ts`: compatibility facade for gameplay-scene
  helper modules.
- `src/scenes/game-scene/`: GameScene devtools hook, bus subscriptions, and
  per-frame update pipeline.
- `src/scenes/game-scene-helpers/`: aim math, world timers, pause/menu glue,
  modal gates, pointer inputs, sidebar buttons, and keyboard bindings.
- `src/scenes/panels/`: modal panel scene base plus backpack, quest, shop,
  forge, and magic scene wrappers.

Core layers:

- `src/data.ts`: compatibility facade for static game catalog modules.
- `src/data/`: split static catalog modules for world labels, bestiary, gear,
  materials, resources, forge recipes, pets, magic, quests, and grave constants.
- `src/domain/`: game rules, i18n text services, and state transitions. Current
  reality is stateful-domain modules that read/write `runtime/state.ts`.
- `src/runtime/`: global state facade and split state modules, event bus,
  input, services, timers, registry, autosave, browser-storage access, panel actions, game-flow UI sync adapters.
- `src/test-support/`: shared unit-test fixtures that are not owned by a
  production layer, currently the shared Phaser mock fixture.
- `src/display/`: Phaser visuals, physics bodies, player rig, HUD, debug
  overlays, generated placeholder art, effects, particles.
- `src/scenes/`: Phaser Scene lifecycle, split game-scene helpers, and
  cross-scene coordination.
- `src/ui/`: DOM/HTML panel rendering, split panel helper/menu/backpack modules, and UI action handlers.

## Static Data Inventory

`src/data.ts` exports the static `DATA` catalog as a compatibility facade over
`src/data/` modules. The assembled catalog currently contains:

| Catalog | Count |
|---|---:|
| regions | 11 |
| bestiary entries | 8 |
| gear entries | 39 |
| material entries | 15 |
| resource entries | 12 |
| weapon forge recipe groups | 5 |
| pet entries | 2 |
| magic entries | 5 |
| quest entries | 2 |

Top-level static data keys:

- `regions`
- `colors`
- `sceneNames`
- `bestiary`
- `gearCatalog`
- `materialCatalog`
- `resourceCatalog`
- `weaponForgeCatalog`
- `petCatalog`
- `magicCatalog`
- `questCatalog`
- `graveDecayInterval`
- `graveMaxDecay`

## Mutable State Inventory

`src/runtime/state.ts` owns the mutable game state and runtime-only references.

Persistent-ish game state includes:

- schema/session/settings
- current mode, scene, time clocks, toast/spawn/news timers
- shrine, lost package, death, and respawn state
- player state
- current map, solids, entities, pets, pet remains
- quests, NPC memory, objects, pickups, dungeon state

Runtime-only references include:

- Phaser scene reference
- input key handles
- aim/facing state
- attack effect, bow charge, pending magic cast
- hit stop timer

`src/runtime/state.ts` remains the compatibility facade for these exports; the
implementation now lives under `src/runtime/state/` by responsibility.

Important boundary: visual sprites and rig parts are not collision authority.
Player movement and collision should remain tied to the existing physics body /
movement state, not sprite dimensions.

## Current Architecture Reality

`ARCHITECTURE.md` has been updated to describe the current pragmatic
stateful-service architecture instead of the older migration target. The current
accepted reality is:

- `runtime/state.ts` owns the central mutable state.
- Many `domain/` modules import and mutate runtime state directly.
- Scenes orchestrate frame flow and Phaser lifecycle.
- Display modules reconcile Phaser GameObjects to state.
- UI modules render DOM panels from state and dispatch actions.

Dependency-boundary audit status:

- A 2026-06-03 production-source scan found no direct `src/domain` imports of
  `src/display` or `src/ui`. Domain code still uses runtime adapters such as
  `runtime/display-sync.ts`, `runtime/game-flow-ui.ts`, `runtime/panel-actions.ts`,
  and `runtime/ui-state.ts`.
- Scenes remain the intended bridge to display and DOM UI modules.
- Display/UI modules may import domain/runtime state to render current state, but
  gameplay collision and state transitions should remain outside sprite/DOM
  ownership.

Do not attempt a full dependency inversion in one large pass. Keep moving
side-effect edges behind runtime events or service adapters only when touching
the related feature.

## Validation Entrypoints

Package scripts:

- `npm run typecheck`: TypeScript compile check.
- `npm run test:unit`: Vitest unit/regression tests under `src/**/*.test.ts`.
- `npm run build`: Vite production build.
- `npm run lint`: ESLint over `src` and `test`; currently configured to warn on
  unused variables and prefer-const rather than fail on style.
- `npm test`: sequential Playwright/runtime probe runner. It expects a dev
  server to already be running and uses `PROBE_BASE_URL`.

Probe runner:

- `test/run-all.ts` runs 11 browser/runtime suites, including UI flows, combat,
  portals, live combat, invariants, dodge regression, and random play stress.
- `test/probe-combat-checklist.ts` is now a small ordered runner over
  `test/probe-combat-checklist/` groups for enemy AI, player damage/death,
  movement/world, pet/loot, magic/quest, and world-system checks.
- `test/probe-ui-flows.ts` is now a small ordered runner over
  `test/probe-ui-flows/` groups for forge, shop, backpack, magic, and quest
  click-through checks.
- `test/probe-e2e.ts` is now a small ordered runner over `test/probe-e2e/`
  groups for boot/new-game, gameplay, backpack, panels, persistence, and i18n
  checks.
- `test/probe-deep.ts` is now a small ordered runner over `test/probe-deep/`
  groups for economy/material APIs, progression/magic APIs, and world/combat/NPC
  API checks.
- `test/probe-weapons.ts` is now a small ordered runner over
  `test/probe-weapons/` groups for weapon cases, attack path checks, catalog
  equip checks, and bow charge/release checks.

Current validation snapshot:

- `npm run typecheck`: passed.
- `npm run test:unit`: passed, 82 test files / 244 tests.
- `npm run build`: passed. Vite still reports the existing large chunk warning.
- `npm run lint`: passed with 0 errors and 0 warnings.
- `PROBE_BASE_URL=http://150.65.181.206:5175/ npm test`: passed, 11 runtime
  probe suites, 21 checks reported by the runner, 0 failures.
- `PROBE_BASE_URL=http://150.65.181.206:5175/ ./node_modules/.bin/tsx test/probe-comprehensive.ts`:
  passed after splitting the comprehensive phase modules, 21/21 checks.
- `PROBE_BASE_URL=http://150.65.181.206:5175/ ./node_modules/.bin/tsx test/probe-combat-checklist.ts`:
  passed, 24/24 checklist checks after splitting the movement/world checks.
- `PROBE_BASE_URL=http://150.65.181.206:5175/ ./node_modules/.bin/tsx test/probe-ui-flows.ts`:
  passed, 0 UI flow failures after splitting the panel click-through probe.
- `PROBE_BASE_URL=http://150.65.181.206:5175/ ./node_modules/.bin/tsx test/probe-e2e.ts`:
  passed, 0 E2E failures after splitting the E2E harness helpers.
- `PROBE_BASE_URL=http://150.65.181.206:5175/ ./node_modules/.bin/tsx test/probe-deep.ts`:
  passed, 0 domain API probe failures after splitting the deep probe.
- `PROBE_BASE_URL=http://150.65.181.206:5175/ ./node_modules/.bin/tsx test/probe-weapons.ts`:
  passed, 5/5 weapon checks after splitting the weapon probe.
- `PROBE_BASE_URL=http://150.65.181.206:5175/ ./node_modules/.bin/tsx test/probe-dump.ts dodge`:
  passed after splitting the dump probe, with 0 console errors and 0 invariant breaks.
- `PROBE_BASE_URL=http://150.65.181.206:5175/ ./node_modules/.bin/tsx test/probe-live-combat.ts`:
  passed after splitting the live combat probe, 4/4 live-play checks.
- `PROBE_BASE_URL=http://150.65.181.206:5175/ ./node_modules/.bin/tsx test/probe-portal-runtime.ts`:
  passed after splitting the portal runtime probe.

Remote development note:

- When sharing URLs, use `http://150.65.181.206:<port>/`, never
  `localhost` or `127.0.0.1`.

## Organization Backlog

Recommended low-risk order:

1. Keep active uncommitted gameplay/visual/test work intact until it is
   committed or intentionally split.
2. Add or keep focused regression tests for every current behavior fix before
   refactoring nearby code.
3. Split `src/display/placeholder-art.ts` by generated asset family. Done on
   2026-06-01: the compatibility facade now delegates to `placeholder-art/`
   modules for keys, player parts, actors, objects, tiles, texture helpers,
   and shared types.
4. Split `src/display/world.ts` by sync target. Done on 2026-06-02:
   `world.ts` is now a compatibility facade, with player/camera, entities,
   objects, pickups, pets/remains/HP bars, and shared body helpers under
   `src/display/world/`.
5. Split `src/domain/types.ts` into catalog, actor/state, runtime, combat, and
   UI-facing type groups. Done on 2026-06-02: `types.ts` is now a compatibility
   facade over `src/domain/types/` modules for common, catalog, actors, world,
   death, quests, session, game-state, combat, and runtime types.
6. Split `src/styles.css` by UI surface. Done on 2026-06-02:
   the original stylesheet is now an import facade for base, game shell,
   sidebar, modal panels, menus, log, and responsive CSS modules under
   `src/styles/`.
7. Split `src/display/player-rig.ts` by responsibility. Done on 2026-06-02:
   the compatibility facade now delegates to `player-rig/types.ts`,
   `constants.ts`, `pose.ts`, and `container.ts`, keeping the pure pose solver
   separate from Phaser Container wiring.
8. Split `src/display/effects.ts` by effect family. Done on 2026-06-02:
   the compatibility facade now delegates to `effects/shapes.ts`, `anchors.ts`,
   `weapon.ts`, `arrows.ts`, `attack.ts`, `magic.ts`, and `scene-effects.ts`,
   separating reusable Graphics primitives from weapon, projectile, attack, and
   magic rendering.
9. Split `src/domain/corruption.ts` by corruption-state responsibility. Done on
   2026-06-02: the compatibility facade now delegates to `corruption/constants.ts`,
   `state.ts`, `sources.ts`, `gain.ts`, `choice.ts`, `shrine.ts`, `rampage.ts`,
   and `tick.ts`, keeping shrine load, rampage, monster-source, and choice flows
   separated without changing public imports.
10. Split `src/domain/npc.ts` by NPC interaction responsibility. Done on
   2026-06-02: the compatibility facade now delegates to `npc/spatial.ts`,
   `conversation.ts`, `services.ts`, `pet-rescue.ts`, `object-use.ts`,
   `panels.ts`, `talk.ts`, and `world-news.ts`, keeping service actions,
   object use, quest panel launching, pet rescue, and world news isolated.
11. Split `src/display/animations.ts` by visual feedback responsibility. Done
   on 2026-06-02: the compatibility facade now delegates to
   `animations/action-state.ts`, `timing.ts`, `player.ts`, `magic-cast.ts`,
   `npc.ts`, `hit-tween.ts`, `feedback.ts`, and `types.ts`, keeping player
   actions, magic cast visuals, NPC reactions, and damage hit tweens separate.
12. Split `src/display/collision-debug.ts` by F4 debug overlay responsibility.
   Done on 2026-06-02: the compatibility facade now delegates to
   `collision-debug/geometry.ts`, `attack-zones.ts`, `mounts.ts`,
   `world-overlays.ts`, and `lifecycle.ts`, separating body/marker drawing,
   attack-zone visualization, player rig mount markers, world ranges, and F4
   toggle lifecycle.
13. Split `src/domain/combat/targeting.ts` by combat targeting responsibility.
   Done on 2026-06-02: the compatibility facade now delegates to
   `targeting/proximity.ts`, `spec.ts`, `score.ts`, `effects.ts`, `filters.ts`,
   and `types.ts`, keeping entity search, attack hit-zone generation, target
   scoring, attack-effect state, and world-action gates separate.
14. Split `src/domain/magic.ts` by magic-system responsibility. Done on
   2026-06-02: the compatibility facade now delegates to `magic/knowledge.ts`,
   `targets.ts`, `effects.ts`, `casting.ts`, and `mp.ts`, keeping spell clues
   and learning, target selection, magic effect ticks, chant/resolve flow, and
   MP regeneration separate.
15. Split `src/domain/death.ts` by death-system responsibility. Done on
   2026-06-02: the compatibility facade now delegates to `death/fatigue.ts`,
   `inventory-loss.ts`, `package-position.ts`, and `process.ts`, keeping death
   fatigue normalization, inventory loss rolls, lost-package placement, and the
   top-level respawn/corruption flow separate.
16. Split `src/domain/world.ts` by world-state responsibility. Done on
   2026-06-02: the compatibility facade now delegates to `world/map.ts`,
   `regions.ts`, `objects.ts`, `entities.ts`, `pickups.ts`, and `constants.ts`,
   keeping tile generation/querying, region labels, portals/objects, entity
   factories, and pickup factories separate. `src/domain/world.test.ts` now
   guards facade export wiring for these split modules.
17. Update `ARCHITECTURE.md` to describe the current stateful-service
   architecture. Done on 2026-06-02: the document now treats direct domain
   access to `runtime/state.ts` as current reality, describes Phaser scene and
   display/UI responsibilities, and records remaining dependency-boundary debt.
18. Split `src/scenes/PanelScenes.ts` by modal panel scene responsibility. Done
   on 2026-06-02: the compatibility facade now re-exports panel scenes from
   `scenes/panels/`, keeping shared lifecycle/input isolation in
   `ModalPanelScene.ts` and Backpack, Quest, Shop, Forge, and Magic actions in
   their own scene files.
19. Split `src/data.ts` by static catalog responsibility. Done on 2026-06-02:
   the compatibility facade now assembles catalog modules from `src/data/`; the
   static data test files verify counts, initial gear references, forge recipes,
   drop references, quest templates, pet contracts, grave decay timing,
   and magic alias/reference integrity.
20. Split `src/domain/i18n.ts` by i18n responsibility. Done on 2026-06-02:
   the compatibility facade now delegates to `i18n/options.ts`, `catalog.ts`,
   and `storage.ts`; `src/domain/i18n.test.ts` verifies language catalog key
   alignment, fallback behavior, storage reads, and language-change events.
21. Split `src/ui/panels-helpers.ts` by panel helper responsibility. Done on
   2026-06-02: the compatibility facade now delegates to
   `panels-helpers/shared.ts`, `backpack.ts`, `forge.ts`, `commerce.ts`,
   `magic.ts`, `quest.ts`, and `gear.ts`; `src/ui/panels-helpers.test.ts`
   verifies representative header, backpack, forge, magic, and quest helper
   output.
22. Split `src/scenes/game-scene-helpers.ts` by gameplay scene helper
   responsibility. Done on 2026-06-02: the compatibility facade now delegates
   to `game-scene-helpers/aim.ts`, `world.ts`, `pause.ts`, `modal-gates.ts`,
   `pointer.ts`, `buttons.ts`, and `keyboard.ts`, keeping aim math, world
   timers, pause glue, modal blocking, pointer inputs, sidebar buttons, and
   keyboard bindings separated without changing public imports.
23. Split `src/scenes/Game.ts` by main-scene responsibility. Done on
   2026-06-02: the Scene class now owns Phaser lifecycle orchestration while
   `game-scene/devtools.ts`, `bus-handlers.ts`, and `frame.ts` own the dev
   window API hook, pause/language bus subscriptions, and per-frame gameplay
   update pipeline.
24. Split `src/domain/game-flow.ts` by lifecycle responsibility. Done on
   2026-06-02: the compatibility facade now delegates to
   `game-flow/shape.ts`, `save.ts`, `reset.ts`, and `session.ts`, keeping old
   save/state-shape migration, autosave, new-game reset, load/continue, and
   delete-save flows separated without changing public imports.
   `src/domain/game-flow.test.ts` now guards stable facade export wiring
   without executing reset, save, load, or delete flows.
25. Split `src/domain/world-spawn.ts` by map population responsibility. Done on
   2026-06-02: the compatibility facade now delegates to per-scene modules under
   `domain/world-spawn/` plus shared environment-object helpers, keeping map
   portals, NPCs, creatures, pickups, and decoration placement independently
   reviewable without changing `spawnWorld(scene)`. `src/domain/world-spawn.test.ts`
   now guards mocked dispatch, collection clearing, and lost-package pickup sync
   without invoking concrete map population.
26. Split `src/domain/inventory.ts` by inventory responsibility. Done on
   2026-06-02: the compatibility facade now delegates to
   `inventory/materials.ts`, `pets.ts`, and `gear.ts`, keeping material/resource
   accounting, pet adoption/recall, and gear bag/equip flows independently
   reviewable; `src/domain/inventory.test.ts` covers facade behavior.
27. Split `src/domain/quest.ts` by quest responsibility. Done on 2026-06-02:
   the compatibility facade now delegates to `quest/state.ts`, `rewards.ts`,
   `accept.ts`, `settlement.ts`, and `progress.ts`, keeping quest state/status,
   reward rolls/payouts, acceptance, settlement, and progress ticks independently
   reviewable; `src/domain/quest.test.ts` covers facade behavior.
28. Split `src/domain/economy.ts` by economy responsibility. Done on
   2026-06-02: the compatibility facade now delegates to `economy/formulae.ts`,
   `commerce.ts`, `shop.ts`, and `forge.ts`, keeping forge formulae/ingredients,
   material selling, shop transactions, and crafting execution independently
   reviewable; `src/domain/economy.test.ts` covers facade behavior.
29. Split `src/domain/facing.ts` by facing/mount responsibility. Done on
   2026-06-02: the compatibility facade now delegates to `facing/types.ts`,
   `directions.ts`, `mounts.ts`, and `animation.ts`, keeping direction math,
   static combat/visual mount data, and pose-aware right-hand weapon animation
   independently reviewable. Existing facing, player-rig, effect, and bow
   trajectory tests cover facade behavior.
30. Split `src/domain/ai.ts` by AI responsibility. Done on 2026-06-02:
   the compatibility facade now delegates to `ai/aggro.ts`, `pet-remains.ts`,
   `pets.ts`, and `entities.ts`, keeping pet aggro resolution, grave decay,
   pet guardian behavior, and entity targeting/attack behavior independently
   reviewable; aggro/remains, pet combat, and entity combat facade tests are
   split across focused AI test files.
31. Split `src/domain/combat/damage.ts` by damage-system responsibility. Done
   on 2026-06-02: the compatibility facade now delegates to
   `damage/feedback.ts`, `player.ts`, `pets.ts`, `loot.ts`, and `defeat.ts`,
   keeping hit feedback, player damage, pet damage/death, drop rolls, and
   entity defeat side effects independently reviewable; player damage, pet
   damage/death, and loot/defeat facade tests are split across focused damage
   test files.
32. Split `src/runtime/invariants.ts` by invariant-check responsibility. Done
   on 2026-06-02: the compatibility facade now delegates to
   `invariants/types.ts`, `memory.ts`, `recorder.ts`, and `checks.ts`, keeping
   violation storage, event/console recording, and concrete gameplay invariant
   checks independently reviewable; `src/runtime/invariants.test.ts` covers
   facade behavior.
33. Split `src/runtime/log.ts` by structured-log responsibility. Done on
   2026-06-02: the compatibility facade now delegates to `log/namespaces.ts`,
   `types.ts`, `buffer.ts`, `logger.ts`, and `pattern.ts`, keeping namespace
   definitions, ring-buffer dump formatting, debug logger caching, and runtime
   debug pattern helpers independently reviewable; `src/runtime/log.test.ts`
   covers facade behavior.
34. Split `src/domain/persistence.ts` by save-slot responsibility. Done on
   2026-06-02: the compatibility facade now delegates to
   `persistence/types.ts`, `storage.ts`, `metadata.ts`, and `records.ts`,
   keeping save record shape, localStorage fallback, metadata/time formatting,
   and slot CRUD independently reviewable; `src/domain/persistence.test.ts`
   covers facade behavior.
35. Split `src/runtime/input.ts` by input responsibility. Done on
   2026-06-02: the compatibility facade now delegates to `input/key-tracker.ts`,
   `movement.ts`, `pointer.ts`, `focus.ts`, and `actions.ts`, keeping held-key
   tracking, movement vector helpers, world pointer cleanup, game-canvas focus,
   and one-shot action/Esc routing independently reviewable;
   `src/runtime/input.test.ts` covers facade behavior.
36. Split `src/display/particles.ts` by particle-effect responsibility. Done on
   2026-06-02: the compatibility facade now delegates to
   `particles/textures.ts`, `lifecycle.ts`, `spell-spawners.ts`, and
   `dispatcher.ts`, keeping generated particle textures, emitter cleanup,
   spell-specific Phaser emitters, and magic-effect dispatch independently
   reviewable; `src/display/particles.test.ts` covers facade behavior.
37. Split `src/runtime/state.ts` by runtime-state responsibility. Done on
   2026-06-02: the compatibility facade now delegates to `state/runtime.ts`,
   `collections.ts`, `game-state.ts`, and `accessors.ts`, keeping runtime-only
   refs, append-only collections, serializable game state/snapshots, and legacy
   get/set shims independently reviewable; `src/runtime/state.test.ts` covers
   facade behavior.
38. Split `src/display/world/player.ts` by player-display responsibility. Done
   on 2026-06-02: the compatibility facade now delegates to
   `world/player/types.ts`, `motion.ts`, `camera.ts`, `facing.ts`, `aura.ts`,
   and `sync.ts`, keeping camera anchoring, motion detection, aim-facing sync,
   corruption aura drawing, and rig/sprite reconciliation independently
   reviewable. Existing `src/display/world-camera.test.ts` covers the exported
   camera and motion behavior.
39. Split `src/domain/i18n/catalog.ts` by language. Done on 2026-06-02: the
   compatibility facade now assembles `catalog/zh.ts`, `catalog/ja.ts`, and
   `catalog/en.ts`, keeping localized UI text independently reviewable while
   preserving the `uiText` export. Existing `src/domain/i18n.test.ts` verifies
   language option alignment, catalog key alignment, fallback behavior, storage,
   and language-change events.
40. Split `src/styles/modal-panels.css` by modal surface. Done on 2026-06-02:
   the compatibility stylesheet now imports `modal-panels/base.css`,
   `backpack.css`, `quest.css`, `trade.css`, `forge.css`, and `magic.css`,
   keeping shared modal framing, backpack, quest, trade/shop, forge, and magic
   input styles independently reviewable. Vite build verifies the import chain.
41. Split `src/display/placeholder-art/player.ts` by generated player art
   responsibility. Done on 2026-06-02: the compatibility facade now delegates
   to `player/geometry.ts`, `humanoid.ts`, and `rig-parts.ts`, keeping shared
   drawing geometry, full-frame low-head player placeholder art, and segmented
   rig part textures independently reviewable. Existing
   `src/display/placeholder-art.test.ts` verifies generated texture families.
42. Split `src/display/placeholder-art/actors.ts` by generated actor art
   family. Done on 2026-06-02: the compatibility facade now delegates to
   `actors/npc.ts`, `creatures.ts`, `monsters.ts`, and `pets.ts`, keeping NPC,
   friendly creature, monster, and pet placeholder drawing independently
   reviewable. Existing `src/display/placeholder-art.test.ts` verifies generated
   NPC, monster, pet, and object texture families.
43. Split `src/domain/combat/bow.ts` by bow-combat responsibility. Done on
   2026-06-02: the compatibility facade now delegates to `bow/stats.ts`,
   `charge.ts`, `firing.ts`, `hits.ts`, and `flight.ts`, keeping bow weapon
   checks/charge math, charge lifecycle, projectile creation, hit resolution,
   and arrow flight updates independently reviewable. Existing bow trajectory
   and targeting tests verify related facade behavior.
44. Split `src/domain/combat/actions.ts` by player combat action responsibility.
   Done on 2026-06-02: the compatibility facade now delegates to
   `actions/attack.ts`, `defense.ts`, and `feedback.ts`, keeping attack
   execution, defend/dodge verbs, and per-frame combat feedback ticking
   independently reviewable. Existing magic, player, targeting, and damage
   tests verify related facade behavior.
45. Split `src/display/player-rig/pose.ts` by pose-solver responsibility. Done
   on 2026-06-02: the compatibility facade now delegates to `pose/solver.ts`,
   `math.ts`, `joints.ts`, `transforms.ts`, `progress.ts`, and `facing.ts`,
   keeping vector helpers, joint placement, transform/depth generation,
   animation phase defaults, facing validation, and full pose assembly
   independently reviewable. Existing player-rig and animation timing tests
   verify the public pose behavior.
46. Split `src/display/runtime.ts` by shared-display-state responsibility. Done
   on 2026-06-02: the compatibility facade now delegates to `runtime/types.ts`
   and `runtime/state.ts`, keeping Phaser display-state shape/type definitions
   separate from the mutable display singleton initializer. Existing display
   particle, effects, player-rig, and world-camera tests verify related facade
   behavior.
47. Split `src/domain/dungeon.ts` by dungeon and scene-flow responsibility. Done
   on 2026-06-02: the compatibility facade now delegates to
   `dungeon/scene-flow.ts`, `generate.ts`, `spawns.ts`, and `display.ts`,
   keeping world/dungeon transitions, procedural dungeon layout creation,
   per-scene creature spawn tables, and display rebuild hooks independently
   reviewable. `src/domain/dungeon.test.ts` now guards the stable facade export
   wiring; existing portal, death, and AI tests verify adjacent domain behavior.
48. Split `src/styles/sidebar.css` by sidebar surface responsibility. Done on
   2026-06-02: the compatibility stylesheet now imports `sidebar/panel.css`,
   `stats.css`, `legend.css`, `actions.css`, and `gear.css`, keeping sidebar
   framing, stat tiles, map legend markers, action buttons, and gear/material
   controls independently reviewable. Vite build verifies the import chain.
49. Split `src/display/debug-hud.ts` by debug HUD responsibility. Done on
   2026-06-02: the compatibility facade now delegates to `debug-hud/init.ts`,
   `metrics.ts`, and `sync.ts`, keeping F2/F3 setup, combat event timestamps
   and AI tick counting, and per-frame text/color rendering independently
   reviewable. Existing display, runtime-log, and runtime-state tests verify
   adjacent facade behavior.
50. Split `src/display/hud.ts` by HUD surface responsibility. Done on
   2026-06-02: the compatibility facade now delegates to `hud/status.ts`,
   `bars.ts`, `exit-hint.ts`, `chant.ts`, and `sync.ts`, keeping area/weapon
   labels, HP/MP/stamina bars, dungeon exit visibility, magic chant progress,
   and the top-level sync orchestrator independently reviewable. Existing
   display, magic, and player tests verify adjacent facade behavior.
51. Split `src/ui/backpack.ts` by backpack UI responsibility. Done on
   2026-06-02: the compatibility facade now delegates to `backpack/render.ts`,
   `scene.ts`, `items.ts`, and `gear.ts`, keeping HTML rendering, modal scene
   toggling, consumable use, and equipment actions independently reviewable.
   Existing panel-helper, modal scene, input, and inventory tests verify adjacent
   facade behavior.
52. Split `src/ui/menus.ts` by menu UI responsibility. Done on 2026-06-02:
   the compatibility facade now delegates to `menus/save-slots.ts`, `views.ts`,
   `main.ts`, and `pause.ts`, keeping save-slot rows/actions, static submenu
   views, main-menu DOM sync, and pause-menu rendering independently reviewable.
53. Split `src/ui/quest.ts` by quest UI responsibility. Done on 2026-06-02:
   the compatibility facade now delegates to `quest/render.ts` and `scene.ts`,
   keeping current/guild/NPC quest HTML rendering separate from QuestScene
   launch, refresh, close, focus-restore, and close-handler registration.
54. Split `src/ui/forge.ts` by forge UI responsibility. Done on 2026-06-02:
   the compatibility facade now delegates to `forge/render.ts` and `scene.ts`,
   keeping ring/material/weapon forge HTML and refresh logic separate from
   ForgeScene launch, close, pause/resume, cache clearing, and focus restore.
55. Split `src/ui/shop.ts` by shop UI responsibility. Done on 2026-06-02:
   the compatibility facade now delegates to `shop/render.ts` and `scene.ts`,
   keeping buy/sell shop HTML and refresh logic separate from ShopScene launch,
   monster-form rejection, close, pause/resume, cache clearing, and focus restore.
56. Split `src/ui/magic.ts` by magic UI responsibility. Done on 2026-06-02:
   the compatibility facade now delegates to `magic/render.ts` and `scene.ts`,
   keeping study/book magic HTML, input focus, and refresh logic separate from
   MagicScene launch, close, pointer cleanup, pause/resume, cache clearing, and
   focus restore.
57. Split `src/ui/gear.ts` by gear-sidebar responsibility. Done on 2026-06-02:
   the compatibility facade now delegates to `gear/lifecycle.ts` and
   `gear/render.ts`, keeping sidebar event subscription/initial sync separate
   from equipment and material row HTML generation.
58. Split `src/ui/stats.ts` by stats-sidebar responsibility. Done on 2026-06-02:
   the compatibility facade now delegates to `stats/lifecycle.ts`,
   `stats/selectors.ts`, and `stats/render.ts`, keeping event subscription,
   state-derived stat row assembly, and DOM rendering independently reviewable.
59. Split `src/domain/magic-input.ts` by magic-input matching responsibility.
   Done on 2026-06-02: the compatibility facade now delegates to
   `magic-input/types.ts`, `normalize.ts`, `catalog.ts`, `forbidden.ts`, and
   `fuzzy.ts`, keeping spell catalog lookup, input normalization, forbidden
   phrase matching, and near-name fuzzy matching independently reviewable.
   `src/domain/magic-input.test.ts` now guards facade export wiring,
   normalization, alias lookup, forbidden matching, and near-name checks.
60. Split `src/domain/player.ts` by player-update responsibility. Done on
   2026-06-02: the compatibility facade now delegates to `player/pickups.ts`,
   `player/update.ts`, and `player/constants.ts`, keeping pickup resolution,
   per-frame movement/stamina updates, and sprint exhaustion thresholds separate.
61. Split `src/domain/map-exits.ts` by map-exit responsibility. Done on
   2026-06-02: the compatibility facade now delegates to `map-exits/types.ts`,
   `config.ts`, `paint.ts`, and `query.ts`, keeping exit data, path painting,
   zone lookup, and current-exit hit testing independently reviewable.
   `src/domain/map-exits.test.ts` now guards facade export wiring, config
   uniqueness/bounds, and lookup-helper alignment.
62. Keep generated output (`dist/`, `test-output/`) out of source review unless
   the user explicitly requests artifact inspection.
63. Split `src/scenes/panels/ModalPanelScene.test.ts` fixtures by modal-test
   responsibility. Done on 2026-06-02: the modal input-isolation tests now
   import `ModalPanelScene.test-fixtures.ts` for the fake panel scene, pointer
   state helpers, and fake Phaser input wiring, keeping the test cases focused
   on click and pointer/focus handoff behavior.
64. Split `src/domain/lost-packages.ts` by lost-package responsibility. Done
   on 2026-06-02: the compatibility facade now delegates to
   `lost-packages/contents.ts`, `normalize.ts`, `sync.ts`, `create.ts`, and
   `claim.ts`, keeping death-package content checks, persisted package
   normalization, scene pickup sync, package creation, and package recovery
   independently reviewable. `src/domain/lost-packages.test.ts` now guards
   facade export wiring and pure content-detection behavior.
65. Split `src/domain/portal.ts` by portal responsibility. Done on
   2026-06-02: the compatibility facade now delegates to `portal/types.ts`,
   `actions.ts`, and `spawns.ts`, keeping portal target typing, action
   encoding/parsing, scene spawn tables, and fallback spawn resolution
   independently reviewable.
66. Split `src/domain/math.ts` by pure utility responsibility. Done on
   2026-06-02: the compatibility facade now delegates to `math/numeric.ts`,
   `random.ts`, `geometry.ts`, `objects.ts`, and `html.ts`, keeping number
   formatting/clamping, random helpers, vector/geometry helpers, clone/replace
   helpers, and HTML escaping independently reviewable.
67. Split `src/domain/npc-memory.ts` by relationship-memory responsibility.
   Done on 2026-06-02: the compatibility facade now delegates to
   `npc-memory/types.ts`, `key.ts`, `ownership.ts`, `access.ts`, `adjust.ts`,
   and `pets.ts`, keeping subject typing, memory-key derivation, legacy memory
   migration, memory lookup, affection/devotion adjustment, and current-player
   pet filtering independently reviewable; `src/domain/npc-memory.test.ts`
   covers facade behavior.
68. Split `src/domain/teleport.ts` by teleport-flow responsibility. Done on
   2026-06-02: the compatibility facade now delegates to
   `teleport/constants.ts`, `target.ts`, `portal.ts`, and `map-exit.ts`,
   keeping portal cooldown, portal target extraction, scene transition
   execution, and map-exit auto-triggering independently reviewable.
   `src/domain/teleport.test.ts` now guards facade export wiring, cooldown
   shape, target-resolution priority, and portal spawn-table labels/fallback
   points without executing scene transitions.
69. Split `src/domain/magic-casting.ts` by magic-cast interruption
   responsibility. Done on 2026-06-02: the compatibility facade now delegates
   to `magic-casting/types.ts` and `interrupt.ts`, keeping interrupt reason
   typing separate from pending-cast cleanup, MP regen lock, cast visual cleanup,
   and interruption toasts. `src/domain/magic-casting.test.ts` now guards
   facade export wiring and the no-pending-cast empty interrupt path.
70. Split `src/domain/session.ts` by session/identity responsibility. Done on
   2026-06-02: the compatibility facade now delegates to
   `session/constants.ts`, `defaults.ts`, `ids.ts`, `current.ts`,
   `ownership.ts`, and `ensure.ts`, keeping stable local/world identifiers,
   default session shape, runtime ID creation, current identity lookup,
   ownership mutation, and session-state normalization independently reviewable;
   `src/domain/session.test.ts` covers facade behavior.
71. Expand static data integrity coverage. Done on 2026-06-02:
   the static data test files validate initial player gear references, unique
   gear names, weapon stat shape, forge category/type consistency, quest
   species/scene/reward references, normalized magic alias uniqueness, and
   grave decay timing constants in addition to the existing catalog count,
   drop, pet, and magic checks.
72. Split `test/probe-combat-checklist.ts` by browser-checklist responsibility.
   Done on 2026-06-02: the entry file now delegates Playwright startup and
   shared reporting to `probe-combat-checklist/harness.ts`, and the 24 checks
   live in enemy AI, player damage/death, movement/world, and
   pet/loot/magic/quest/portal groups; the standalone combat checklist probe
   still passes 24/24 checks.
73. Split `test/probe-ui-flows.ts` by panel click-through responsibility. Done
   on 2026-06-02: the entry file now delegates Playwright startup, fixture
   seeding, shared reporting, and per-panel checks to `probe-ui-flows/` modules
   for forge, shop, backpack, magic, and quest flows; the standalone UI-flow
   probe still passes with 0 failures.
74. Split `test/probe-e2e.ts` by comprehensive gameplay-probe responsibility.
   Done on 2026-06-02: the entry file now delegates Playwright startup,
   canvas focus, shared state snapshots, and grouped checks to `probe-e2e/`
   modules for boot/new-game, movement/combat, backpack, quest/magic panels,
   persistence, and i18n; the standalone E2E probe still passes with 0
   failures.
75. Extract `src/runtime/input.test.ts` fixtures. Done on 2026-06-02:
   Phaser keyboard mocking, fake scene construction, and DOM keyboard-event
   helpers now live in `src/runtime/input.test-fixtures.ts`, leaving the input
   facade regression tests focused on movement, actions, pointer cleanup, and
   focus behavior; the targeted input test still passes 13/13 checks.
76. Extract `src/domain/magic.test.ts` fixtures. Done on 2026-06-02: shared
   Phaser reachability, runtime/state reset and cleanup, dynamic test spell
   catalog access, and cast setup live in `src/domain/magic.test-fixtures.ts`.
   DOM setup and magic-panel pointer scene helpers were later moved to
   `src/ui/magic-panel-input.test.ts`, leaving domain magic tests focused on
   MP drain, interruption, and instant-cast behavior.
77. Split `src/display/player-rig.test.ts` by pose-regression responsibility.
   Done on 2026-06-02: structure/layering checks stay in
   `player-rig.test.ts`, locomotion and idle-breathing checks moved to
   `player-rig-locomotion.test.ts`, and magic-casting overlay checks moved to
   `player-rig-magic.test.ts`; the targeted player-rig tests still pass 17/17
   checks.
78. Split `src/runtime/input.test.ts` by input responsibility. Done on
   2026-06-02: movement and dodge checks stay in `input.test.ts`, action and
   Escape routing checks moved to `input-actions.test.ts`, and pointer cleanup
   plus focus restoration checks moved to `input-pointer.test.ts`; the targeted
   input tests still pass 13/13 checks.

79. Harden combat checklist slime split probe. Done on 2026-06-02:
   REQ-14 now performs slime setup, defeat, and result collection in one
   browser evaluate call, then asserts the defeated parent plus two direct
   generation-2 slime children instead of relying on an interleavable global
   entity-count delta; the standalone combat checklist and full runtime probe
   suite pass.

80. Split `test/probe-deep.ts` by domain API probe responsibility. Done on
   2026-06-02: the entry file now delegates Playwright startup, API readiness,
   shared reporting, and shop/forge fixture setup to `probe-deep/harness.ts`,
   with checks split across economy/material, progression/magic, and
   world/combat/NPC groups; the standalone deep probe passes with 0 failures.

81. Split `src/data.test.ts` by static catalog responsibility. Done on
   2026-06-02: the facade/count/grave decay checks stay in
   `src/data.test.ts`, while gear catalog, forge/material-mod, world
   labels/colors/resources/materials/
   pets, bestiary entries/drops, quest type templates, and magic alias/
   casting-shape integrity checks now live in `src/data-gear.test.ts`,
   `src/data-forge.test.ts`, `src/data-world.test.ts`,
   `src/data-bestiary.test.ts`, `src/data-quests.test.ts`, and
   `src/data-magic.test.ts`; the targeted data tests pass 7 files / 18 checks.

82. Split combat checklist damage/death checks by responsibility. Done on
   2026-06-02: `damage-and-death.ts` is now a tiny ordered facade over
   `enemy-ai.ts` for REQ-1 through REQ-3 and `player-damage-and-death.ts` for
   REQ-4 through REQ-9; the standalone combat checklist still passes 24/24.

83. Split combat checklist systems checks by responsibility. Done on
   2026-06-02: `systems.ts` is now a tiny ordered facade over `pet-and-loot.ts`
   for REQ-16 through REQ-17, `magic-and-quest.ts` for REQ-18 through REQ-21,
   and `world-systems.ts` for REQ-22 through REQ-24; the standalone combat
   checklist still passes 24/24.

84. Harden magic-panel UI-to-canvas input handoff. Done on 2026-06-02:
   `closeMagicPanel()` and `openMagicPanel()` now clear both the GameScene
   pointer state and the active MagicScene pointer state, so clicking the magic
   UI cannot leave stale canvas attack/bow-charge input behind; the magic unit
   tests now cover 9 checks and the UI-flow probe still passes with 0 failures.

85. Split `test/probe-weapons.ts` by browser weapon-probe responsibility. Done
   on 2026-06-02: the entry file now delegates Playwright boot/reporting to
   `probe-weapons/harness.ts`, static cases to `weapon-cases.ts`, equipment and
   attack-path checks to `attack-checks.ts`, catalog equip checks to
   `catalog-checks.ts`, and bow charge/release checks to `bow-checks.ts`; the
   standalone weapon probe passes 5/5 and the full runtime probe runner still
   passes 11 suites / 21 checks / 0 failures.

86. Extract `src/display/particles.test.ts` fixtures. Done on 2026-06-02:
   Phaser particle mocks, fake scene/emitter construction, dynamic particle
   imports, and display reset helpers now live in
   `src/display/particles.test-fixtures.ts`; the particle regression file is
   focused on the 4 facade/spawner assertions, and the targeted particle test,
   full unit suite, typecheck, and lint all pass.

87. Extract `src/scenes/panels/ModalPanelScene.test.ts` shared setup. Done on
   2026-06-02: the Phaser scene mock now lives in
   `ModalPanelScene.phaser.test-fixtures.ts`, shared DOM/runtime setup, mounted
   panel construction, stale pointer seeding, and repeated cleared-pointer
   assertions live in `ModalPanelScene.test-fixtures.ts`, and the input-isolation
   test file now focuses on the real-click, panel-handoff, and document-handoff
   cases; the targeted panel test, full unit suite, typecheck, and lint all pass.

88. Split `src/domain/magic.test.ts` by magic regression responsibility. Done
   on 2026-06-02: MP drain and interruption checks stay in `magic.test.ts`,
   magic-panel GameScene/MagicScene pointer cleanup checks moved to
   `magic-panel-input.test.ts`, and zero-chant instant-cast coverage moved to
   `magic-instant.test.ts`; repeated pointer-cleared assertions now live in
   `magic.test-fixtures.ts`, and the targeted magic tests, full unit suite,
   typecheck, and lint all pass.

89. Split `src/domain/combat/damage.test.ts` by combat damage responsibility.
   Done on 2026-06-02: player hurt-event facade coverage stays in
   `damage.test.ts`, pet downing/remains coverage moved to `damage-pets.test.ts`,
   deterministic drop and defeat payout coverage moved to `damage-loot.test.ts`,
   and shared state reset plus monster/pet factories now live in
   `damage.test-fixtures.ts`; the targeted damage tests, full unit suite,
   typecheck, and lint all pass.

90. Split `src/domain/ai.test.ts` by AI behavior responsibility. Done on
   2026-06-02: pet aggro and grave decay coverage stays in `ai.test.ts`, pet
   guardian combat coverage moved to `ai-pets.test.ts`, entity melee damage
   coverage moved to `ai-entities.test.ts`, and shared display/magic mocks plus
   state reset and monster/pet factories now live in `ai.test-fixtures.ts`; the
   targeted AI tests, full unit suite, typecheck, and lint all pass.

91. Split `src/domain/death.test.ts` by death-system regression responsibility.
   Done on 2026-06-02: respawn and lost-package recovery coverage stays in
   `death.test.ts`, inventory permanent/package loss coverage moved to
   `death-inventory-loss.test.ts`, corruption threshold and fatigue relief
   coverage moved to `death-corruption-fatigue.test.ts`, and shared reset now
   lives in `death.test-fixtures.ts`; the targeted death tests, full unit suite,
   typecheck, and lint all pass.

92. Split `test/probe-dump.ts` by diagnostic-dump responsibility. Done on
   2026-06-02: the entry file now only parses scenarios and orchestrates the
   dump, while Playwright boot/log capture lives in `probe-dump/harness.ts`,
   canvas screenshot and state snapshots live in `probe-dump/snapshot.ts`,
   dodge/wolves/save-load scenario steps live in `probe-dump/scenarios.ts`, and
   report/log/README writes live in `probe-dump/output.ts`; targeted lint, full
   lint, typecheck, full unit suite, and the `dodge` dump probe pass with 0
   console errors and 0 invariant breaks.

93. Split `test/probe-live-combat.ts` by live combat probe responsibility. Done
   on 2026-06-02: the entry file now only bootstraps, focuses the canvas, runs
   the checks, cleans up, and exits; Playwright startup, error capture, shared
   reporting, canvas focus, cleanup, and summary output live in
   `probe-live-combat/harness.ts`, while adjacent wolf damage, enemy approach,
   repeated-hit damage, and death-transition checks live in
   `probe-live-combat/scenarios.ts`; targeted lint, full lint, typecheck, and
   the standalone live combat probe pass 4/4 checks.

94. Split `test/probe-comprehensive.ts` by comprehensive functional probe
   responsibility. Done on 2026-06-02: the entry file now only creates the probe,
   runs grouped phases, and exits; Playwright boot, shared error capture,
   pass/fail tallying, canvas helpers, and summary output live in
   `probe-comprehensive/harness.ts`, while boot, race selection, panel, combat,
   movement, pause, stats, and persistence phases live in
   `probe-comprehensive/phases.ts`; targeted lint, full lint, typecheck, and the
   standalone comprehensive probe pass 21/21 checks.

95. Split `test/probe-portal-runtime.ts` by runtime portal probe
   responsibility. Done on 2026-06-02: the entry file now only creates the probe,
   runs the runtime checks, and closes the browser; Playwright boot, console
   error capture, map positioning, portal auto-exit state reads, and shared
   assertions live in `probe-portal-runtime/harness.ts`, while road-sign, portal
   metadata, field/forest landing, and repeated round-trip checks live in
   `probe-portal-runtime/scenarios.ts`; targeted lint, full lint, typecheck, and
   the standalone portal runtime probe pass.

96. Split `src/domain/portal.test.ts` by portal regression responsibility. Done
   on 2026-06-02: target-spawn and bidirectional bounce-back checks stay in
   `portal.test.ts`, missing-spawn fallback and map-exit auto-trigger checks
   moved to `portal-fallback.test.ts`, and shared state reset plus portal/sign
   lookup helpers now live in `portal.test-fixtures.ts`; targeted portal tests,
   targeted portal lint, typecheck, full lint, and the full unit suite pass.

97. Split `src/domain/quest.test.ts` by quest regression responsibility. Done
   on 2026-06-02: reward/status facade helper coverage stays in `quest.test.ts`,
   major kill quest progress and settlement coverage moved to `quest-major.test.ts`,
   small delivery quest and auto-settlement coverage moved to `quest-small.test.ts`,
   and shared reset plus actor factory helpers now live in `quest.test-fixtures.ts`;
   targeted quest tests, targeted quest lint, typecheck, full lint, and the full
   unit suite pass.

98. Split `src/domain/persistence.test.ts` by persistence regression
   responsibility. Done on 2026-06-02: save-record construction and existing name
   preservation coverage stays in `persistence.test.ts`, localStorage slot
   read/write plus commit/replace/delete/latest coverage moved to
   `persistence-slots.test.ts`, time-format coverage moved to
   `persistence-time.test.ts`, and shared reset plus save-record factory helpers
   now live in `persistence.test-fixtures.ts`; targeted persistence tests,
   targeted persistence lint, typecheck, full lint, and the full unit suite pass.

99. Split `src/domain/inventory.test.ts` by inventory regression
   responsibility. Done on 2026-06-02: material/resource facade coverage stays in
   `inventory.test.ts`, gear bag/resolution/equip coverage moved to
   `inventory-gear.test.ts`, pet adoption/recall coverage moved to
   `inventory-pets.test.ts`, and shared inventory reset now lives in
   `inventory.test-fixtures.ts`; targeted inventory tests, targeted inventory
   lint, typecheck, full lint, and the full unit suite pass.

100. Split `src/domain/npc-memory.test.ts` by NPC memory regression
   responsibility. Done on 2026-06-02: relation key and affection/devotion clamp
   coverage stays in `npc-memory.test.ts`, legacy ownership migration moved to
   `npc-memory-ownership.test.ts`, current-player pet filtering moved to
   `npc-memory-pets.test.ts`, and shared reset plus NPC/pet factories now live in
   `npc-memory.test-fixtures.ts`; targeted NPC memory tests, targeted NPC memory
   lint, typecheck, full lint, and the full unit suite pass.

101. Split `src/domain/economy.test.ts` by economy regression responsibility.
   Done on 2026-06-02: material-mod and forge-ingredient formula coverage stays
   in `economy.test.ts`, shop purchase plus material sale coverage moved to
   `economy-commerce.test.ts`, forge action coverage moved to
   `economy-forge.test.ts`, and shared reset plus action-object helpers now live
   in `economy.test-fixtures.ts`; targeted economy tests, targeted economy lint,
   typecheck, full lint, and the full unit suite pass.

102. Split `test/probe-combat-checklist/player-damage-and-death.ts` by player
   damage checklist responsibility. Done on 2026-06-02: the original file is now
   a small ordered facade, REQ-4 through REQ-6 damage mitigation checks and
   REQ-9 thorns reflection checks moved to `player-damage.ts`, and REQ-7 through
   REQ-8 defeat/respawn checks moved to `player-death.ts`; targeted probe lint,
   typecheck, full lint, the full unit suite, and the standalone combat checklist
   probe pass.

103. Split `test/probe-combat-checklist/movement-and-world.ts` by movement/world
   checklist responsibility. Done on 2026-06-02: the original file is now a small
   ordered facade, REQ-10 through REQ-11 movement and sprint checks moved to
   `player-movement.ts`, REQ-12 pickup coverage moved to `world-pickups.ts`,
   REQ-13 through REQ-14 pet injury and slime split coverage moved to
   `pet-and-entity-outcomes.ts`, and REQ-15 hit-stop coverage moved to
   `hit-stop.ts`; targeted probe lint, typecheck, full lint, the full unit suite,
   and the standalone combat checklist probe pass.

104. Split `test/probe-comprehensive/phases.ts` by comprehensive probe phase
   responsibility. Done on 2026-06-02: the original file is now a small ordered
   facade, boot plus race-start checks moved to `boot-and-new-game.ts`, panel
   open/close checks moved to `panels.ts`, combat plus movement checks moved to
   `gameplay-actions.ts`, pause plus stats checks moved to
   `status-and-pause.ts`, and save/reload/continue checks moved to
   `persistence.ts`; targeted probe lint, typecheck, full lint, the full unit
   suite, and the standalone comprehensive probe pass.

105. Split `test/probe-e2e/harness.ts` by E2E probe harness responsibility.
   Done on 2026-06-02: the harness remains the public `createE2eProbe` assembly
   point and re-exports existing types, public probe types moved to `types.ts`,
   console reporting plus step failure capture moved to `reporter.ts`, canvas box
   lookup/focus helpers moved to `canvas.ts`, and browser state snapshot reading
   moved to `state-snapshot.ts`; targeted probe lint, typecheck, full lint, the
   full unit suite, and the standalone E2E probe pass.

106. Split `src/data/bestiary.ts` by static bestiary catalog responsibility.
   Done on 2026-06-02: the public `bestiary` export remains in
   `src/data/bestiary.ts`, wildlife plus friendly creature entries moved to
   `bestiary/wildlife.ts`, common monster entries moved to
   `bestiary/common-monsters.ts`, and elite/demon entries moved to
   `bestiary/elites.ts`; targeted static data tests, targeted bestiary lint,
   typecheck, full lint, and the full unit suite pass.

107. Split `src/runtime/invariants/checks.ts` by runtime invariant check
   responsibility. Done on 2026-06-02: the public `INVARIANTS` array remains in
   `checks.ts` and preserves its previous order, combat liveness and monsterForm
   informational checks moved to `checks/combat.ts`, player health/position and
   cooldown progression checks moved to `checks/player.ts`, entity position
   checks moved to `checks/world.ts`, and scene reference checks moved to
   `checks/scene.ts`; targeted invariant tests, targeted invariant lint,
   typecheck, full lint, and the full unit suite pass.

108. Split `src/display/world/pets.ts` by pet display synchronization
   responsibility. Done on 2026-06-02: the public exports remain in
   `pets.ts`, pet sprite/body lifecycle sync moved to `pets/display.ts`, pet
   remains drawing moved to `pets/remains.ts`, and entity/pet HP bar drawing
   moved to `pets/hp-bars.ts`; adjacent display tests, targeted pet display
   lint, typecheck, full lint, and the full unit suite pass.

109. Move player aim helper ownership from scene helpers to runtime input. Done
   on 2026-06-02: `playerAimAngle` and `normalizeWithAim` now live in
   `src/runtime/input/aim.ts` and are exported through `runtime/input.ts`;
   `scenes/game-scene-helpers/aim.ts` remains a compatibility re-export, while
   display effects and combat modules now import aim helpers from runtime input
   instead of scene helpers. Targeted input/display tests, targeted lint, and
   typecheck pass.

110. Move world-action/modal gate ownership from scene helpers to runtime input.
   Done on 2026-06-02: `blockWorldAction`, `worldPointerBlocked`, and
   `modalKey` now live in `src/runtime/input/modal-gates.ts` and are exported
   through `runtime/input.ts`; `scenes/game-scene-helpers/modal-gates.ts`
   remains a compatibility re-export, while `ui/wire.ts`, scene button
   handlers, pointer handlers, and keyboard handlers now read the gate helpers
   from runtime input. Targeted input tests, targeted lint, typecheck, full
   lint, and the full unit suite pass.

111. Decouple magic-cast interruption visual cleanup from domain code. Done on
   2026-06-02: `interruptPendingMagicCast` now emits
   `Events.MAGIC_CAST_INTERRUPTED` with the interrupt reason and spell id instead
   of importing `display/animations`; `display/animations/magic-cast.ts` listens
   for that runtime event and clears the active magic-cast visual. Magic
   interruption tests now assert the event payload and visual cleanup; targeted
   magic tests, targeted lint, typecheck, full lint, and the full unit suite
   pass.

112. Decouple magic-cast charge/release visuals from domain magic casting. Done
   on 2026-06-02: `beginMagicCast` now emits `Events.MAGIC_CAST_BEGIN` with
   spell id, duration, and color, and `resolveMagicCast` emits
   `Events.MAGIC_CAST_RESOLVE` instead of importing display animation triggers;
   `display/animations/magic-cast.ts` listens for those runtime events and
   plays the charge/release visuals. Magic tests now assert begin/resolve event
   payloads and release visual state; targeted magic tests, targeted lint,
   typecheck, full lint, and the full unit suite pass.

113. Decouple magic-cast panel closing and stats refresh from domain magic
   casting. Done on 2026-06-02: successful cast events now drive UI response,
   with `ui/magic/scene.ts` closing the MagicScene on `MAGIC_CAST_BEGIN` or
   `MAGIC_CAST_RESOLVE` and `ui/stats/lifecycle.ts` refreshing stats from the
   same events; `domain/magic/casting.ts` no longer imports display or UI
   modules. Existing magic panel close/pointer cleanup tests still pass, along
   with targeted magic tests, targeted lint, typecheck, full lint, and the full
   unit suite.

114. Decouple magic particle spawning from domain magic effects. Done on
   2026-06-02: `startMagicEffect` now keeps gameplay `magicEffects` state in
   domain and emits `Events.MAGIC_EFFECT_SPAWNED` for visual particles instead
   of importing `display/particles`; `display/particles/dispatcher.ts` listens
   for that event and routes to the existing spell-specific spawners, while
   `display/index.ts` side-effect loads particles so production listeners are
   registered. Magic/domain and particle tests cover the event payload and
   particle dispatch path; targeted tests, targeted lint, typecheck, full lint,
   full unit suite, and build pass.

115. Decouple NPC/player interaction feedback from domain NPC flows. Done on
   2026-06-02: `talkOrUse`, wounded-NPC aid, and injured-pet rescue now publish
   `Events.PLAYER_INTERACTED` and `Events.ENTITY_INTERACTED` through
   `domain/npc/interaction-events.ts` instead of importing `display/animations`;
   `display/animations/player.ts` and `display/animations/npc.ts` listen for
   those events and run the existing placeholder feedback. New display and NPC
   domain tests cover the event path; NPC domain no longer has direct
   `display/animations` imports, and targeted tests, targeted lint, typecheck,
   full lint, full unit suite, and build pass.

116. Decouple player attack placeholder visuals from domain combat flows. Done
   on 2026-06-02: melee attacks and bow firing now publish
   `Events.PLAYER_ATTACK_STARTED` through `domain/combat/visual-events.ts`
   instead of importing `display/animations`; `display/animations/player.ts`
   listens for that event and maps the attack name to the existing placeholder
   attack pose/tint. The attack event test covers the payload contract, display
   animation tests cover the event listener, and combat search now shows only
   the separate hit-tween feedback debt plus test mocks as remaining
   `display/animations` imports. Targeted tests, targeted lint, typecheck, full
   lint, full unit suite, and build pass.

117. Decouple entity hit-tween feedback from domain combat damage. Done on
   2026-06-02: `markHitReaction` now emits the existing `Events.ENTITY_HIT`
   event with `{ entity, critical }` instead of importing `display/animations`;
   `display/animations/feedback.ts` subscribes during `initAnimationFeedback`
   and routes the event to the existing hit tween, unregistering on scene
   shutdown like player hurt feedback. Damage and display animation tests cover
   the event payload and listener path, stale display-animation mocks were
   removed from damage/AI fixtures, and combat domain search no longer finds
   `display/animations` imports. Targeted tests, targeted lint, typecheck, full
   lint, full unit suite, and build pass.

118. Decouple actor movement calls from display physics imports. Done on
   2026-06-02: domain player, AI, pet, and corruption rampage movement now call
   `runtime/actor-movement.ts`; the runtime service provides the same tile-space
   fallback movement and allows display physics to register its Phaser-backed
   mover from `display/physics.ts`, preserving body velocity/collision behavior
   in game while keeping domain code free of `display/physics` and
   `display/index` movement imports. Runtime actor-movement tests cover fallback,
   dungeon bounds, registration, and reset behavior; related player, AI, pet,
   and corruption tests pass along with targeted lint, typecheck, full lint,
   full unit suite, and build.

119. Decouple dungeon display/body sync from direct display imports. Done on
   2026-06-02: `domain/dungeon/display.ts` now calls
   `runtime/display-sync.ts` for player body teleport and display rebuild
   instead of importing `display/physics` or dynamically importing
   `display/index`; `display/physics.ts` registers the Phaser body teleporter,
   and `display/index.ts` registers the display rebuilder. Runtime display-sync
   tests cover no-op defaults and registered delegates, while dungeon display
   tests cover scene-not-ready and scene-ready paths. Targeted tests, targeted
   lint, typecheck, full lint, full unit suite, and build pass.

120. Decouple game-flow reset/load display rebuild from direct display imports.
   Done on 2026-06-02: `resetGameState` and `startLoadedSave` now call
   `runtime/display-sync.ts` instead of importing `rebuildDisplay` from
   `display/index`; the existing display registration still owns the actual
   Phaser rebuild. `game-flow-display.test.ts` covers both new-game reset and
   loaded-save paths, and the domain direct-display scan no longer finds
   `display/physics` or `display/index` imports. Targeted tests, targeted lint,
   typecheck, full lint, full unit suite, and build pass.

121. Decouple bow firing stat refresh from direct UI rendering. Done on
   2026-06-02: `domain/combat/bow/firing.ts` now emits
   `Events.PLAYER_STATS` after consuming arrows/stamina and creating the
   projectile instead of importing `ui/stats`; the stats sidebar already listens
   for that event and owns DOM rendering. `bow-firing.test.ts` covers the event
   contract while preserving arrow count, stamina, cooldown, and projectile
   creation behavior. Targeted tests, targeted lint, typecheck, full lint, full
   unit suite, and build pass.

122. Decouple NPC object-use panel opening from direct UI imports. Done on
   2026-06-02: `domain/npc/object-use.ts` now requests shop, forge, and magic
   cottage panels through `runtime/panel-actions.ts` instead of importing
   `ui/shop`, `ui/forge`, or `ui/magic`; the UI scene modules register the real
   open handlers during module load. `npc-object-use-panel-actions.test.ts`
   covers shop/forge dispatch, magic cottage mode/title forwarding, and monster
   form shop rejection without booting Phaser UI. Targeted tests, targeted lint,
   typecheck, full lint, full unit suite, and build pass.

123. Decouple NPC quest panel opening from direct UI rendering. Done on
   2026-06-02: `domain/npc/panels.ts` now requests guild and NPC quest panels
   through `runtime/panel-actions.ts` instead of importing UI state/cache/render
   helpers; `ui/quest/scene.ts` registers the real QuestScene open handlers
   alongside the existing close handler. `npc-panel-actions.test.ts` covers
   guild panel requests and NPC-name forwarding without booting Phaser UI.
   Targeted tests, targeted lint, typecheck, full lint, full unit suite, and
   build pass.

124. Decouple game-flow reset/load/save UI refresh from direct UI imports. Done
   on 2026-06-02: `domain/game-flow/reset.ts`, `session.ts`, and `save.ts` now
   request log/toast cleanup, runtime UI reset, language application, gear panel
   refresh, menu cache invalidation, and main-menu rendering through
   `runtime/game-flow-ui.ts` instead of importing DOM/UI modules directly.
   `ui/dom-chrome.ts`, `ui/gear.ts`, and `ui/menus.ts` register the concrete UI
   handlers during module load. `game-flow-ui-boundary.test.ts` covers reset,
   load, save, and delete-save UI request contracts without booting DOM panels.
   Targeted tests, targeted lint, typecheck, full lint, full unit suite, and
   build pass.

125. Move magic panel pointer cleanup regression coverage out of `domain/`.
   Done on 2026-06-02: `magic-panel-input.test.ts` now lives under `src/ui/`
   because it exercises `openMagicPanel` and magic panel pointer cleanup rather
   than domain rules. Import paths now point from the UI test back to domain
   magic fixtures and casting services where needed. The full `src/domain` scan
   now has no direct `ui/` imports, including tests. Targeted tests, targeted
   lint, typecheck, full lint, full unit suite, and build pass.

126. Move magic cast visual assertions out of domain magic tests. Done on
   2026-06-02: `domain/magic.test.ts` now verifies magic MP drain,
   interruption, gameplay effect state, and runtime event payloads without
   importing `display/animations`; `magic.test-fixtures.ts` no longer clears
   display visual state. `display/animations.test.ts` now owns the visual
   response coverage for `MAGIC_CAST_BEGIN`, `MAGIC_CAST_RESOLVE`, and
   `MAGIC_CAST_INTERRUPTED`. Targeted tests, targeted lint, typecheck, full
   lint, full unit suite, and build pass.

127. Split UI pointer fixtures out of magic domain test fixtures. Done on
   2026-06-02: `domain/magic.test-fixtures.ts` now only resets magic gameplay
   state, runtime refs, magic effects, arrows, and dynamic catalog changes; it
   no longer initializes DOM panels or exports magic panel pointer helpers.
   `ui/magic-panel-input.test.ts` now owns its DOM setup plus pointer-scene
   helpers because those assertions exercise panel opening/closing behavior.
   Targeted tests, targeted lint, typecheck, full lint, full unit suite, and
   build pass.

128. Centralize browser storage access behind a runtime helper. Done on
   2026-06-02: `runtime/browser-storage.ts` now owns safe localStorage lookup,
   read, write, and remove helpers. `domain/i18n/storage.ts`,
   `domain/persistence/storage.ts`, and `runtime/log/pattern.ts` now use those
   helpers while preserving language fallback, save-slot memory fallback, and
   debug pattern behavior. `browser-storage.test.ts` covers available storage,
   global fallback, and throwing/unavailable storage cases. Targeted tests,
   targeted lint, typecheck, full lint, full unit suite, and build pass.

129. Remove domain tests' dependence on runtime input fixtures for Phaser mocks.
   Done on 2026-06-02: `test-support/phaser.test-fixtures.ts` now provides the
   shared Phaser keyboard/geometry mock. `combat/bow-firing.test.ts`,
   `player.test.ts`, and `magic.test-fixtures.ts` use that shared fixture, while
   `npc-object-use-panel-actions.test.ts` no longer imports any input fixture.
   Runtime input fixtures are now used only by runtime input tests. Targeted
   tests, targeted lint, typecheck, full lint, full unit suite, and build pass.

130. Reuse the shared Phaser mock from runtime input fixtures. Done on
   2026-06-02: `runtime/input.test-fixtures.ts` now imports
   `test-support/phaser.test-fixtures.ts` for Phaser keyboard behavior instead
   of defining its own duplicate `vi.mock('phaser')` block. The runtime input
   fixture still owns only keyboard-event dispatch and fake scene construction.
   Targeted tests, targeted lint, typecheck, full lint, full unit suite, and
   build pass.

131. Reuse the shared Phaser mock from UI panel helper tests. Done on
   2026-06-02: `ui/panels-helpers.test.ts` now imports
   `test-support/phaser.test-fixtures.ts` instead of carrying a local minimal
   Phaser mock. Its display-animation mock remains local because the test only
   needs to suppress interaction animation side effects. Targeted tests,
   targeted lint, typecheck, full lint, full unit suite, and build pass.

132. Consolidate remaining generic Phaser test mocks into test-support. Done on
   2026-06-02: `test-support/phaser.test-fixtures.ts` now includes the shared
   `BlendModes.ADD`, base `Scene`, `Scenes.Events.SHUTDOWN`, keyboard, and
   geometry mocks. `display/particles.test-fixtures.ts` and
   `scenes/panels/ModalPanelScene.phaser.test-fixtures.ts` now reuse the shared
   fixture while keeping their own particles or modal-scene helpers. Targeted
   tests, targeted lint, typecheck, full lint, full unit suite, and build pass.

133. Synchronize audit and architecture documentation after shared-fixture
   cleanup. Done on 2026-06-02: the validation snapshot then recorded the
   70 unit-test files / 216 tests result and the build warning note matched the
   latest build output. `ARCHITECTURE.md` now describes magic domain fixtures as
   gameplay reset/dynamic-spell setup only, with DOM pointer cleanup coverage
   owned by UI tests.

134. Add static data baseline integrity coverage for world support catalogs.
   Done on 2026-06-02: `src/data-world.test.ts` now also guards region labels
   and trust/hate ranges, color-token format, scene-name labels, resource
   groups/descriptions, material descriptions/mechanical numeric fields, and
   pet stat/color shape. No catalog values or gameplay logic changed. Targeted
   data-world tests, typecheck, full unit suite, lint, and build pass.

135. Add static data baseline integrity coverage for bestiary records. Done on
   2026-06-02: bestiary integrity coverage now lives in
   `src/data-bestiary.test.ts`, guarding id/name/kind/faction fields, color
   format, radius/HP/attack/speed ranges, optional behavior-flag booleans,
   and drop kind/name/color/chance/value shape. No bestiary values or gameplay
   logic changed. Targeted data tests, typecheck, full unit suite, lint, and
   build pass.

136. Add static data baseline integrity coverage for material forge mods.
   Done on 2026-06-02: `src/data-gear.test.ts` now checks every material with
   forge-effect fields produces at least one valid `materialMod()` output,
   verifies non-forge materials do not produce mods, and validates generated
   mod material/label references, numeric fields, cooldown multipliers, slow
   values, and repel flags. No material, gear, or gameplay values changed.
   Targeted data-gear tests, typecheck, full unit suite, lint, and build pass.

137. Add static data baseline integrity coverage for quest type templates.
   Done on 2026-06-02: quest template coverage now lives in
   `src/data-quests.test.ts`, checking major quest types stay within kill/scout
   templates, small quest types stay within hunt/delivery templates, defeat
   quests have resolvable species/target/count fields, scout quests have
   scene/x/y/radius fields, and delivery templates defer runtime `targetNpc`
   assignment while keeping auto-settlement delay. No quest data or gameplay
   logic changed. Targeted data tests, typecheck, full unit suite, lint, and
   build pass.

138. Split static world data integrity tests by catalog responsibility. Done
   on 2026-06-02: `src/data-world.test.ts` now keeps world label/color,
   resource/material, pet, and material-pet contract checks; bestiary entry
   and drop checks moved to `src/data-bestiary.test.ts`; quest shape and
   quest-type template checks moved to `src/data-quests.test.ts`. Assertions
   are behavior-preserving and still pass as 8 checks across the three files.
   Targeted data tests, typecheck, full unit suite, lint, and build pass.

139. Split static gear and forge data integrity tests by catalog responsibility.
   Done on 2026-06-02: `src/data-gear.test.ts` now keeps initial gear and gear
   catalog shape checks, while forge recipe references, material forge-mod
   shape checks, and forge recipe group checks moved to
   `src/data-forge.test.ts`. Assertions are behavior-preserving and pass as 5
   checks across the two files. Targeted data tests, typecheck, full unit
   suite, lint, and build pass.

140. Add static data baseline integrity coverage for grave decay constants.
   Done on 2026-06-02: `src/data.test.ts` now validates that
   `graveDecayInterval` is finite and positive, and `graveMaxDecay` is a finite
   non-negative integer. No death, lost-package, or gameplay values changed.
   The targeted data facade test passes.

141. Add world domain facade export coverage. Done on 2026-06-02:
   `src/domain/world.test.ts` now verifies that the legacy `src/domain/world.ts`
   entry point re-exports the split constants, region helpers, map helpers,
   entity factories, object/portal factories, and pickup helpers by reference.
   The test is behavior-preserving and does not generate maps or mutate runtime
   world state. Targeted world facade test passes.

142. Add map-exit facade and config integrity coverage. Done on 2026-06-02:
   `src/domain/map-exits.test.ts` now verifies that the stable
   `src/domain/map-exits.ts` entry point re-exports split config, paint, and
   query helpers by reference. It also checks map-exit config uniqueness, source
   scene references, zone/path bounds, allowed path tile tokens, and lookup
   helper alignment without executing teleport flow. Targeted map-exit test
   passes.

143. Add teleport facade and target-resolution coverage. Done on 2026-06-02:
   `src/domain/teleport.test.ts` now verifies that the stable
   `src/domain/teleport.ts` entry point re-exports cooldown, target extraction,
   portal teleport, and map-exit trigger helpers by reference. It also checks
   the cooldown constant shape and `portalTargetFor()` precedence between
   explicit target fields and portal-action fallback without calling
   `teleportThroughPortal()` or loading scenes. Targeted teleport test passes.

144. Add lost-package facade and content-detection coverage. Done on
   2026-06-02: `src/domain/lost-packages.test.ts` now verifies that the stable
   `src/domain/lost-packages.ts` entry point re-exports content checks,
   normalization, pickup sync, creation, and claim helpers by reference. It also
   checks `hasLostPackageContents()` for empty contents, zero-count contents,
   currencies, consumables, materials, resources, and gear without creating or
   claiming runtime packages. Targeted lost-package test passes.

145. Add magic-casting facade and empty-interrupt coverage. Done on
   2026-06-02: `src/domain/magic-casting.test.ts` now verifies that the stable
   `src/domain/magic-casting.ts` entry point re-exports
   `interruptPendingMagicCast` by reference. It also checks that interrupting
   with no pending magic cast returns false and does not alter the MP regen
   lock. Targeted magic-casting test passes.

146. Add magic-input facade and pure matching coverage. Done on 2026-06-02:
   `src/domain/magic-input.test.ts` now verifies that the stable
   `src/domain/magic-input.ts` entry point re-exports catalog, normalization,
   forbidden-phrase, and fuzzy matching helpers by reference. It also checks
   punctuation/width/case normalization, known spell alias lookup, forbidden
   phrase lookup, and near-name detection without mutating runtime state.
   Targeted magic-input test passes.

147. Add world-spawn dispatch coverage with mocked scene spawners. Done on
   2026-06-02: `src/domain/world-spawn.test.ts` verifies that `spawnWorld()`
   clears world collections, dispatches the requested or current scene to the
   correct split spawner, and syncs lost-package pickups while all concrete map
   population modules are mocked. Targeted world-spawn test passes.

148. Add dungeon facade coverage. Done on 2026-06-02:
   `src/domain/dungeon.test.ts` verifies that the stable `src/domain/dungeon.ts`
   entry point re-exports scene-flow, dungeon generation, and per-scene spawn
   helpers by reference without executing scene transitions or procedural map
   generation. Targeted dungeon test passes.

149. Add game-flow facade coverage. Done on 2026-06-02:
   `src/domain/game-flow.test.ts` verifies that the stable
   `src/domain/game-flow.ts` entry point re-exports state-shape, save/autosave,
   reset, and session helpers by reference without executing reset, save, load,
   continue, or delete flows. Targeted game-flow test passes.

150. Add portal spawn-table integrity coverage. Done on 2026-06-02:
   `src/domain/teleport.test.ts` now verifies that every static portal spawn
   table scene has a `DATA.sceneNames` label, a `start` fallback, finite positive
   coordinates, and direct `resolveSceneSpawn()` resolution without exercising
   runtime teleport side effects. Targeted teleport test passes.

151. Perform final remaining-scope directory audit. Done on 2026-06-03:
   display, runtime, UI/scenes, probe, and static-data directories were scanned
   for current facade/test/probe organization. Display and runtime keep their
   split facades plus focused unit coverage for player rig, animations,
   particles, effects, world camera, input, state, invariants, log,
   browser-storage, actor movement, and display-sync. UI/scenes keep scene-owned
   modal lifecycle with DOM rendering facades and panel-helper tests. Core
   browser probes are small runners over grouped modules; remaining single-file
   probes are standalone diagnostics/stress utilities. Static data coverage is
   split across seven catalog tests plus portal spawn-table integrity coverage.
   A production-source dependency scan found no direct domain-to-display/UI
   imports; current side effects route through runtime adapters or events.

152. Run final validation gate. Done on 2026-06-03: `npm run test:unit`
   passes 82 test files / 244 tests, `npm run typecheck` passes, `npm run lint`
   passes with 0 errors and 0 warnings, `npm run build` passes with the existing
   Vite large chunk warning, and
   `PROBE_BASE_URL=http://150.65.181.206:5175/ npm test` passes 11 runtime
   probe suites with 21 pass / 0 fail.

153. Add profession/proficiency MVP. Done on 2026-06-04 on
   `codex/proficiency-mvp`: added sword, dagger, spear, hammer, bow, magic,
   forging, gathering, and survival proficiency records under
   `state.player.proficiency`. Experience increases from actual effective
   behavior: weapon hit/defeat, effective magic, completed forging, resource
   gathering, survival recovery, fatigue relief, purification, and death
   recovery. Empty attacks, invalid magic, failed forging, and non-resource
   pickups do not grant proficiency. Levels run from 0 to 30, with 150 EXP for
   level 1 and each later requirement floored after a 1.1 multiplier.
   Proficiency bonuses remain light: weapon/magic damage +0.5% per level,
   forging success +0.2% per level, gathering extra-resource chance +0.2% per
   level, and survival recovery +0.2% per level. Class tendency is computed
   from the highest proficiency progress and keeps the first actually reached
   tendency on ties; it updates the existing `player.job` display for
   compatibility. Save/load normalization fills defaults for old saves, and the
   character status panel lists class tendency, each proficiency level/progress,
   and each MVP bonus. This does not add a job tree, class skills, transfer
   quests, class equipment locks, new maps, new bosses, new races, new weapons,
   or new magic systems.

154. Add character status panel MVP. Done on 2026-06-04 on
   `codex/proficiency-mvp`: added a scene-owned `CharacterScene` and
   `characterPanel` modal opened with P and closed with P or Esc. The panel
   shows race, class tendency, subclass placeholder, area, gold, base HP/MP/
   stamina and combat stats, movement/regeneration rates, visible active
   effects, race bonus text, all nine proficiency levels/progress values, and
   current weapon/equipment summaries. Hidden corruption value, monster-form
   state, and death-fatigue layers are intentionally omitted. The world update
   loop pauses while the panel is open, modal gates block combat/world actions,
   and movement key state is preserved so held movement resumes after closing.
   The persistent HUD was trimmed back to necessary quick-read stats instead of
   showing every proficiency permanently. This does not add a job tree,
   transfer quests, new proficiency types, new maps, new equipment systems, or
   combat/proficiency/death/corruption/teleport logic changes.

155. Remove the legacy sidebar UI. Done on 2026-06-04 on
   `codex/proficiency-mvp`: removed the right-side `aside` from `index.html`
   and deleted the old sidebar style modules, rolling log panel style, constant
   stats DOM, legend, action buttons, equipment panel DOM, and world log DOM.
   GameScene no longer attaches stats, gear, log, or old button handlers, and
   game-flow UI adapters no longer refresh removed sidebar panels. The main
   layout is now a single centered game frame with toast and modal panels. Old
   side-button entries remain covered by existing keyboard/mouse inputs: E for
   talk/use, left mouse for attack, right mouse for defense, Space for dodge, G
   for gift, R for rest, B for backpack, F for magic, and P for character
   status. Comprehensive probes now validate that the legacy sidebar is absent
   and that character information is available through the P panel. Gameplay
   systems and proficiency gain rules were not changed by this UI cleanup.

156. Add manual first-class and subclass selection rules. Done on 2026-06-05
   on `codex/proficiency-mvp`: added persistent career state under
   `state.player.proficiency.career` with manual first-class selection,
   manual subclass selection, and old-save default normalization to
   "unselected". First-class candidates unlock when their matching proficiency
   reaches Lv5 and are never auto-confirmed; the player can defer selection.
   Once confirmed, the first class stays fixed and only gates which eight
   subclass candidates are shown. The 36 unordered two-proficiency subclass
   combinations are now cataloged by canonical IDs such as `sword+magic`, so
   sword + magic and magic + sword resolve to the same 魔剑士. Subclasses unlock
   when the chosen route proficiency and the paired proficiency satisfy one
   side at Lv30 and the other at Lv5, with placeholder effect text because this
   pass intentionally does not add class skills, a job tree, transfer quests,
   second/third jobs, class storylines, new maps, new bosses, new weapons, or
   new magic. Added a dedicated career modal reachable from the P character
   panel. The P panel now has a separate career-info section for class
   tendency, first class, subclass, and a persistent "职业选择" entry; the entry
   is disabled with the hint "任意熟练度达到 5 级后可以选择职业。" until a
   first-class candidate exists, then opens the unified career selection UI.
   The career UI is split into first-class selection and second/subclass
   selection areas: before first-class confirmation it only lists eligible Lv5
   first-class candidates, after confirmation it shows the fixed first class and
   the route's eight subclass candidates, and after subclass confirmation it
   states that first-class/subclass free reselection is not available in this
   version. Selection confirmations name the target class/subclass. Modal input
   isolation was also tightened so clicks outside an open panel cannot leak
   canvas pointer state into game actions. Validation: `npm run typecheck`,
   `npm run test:unit` (86 files / 271 tests), `npm run lint`,
   `npm run build`, career browser smoke test, and
   `PROBE_BASE_URL=http://150.65.181.206:5176/ npm test` (11 suites /
   26 pass / 0 fail) all pass; build still reports the existing Vite large
   chunk warning.

## Immediate Red Flags

- Historical sections above include the 2026-06-03 cleanup audit state. Use
  `git status` for the current branch state.
- The current feature branch intentionally contains proficiency MVP, manual
  career selection, character status panel, and legacy sidebar removal changes
  until commit and push are completed.
- Lint is currently clean. Keep future organization passes at 0 ESLint warnings
  unless a deliberate follow-up records new warning debt.
- Some tests live near source as unit tests; some live in `test/` as browser
  probes. Both are intentional and serve different levels of coverage.
