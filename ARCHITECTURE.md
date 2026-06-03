# OVERFANTASY Architecture

Last synchronized: 2026-06-02

This document describes the current architecture of the Phaser/TypeScript game
as it exists now. Historical migration notes and detailed file inventory live in
`PROJECT_AUDIT.md`.

The current codebase is not a pure functional domain architecture. It is a
pragmatic stateful-service architecture: domain modules usually mutate the shared
`state` object directly, scenes orchestrate frame flow, display modules reconcile
Phaser objects to state, and DOM UI modules render panels from state.

## Source Of Truth

`src/runtime/state.ts` is the compatibility facade for the central mutable game
state. Concrete runtime-state modules live under `src/runtime/state/`.

Persistent game state includes:

- session/schema/settings
- current mode, scene, map, solids, objects, pickups, dungeon state
- player state
- entities, pets, pet remains
- quests, NPC memory
- death, lost package, shrine, corruption, timer-like state

Runtime-only references include:

- Phaser scene reference
- movement key handles
- aim/facing state
- attack effect, bow charge, pending magic cast
- hit stop timer

Important invariant: visual sprites, player rig parts, and weapon images are not
collision authority. Movement/collision stays tied to the Phaser physics bodies
and explicit state fields, then visuals follow state.

## Layer Map

```text
src/main.ts
  Phaser config and scene list

src/data.ts and src/data/
  static catalog facade plus split modules for regions, colors, scene names,
  bestiary, gear, materials, resources, weapon forge recipes, pets, magic,
  quests, and grave decay constants

src/runtime/
  state facade plus split runtime-state modules, event bus, split structured
  logging, services, input tracking, timers, autosave, browser-storage access,
  cooldown ticking, registry sync, split invariant checks, panel action hooks,
  game-flow UI sync hooks

src/domain/
  game rules and state transitions. These modules are stateful services: they
  read/write runtime state and may call runtime services. Several large systems
  use compatibility facades that re-export responsibility-focused submodules.

src/display/
  Phaser display/runtime references, generated placeholder textures, player rig,
  world object sync, effects, HUD, physics bodies, particles, collision debug.
  Debug HUD code keeps `display/debug-hud.ts` as a stable facade over F2/F3
  setup, event metrics, and per-frame text rendering under `display/debug-hud/`.
  Main HUD code keeps `display/hud.ts` as a stable facade over status labels,
  resource bars, dungeon exit hints, and chant bar sync modules under
  `display/hud/`.
  `display/runtime.ts` remains the shared display-state facade over concrete
  type and singleton initializer modules under `display/runtime/`

src/scenes/
  Phaser scenes and lifecycle orchestration: boot/menu/game/pause/corruption
  choice/game-scene helpers plus modal panel scene facades and submodules

src/test-support/
  Shared unit-test fixtures that do not belong to a production layer, including
  the common Phaser mock used by domain, runtime, UI, display, and modal-scene
  tests that import modules with Phaser reachability.

src/ui/
  DOM panel rendering, split panel helper modules, and HTML action dispatch for
  backpack, quest, shop, forge, magic, stats, gear, log, toast, menus. Backpack
  UI keeps `ui/backpack.ts` as a stable facade over render, scene toggle, item
  use, and gear action modules under `ui/backpack/`; menu UI keeps
  `ui/menus.ts` as a stable facade over save-slot rows, menu views, main-menu
  DOM sync, and pause-menu rendering under `ui/menus/`; quest UI keeps
  `ui/quest.ts` as a stable facade over quest panel rendering and scene
  lifecycle under `ui/quest/`; forge UI keeps `ui/forge.ts` as a stable facade
  over forge panel rendering and scene lifecycle under `ui/forge/`; shop UI
  keeps `ui/shop.ts` as a stable facade over shop panel rendering and scene
  lifecycle under `ui/shop/`; magic UI keeps `ui/magic.ts` as a stable facade
  over magic panel rendering and scene lifecycle under `ui/magic/`; gear sidebar
  keeps `ui/gear.ts` as a stable facade over sidebar event wiring and rendering
  under `ui/gear/`; stats sidebar keeps `ui/stats.ts` as a stable facade over
  event wiring, stat-row selection, and DOM rendering under `ui/stats/`

src/styles/
  CSS modules imported by src/styles.css, with modal panel styles further
  split under src/styles/modal-panels/ and sidebar styles split under
  src/styles/sidebar/

test/
  Playwright/runtime probes and smoke/regression scripts
```

## Frame Flow

`src/scenes/Game.ts` owns the main frame loop.

Per update, the scene:

1. clamps `dt`.
2. mirrors Phaser body positions back into `state` via display physics helpers.
3. clears last-frame body velocities.
4. if gameplay is active and modal UI is closed:
   - ticks hit stop or player cooldowns
   - updates death fatigue, corruption, player input, exits/teleports, pets,
     entities, pet remains, world timers, combat feedback, and dungeon exit flow
5. reconciles Phaser display objects to current state.
6. runs runtime invariant checks.

Runtime invariant checks keep the public ordered `INVARIANTS` array in
`src/runtime/invariants/checks.ts`, while concrete combat, player, world, and
scene reference checks live under `src/runtime/invariants/checks/`.

World simulation pauses while modal UI scenes are open, but movement key tracking
is preserved by `runtime/input.ts` so held movement resumes correctly when UI
closes. Pointer state is explicitly cleared when modal panels open, close, receive
pointer/click input, or take focus so old canvas actions do not leak into UI
interaction. Runtime state keeps
`runtime/state.ts` as the stable import facade over runtime-only refs,
append-only collections, serializable game state/snapshots, and accessor shims
under `runtime/state/`. Runtime invariant checks keep `runtime/invariants.ts` as
a stable tick facade over concrete checks under `runtime/invariants/`. Structured
logging keeps `runtime/log.ts` as a stable facade over namespace, ring-buffer,
logger, and debug-pattern helpers under `runtime/log/`. Input handling keeps
`runtime/input.ts` as a stable facade over movement-key tracking, pointer
cleanup, focus restoration, aim-angle helpers, world-action/modal gates, and
action routing under `runtime/input/`. Scene helper aim and modal-gate exports
remain only as compatibility re-exports.

## Current Domain Organization

Top-level domain modules remain stable import facades where useful. Callers can
continue importing from the old paths while implementation lives in subfolders.

Current split systems:

- `domain/types.ts` -> `domain/types/`
- `domain/world.ts` -> `domain/world/`
- `domain/combat/targeting.ts` -> `domain/combat/targeting/`
- `domain/combat/damage.ts` -> `domain/combat/damage/`
- `domain/combat/bow.ts` -> `domain/combat/bow/`
- `domain/combat/actions.ts` -> `domain/combat/actions/`
- `domain/corruption.ts` -> `domain/corruption/`
- `domain/npc.ts` -> `domain/npc/`
- `domain/magic.ts` -> `domain/magic/`
- `domain/death.ts` -> `domain/death/`
- `domain/dungeon.ts` -> `domain/dungeon/`
- `domain/i18n.ts` -> `domain/i18n/`
- `domain/game-flow.ts` -> `domain/game-flow/`
- `domain/world-spawn.ts` -> `domain/world-spawn/`
- `domain/inventory.ts` -> `domain/inventory/`
- `domain/quest.ts` -> `domain/quest/`
- `domain/economy.ts` -> `domain/economy/`
- `domain/facing.ts` -> `domain/facing/`
- `domain/ai.ts` -> `domain/ai/`
- `domain/persistence.ts` -> `domain/persistence/`
- `domain/magic-input.ts` -> `domain/magic-input/`
- `domain/player.ts` -> `domain/player/`
- `domain/map-exits.ts` -> `domain/map-exits/`
- `domain/lost-packages.ts` -> `domain/lost-packages/`
- `domain/portal.ts` -> `domain/portal/`
- `domain/math.ts` -> `domain/math/`
- `domain/npc-memory.ts` -> `domain/npc-memory/`
- `domain/teleport.ts` -> `domain/teleport/`
- `domain/magic-casting.ts` -> `domain/magic-casting/`
- `domain/session.ts` -> `domain/session/`

No obvious remaining domain compatibility facade is still a monolithic
implementation file. Future cleanup should focus on data review, dependency
boundaries, and test/probe organization rather than mechanically splitting every
small file.

`domain/magic-input.ts` remains the stable import facade for typed spell-name
matching. Catalog listing, term normalization, forbidden phrase matching, and
near-name fuzzy matching live under `domain/magic-input/`. Facade and pure
matching coverage lives in `src/domain/magic-input.test.ts`.

`domain/player.ts` remains the stable import facade for per-frame player update
and pickup handling. Pickup resolution, movement/stamina update, and sprint
exhaustion thresholds live under `domain/player/`.

`domain/map-exits.ts` remains the stable import facade for map exit data and
queries. Exit types/config, path painting, zone lookup, and current-exit hit
testing live under `domain/map-exits/`. Facade and config integrity coverage
lives in `src/domain/map-exits.test.ts`.

`domain/lost-packages.ts` remains the stable import facade for death package
state and pickup recovery. Content checks, package normalization, scene pickup
sync, package creation, and claim/recovery side effects live under
`domain/lost-packages/`. Facade and pure content-detection coverage lives in
`src/domain/lost-packages.test.ts`.

`domain/portal.ts` remains the stable import facade for portal actions and
spawn resolution. Portal target types, action encoding/parsing, scene spawn
tables, and fallback spawn resolution live under `domain/portal/`.

`domain/math.ts` remains the stable import facade for pure utility helpers.
Numeric helpers, random helpers, geometry/vector helpers, clone/replace helpers,
and HTML escaping live under `domain/math/`.

`domain/npc-memory.ts` remains the stable import facade for per-player NPC
relationship memory. Subject typing, memory-key derivation, legacy ownership
migration, memory lookup, affection/devotion adjustment, and current-player pet
filtering live under `domain/npc-memory/`.

`domain/teleport.ts` remains the stable import facade for world teleport flow.
Cooldown constants, portal target extraction, scene-transition execution, and
map-exit auto-triggering live under `domain/teleport/`. Facade, cooldown, and
target-resolution coverage lives in `src/domain/teleport.test.ts`.

`domain/magic-casting.ts` remains the stable import facade for magic-cast
interruption. Interrupt reason typing and interruption side effects live under
`domain/magic-casting/`. Facade and no-pending interrupt coverage lives in
`src/domain/magic-casting.test.ts`.

`domain/world-spawn.ts` remains the stable import facade for map population.
Per-scene spawners and shared environment-object helpers live under
`domain/world-spawn/`. Dispatch and collection-reset coverage lives in
`src/domain/world-spawn.test.ts` with concrete map population mocked.

`domain/dungeon.ts` remains the stable import facade for dungeon scene flow,
procedural generation, and per-scene spawn helpers. Facade export wiring lives
in `src/domain/dungeon.test.ts`; display-service boundary coverage remains in
`src/domain/dungeon-display.test.ts`.

`domain/game-flow.ts` remains the stable import facade for state-shape migration,
save/autosave, reset/new-game, load/continue, and delete-save flows. Facade
export wiring lives in `src/domain/game-flow.test.ts`; display and UI boundary
coverage remains in `src/domain/game-flow-display.test.ts` and
`src/domain/game-flow-ui-boundary.test.ts`.

`domain/session.ts` remains the stable import facade for session and identity
helpers. Constants, default session shape, runtime ID creation, current
player/party lookup, ownership helpers, and session-state normalization live
under `domain/session/`.

## Display Organization

Display code is Phaser-specific and follows state rather than owning gameplay.
The important compatibility facades are:

- `display/placeholder-art.ts` -> generated texture families under
  `display/placeholder-art/`; player placeholder art is further split under
  `display/placeholder-art/player/` for geometry, full-frame humanoid textures,
  and segmented rig part textures, while actor placeholder art is split under
  `display/placeholder-art/actors/` for NPCs, creatures, monsters, and pets
- `display/player-rig.ts` -> segmented player body constants, pose solver,
  container wiring, and types under `display/player-rig/`; the pose solver is
  further split under `display/player-rig/pose/` for vector math, joint
  placement, part transforms/depths, animation phase defaults, and the solver
- `display/world.ts` -> player/camera, entities, objects, pickups, pets, HP bars,
  and shared body helpers under `display/world/`; player display is further
  split under `display/world/player/` for motion, camera, facing, aura, and sync,
  while pet display keeps `display/world/pets.ts` as the facade over sprite/body
  sync, remains drawing, and HP bar drawing modules under `display/world/pets/`
- `display/effects.ts` -> graphics primitives, weapon, arrow, attack, magic, and
  scene-effect drawing under `display/effects/`
- `display/animations.ts` -> player action state, timing, magic-cast overlays,
  NPC feedback, hit tweens, and generic visual feedback under
  `display/animations/`
- `display/collision-debug.ts` -> F4 debug overlay submodules under
  `display/collision-debug/`
- `display/particles.ts` -> particle texture setup, emitter lifecycle,
  spell-specific spawners, and magic-effect dispatch under `display/particles/`

The segmented player rig is visual-only. Player collision remains controlled by
the existing physics body and explicit movement state.

## Scene And UI Organization

`src/scenes/Game.ts` is the gameplay scene lifecycle shell. It now delegates
runtime-only concerns to `src/scenes/game-scene/`: dev window API installation,
pause/language bus subscriptions, and the per-frame gameplay update pipeline.
`src/scenes/game-scene-helpers.ts` is a compatibility facade over
`src/scenes/game-scene-helpers/`, where aim math, world timer installation,
pause/menu glue, modal action gates, pointer input, sidebar button handlers, and
keyboard bindings live in separate modules.

`src/scenes/PanelScenes.ts` is a compatibility facade for modal panel scenes.
`src/scenes/panels/ModalPanelScene.ts` owns the shared modal lifecycle and input
isolation, while the concrete backpack, quest, shop, forge, and magic scenes live
under `src/scenes/panels/`. The panel content itself is still DOM rendered by
`src/ui/*` modules. Modal scenes pause the gameplay scene and resume it on close.

`src/ui/wire.ts` only wires the persistent gear sidebar and menu behavior. The
main modal panels are now scene-owned.

`src/ui/backpack.ts` is a compatibility facade for backpack rendering and actions;
its concrete render, scene toggle, consumable-use, and gear-action modules live
under `src/ui/backpack/`.

`src/ui/menus.ts` is a compatibility facade for menu rendering. Save-slot rows
and actions, static submenu views, main-menu DOM sync, and pause-menu rendering
live under `src/ui/menus/`.

`src/ui/quest.ts` is a compatibility facade for quest UI. Current, guild, and
NPC quest HTML rendering lives in `src/ui/quest/render.ts`; QuestScene launch,
refresh, close, focus restoration, and panel close-handler registration live in
`src/ui/quest/scene.ts`.

`src/ui/forge.ts` is a compatibility facade for forge UI. Ring, material, and
weapon forge HTML plus panel refresh logic live in `src/ui/forge/render.ts`;
ForgeScene launch, close, pause/resume, cache clearing, and focus restoration
live in `src/ui/forge/scene.ts`.

`src/ui/shop.ts` is a compatibility facade for shop UI. Buy/sell shop HTML plus
panel refresh logic live in `src/ui/shop/render.ts`; ShopScene launch,
monster-form rejection, close, pause/resume, cache clearing, and focus
restoration live in `src/ui/shop/scene.ts`.

`src/ui/magic.ts` is a compatibility facade for magic UI. Study/book magic HTML,
input focus, and panel refresh logic live in `src/ui/magic/render.ts`;
MagicScene launch, close, pointer cleanup, pause/resume, cache clearing, and
focus restoration live in `src/ui/magic/scene.ts`.

`src/ui/gear.ts` is a compatibility facade for the gear sidebar. Event
subscription and initial sync live in `src/ui/gear/lifecycle.ts`; equipment and
material row HTML generation lives in `src/ui/gear/render.ts`.

`src/ui/stats.ts` is a compatibility facade for the stats sidebar. Event
subscription lives in `src/ui/stats/lifecycle.ts`, state-derived stat row
assembly lives in `src/ui/stats/selectors.ts`, and DOM rendering plus the legacy
`bindStatsEl` shim live in `src/ui/stats/render.ts`.

`src/ui/panels-helpers.ts` is a compatibility facade for shared modal HTML
helper functions. Helper implementations live under `src/ui/panels-helpers/` by
UI surface: shared headers/mod summaries, backpack details, forge requirements,
commerce material selling, magic cards, quest cards, and gear-derived flags.
Modal panel CSS follows the same surface split: `src/styles/modal-panels.css`
imports shared framing plus backpack, quest, trade/shop, forge, and magic input
style modules from `src/styles/modal-panels/`. Sidebar CSS now follows the same
pattern: `src/styles/sidebar.css` imports panel, stats, legend, actions, and gear
style modules from `src/styles/sidebar/`.

## Dependency Boundaries

The current accepted rules are pragmatic:

- `domain/` may import `runtime/state.ts` and runtime services because domain
  modules are stateful services, not pure functions.
- `domain/` should avoid direct Phaser GameObject access and DOM element access.
- Actor movement from domain is routed through `runtime/actor-movement.ts`; the
  default runtime fallback updates tile-space positions, and `display/physics.ts`
  registers the Phaser-backed mover that preserves body velocity and collision
  behavior in game.
- Dungeon scene-flow and game-flow reset/load display synchronization are routed
  through `runtime/display-sync.ts`; `display/physics.ts` registers body
  teleport, `display/index.ts` registers display rebuild, and domain code calls
  the runtime facade instead of direct display imports.
- Panel scene openings requested by domain object-use and NPC quest-panel code
  are routed through `runtime/panel-actions.ts`; UI scene modules register the
  concrete shop, forge, magic, guild quest, and NPC quest panel open handlers.
- Game-flow reset/load/save UI synchronization is routed through
  `runtime/game-flow-ui.ts`; UI modules register the concrete DOM cleanup,
  language, gear panel, menu cache, and main-menu render handlers.
- Browser storage access is centralized through `runtime/browser-storage.ts`;
  language settings, save slots, and debug log patterns own their domain/runtime
  semantics while sharing guarded localStorage access.
- A 2026-06-03 production-source scan found no direct `src/domain` imports of
  `src/display` or `src/ui`. Domain side effects that need visuals or DOM UI now
  route through runtime adapters or events. Magic-cast responses, magic-effect
  particle spawning, player/NPC interaction feedback, player attack placeholder
  visuals, entity hit-tween feedback, and bow stat-refresh UI updates are
  event-driven: domain emits `Events.MAGIC_CAST_BEGIN`,
  `Events.MAGIC_CAST_RESOLVE`, `Events.MAGIC_CAST_INTERRUPTED`,
  `Events.MAGIC_EFFECT_SPAWNED`, `Events.PLAYER_INTERACTED`,
  `Events.ENTITY_INTERACTED`, `Events.PLAYER_ATTACK_STARTED`,
  `Events.ENTITY_HIT`, and `Events.PLAYER_STATS`; display animation/particle
  code owns charge, release, cleanup, interaction feedback, attack placeholder
  feedback, entity hit tweens, and particle visual state, while UI code owns
  MagicScene closing and stats refresh in response.
- `display/` may import `domain/`, `runtime/`, `data.ts`, and Phaser.
- `ui/` may import domain/runtime state and DOM helpers, but should not create or
  mutate Phaser GameObjects.
- `scenes/` can orchestrate all lower layers and should be the place where Phaser
  scene lifecycle decisions live.

Known boundary notes:

- The current `src/domain/` scan has no direct `ui/` imports, including tests.
  It also no longer imports `display/animations` from magic domain tests; visual
  magic-cast event coverage lives under `src/display/animations.test.ts`.
  Domain, runtime, UI, display, and modal-scene tests that need Phaser
  reachability use shared fixtures from `src/test-support/`; feature-specific
  fixtures own only their fake scene/emitter/panel helpers. Magic domain fixtures
  avoid DOM setup; UI-facing regression coverage that exercises DOM panel
  behavior belongs under `src/ui/` or `src/scenes/`.

Do not attempt to invert all dependencies in one pass. Move remaining direct
side effects behind runtime events or service adapters only when touching the
related feature.

## Text Localization

`src/domain/i18n.ts` is a compatibility facade for interface localization. The
static UI text catalog is assembled by `src/domain/i18n/catalog.ts` from
language-specific modules under `src/domain/i18n/catalog/`, language options and
validation live in `options.ts`, and localStorage read/write helpers live in
`storage.ts`. `runtime/state.ts` reads the pure storage helper directly during
initial state construction, while UI code continues using the stable facade API.

## Static Data

`src/data.ts` is the compatibility facade for the authoritative static catalog.
The concrete catalog modules live under `src/data/` so world labels, bestiary,
gear, materials, resources, forge recipes, pets, magic, quests, and grave
constants can be reviewed independently. The bestiary catalog keeps the public
`bestiary` export in `src/data/bestiary.ts` while splitting wildlife, common
monsters, and elite/demon entries into focused modules. Current top-level keys are:

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

Keep data edits explicit and test them through the relevant domain or runtime
probe. Static data tests are split by responsibility: `src/data.test.ts` guards
the facade, count shape, and grave decay constants, `src/data-gear.test.ts`
guards initial gear plus gear catalog shape, `src/data-forge.test.ts` guards
forge recipes and material
forge-mod output, `src/data-world.test.ts` guards world labels, resources,
materials, and pets, `src/data-bestiary.test.ts` guards
bestiary entries/drops, `src/data-quests.test.ts` guards quest templates, and
`src/data-magic.test.ts` guards magic aliases and casting-shape requirements.
Do not bury data migration inside display or UI code.

## Compatibility Facade Pattern

When splitting a file that many callers import, keep the original file as a
small re-export facade. This has been the safest organization pattern in this
repo because it reduces call-site churn and lets behavior-focused tests prove the
split.

Recommended split flow:

1. identify exported symbols and callers
2. create responsibility-focused submodules
3. move implementation without changing function signatures
4. leave the original module as a re-export facade
5. run targeted tests first, then full validation when behavior-adjacent code was
   touched
6. update `PROJECT_AUDIT.md`

## Validation

Package scripts:

- `npm run typecheck`
- `npm run test:unit`
- `npm run build`
- `npm run lint`
- `npm test` with `PROBE_BASE_URL=http://150.65.181.206:<port>/`

Current expected state:

- typecheck passes
- unit tests pass: 82 files / 244 tests
- build passes with existing Vite chunk warning
- lint passes with 0 errors and 0 warnings
- runtime probe runner passes 11 suites with 0 failures when a dev server is
  available
- the combat checklist probe is split into a small runner plus grouped
  Playwright checks under `test/probe-combat-checklist/` for enemy AI, player
  damage/death, movement/world, pet/loot, magic/quest, and world-system
  behavior; player damage/death is further split into damage mitigation, thorns,
  and defeat/respawn modules; movement/world checks are further split into
  player movement, pickups, pet/entity outcomes, and hit-stop modules; the
  standalone probe passes 24/24 checks against
  `http://150.65.181.206:5175/`
- the UI-flow probe is split into a small runner plus grouped panel click
  checks under `test/probe-ui-flows/`; the standalone probe passes with 0
  failures against `http://150.65.181.206:5175/`
- the comprehensive E2E probe is split into a small runner plus grouped
  gameplay checks under `test/probe-e2e/`; shared harness responsibilities are
  split into public types, reporter/step handling, canvas helpers, and state
  snapshots; the standalone probe passes with 0 failures against `http://150.65.181.206:5175/`
- the deep domain API probe is split into a small runner plus grouped checks
  under `test/probe-deep/`; the standalone probe passes with 0 failures against
  `http://150.65.181.206:5175/`
- the weapon probe is split into a small runner plus grouped weapon case, attack
  path, catalog equip, and bow charge/release checks under `test/probe-weapons/`;
  the standalone probe passes 5/5 checks against `http://150.65.181.206:5175/`
- the diagnostic dump probe keeps `test/probe-dump.ts` as a small runner over
  Playwright boot/log capture, screenshot/state snapshots, scenario steps, and
  report writing modules under `test/probe-dump/`; the `dodge` scenario passes
  with 0 console errors and 0 invariant breaks against
  `http://150.65.181.206:5175/`
- the live combat probe keeps `test/probe-live-combat.ts` as a small runner over
  Playwright boot/reporting/cleanup helpers and grouped real-frame combat
  checks under `test/probe-live-combat/`; the standalone probe passes 4/4
  checks against `http://150.65.181.206:5175/`
- the comprehensive functional probe keeps `test/probe-comprehensive.ts` as a
  small runner over shared Playwright/error/tally helpers and grouped boot,
  race, panel, combat, movement, pause, stats, and persistence phases under
  `test/probe-comprehensive/`; those phases are split into focused boot/new-game,
  panels, gameplay actions, pause/status, and persistence modules; the standalone
  probe passes 21/21 checks against
  `http://150.65.181.206:5175/`
- the portal runtime probe keeps `test/probe-portal-runtime.ts` as a small
  runner over shared Playwright/error/setup helpers and grouped road-sign, portal
  metadata, landing, and repeated round-trip checks under
  `test/probe-portal-runtime/`; the standalone probe passes against
  `http://150.65.181.206:5175/`
- runtime input tests keep shared Phaser keyboard/fake-scene setup in
  `src/runtime/input.test-fixtures.ts`; movement/dodge, action routing, and
  pointer/focus regressions are split across dedicated input test files
- magic tests keep shared Phaser reachability, runtime reset, and dynamic spell
  setup in `src/domain/magic.test-fixtures.ts`, while `src/domain/magic.test.ts`
  and `src/domain/magic-instant.test.ts` keep MP drain, interruption, and
  instant-cast assertions focused. UI-facing MagicScene and pointer cleanup
  regressions live under `src/ui/magic-panel-input.test.ts`
- combat damage tests keep shared state reset and monster/pet factories in
  `src/domain/combat/damage.test-fixtures.ts`, while player damage, pet
  damage/death, and loot/defeat facade checks are split by concern
- AI tests keep shared display/magic mocks, state reset, and monster/pet
  factories in `src/domain/ai.test-fixtures.ts`, while aggro/remains, pet
  combat, and entity combat facade checks are split by concern
- death tests keep shared respawn/package state reset in
  `src/domain/death.test-fixtures.ts`, while respawn/lost-package recovery,
  inventory loss, and corruption/fatigue checks are split by concern
- portal tests keep shared reset, portal/sign lookup, and spawn helpers in
  `src/domain/portal.test-fixtures.ts`, while target-spawn/bidirectional checks
  and fallback/auto-trigger checks are split by concern
- quest tests keep shared reset and actor factory helpers in
  `src/domain/quest.test-fixtures.ts`, while major quest, small delivery quest,
  and reward/status facade helper checks are split by concern
- persistence tests keep shared reset and save-record factory helpers in
  `src/domain/persistence.test-fixtures.ts`, while save-record construction, slot
  CRUD/latest, and time-format checks are split by concern
- inventory tests keep shared state reset in
  `src/domain/inventory.test-fixtures.ts`, while material/resource, gear, and pet
  facade checks are split by concern
- NPC memory tests keep shared ownership reset plus NPC/pet factories in
  `src/domain/npc-memory.test-fixtures.ts`, while relationship memory, legacy
  ownership migration, and current-player pet filtering are split by concern
- economy tests keep shared reset and action-object helpers in
  `src/domain/economy.test-fixtures.ts`, while formulae/ingredients, commerce,
  and forge action checks are split by concern
- player-rig pose regression tests are split by concern: structure/layering,
  locomotion/idle breathing, and magic-casting overlays
- static data tests are split by catalog responsibility: facade/counts/grave decay,
  gear, forge/material mods, world labels/resources/materials/pets, bestiary,
  quest type templates, and magic integrity
- world domain facade coverage verifies that the stable `src/domain/world.ts`
  entry point still re-exports the split map, region, object, entity, and pickup
  helpers by reference
- world-spawn tests verify `src/domain/world-spawn.ts` clears world collections,
  dispatches to split scene spawners, and syncs lost-package pickups with
  concrete scene spawners mocked
- dungeon tests verify the stable `src/domain/dungeon.ts` facade wiring without
  executing scene transitions or procedural generation
- game-flow tests verify the stable `src/domain/game-flow.ts` facade wiring
  without executing reset, save, load, continue, or delete flows
- map-exit tests verify the stable `src/domain/map-exits.ts` facade plus exit
  config uniqueness, bounds, scene references, and lookup-helper alignment
- teleport tests verify the stable `src/domain/teleport.ts` facade plus cooldown
  shape, portal target-resolution priority, and static portal spawn-table labels
  and fallback points without executing scene transitions
- lost-package tests verify the stable `src/domain/lost-packages.ts` facade and
  pure recoverable-content detection without creating or claiming packages
- magic-casting tests verify the stable `src/domain/magic-casting.ts` facade and
  the no-pending-cast empty interrupt path
- magic-input tests verify the stable `src/domain/magic-input.ts` facade plus
  pure normalization, alias, forbidden-phrase, and near-name matching helpers

## Current Cleanup Priorities

Use `PROJECT_AUDIT.md` as the working checklist. The final remaining-scope audit
has been recorded there for display, runtime, UI/scenes, probes, static data,
documentation/statistics, validation, and Git status. Remaining work is now
operational rather than architectural: keep tests/probes deterministic, keep
generated outputs (`dist/`, `test-output/`) out of source review unless
explicitly requested, and decide whether the large organized worktree should be
staged/committed/pushed as one change set or split into topic commits.
