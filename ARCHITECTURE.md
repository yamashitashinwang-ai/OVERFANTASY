# OVERFANTASY · Engine-First Architecture

> Reference target: Phaser 4 API — https://docs.phaser.io/api-documentation/api-documentation
>
> This document is the authoritative architectural map for the migration from
> the legacy single-file `Game.js` ("God File") to an engine-native, layered
> codebase. It defines the directory blueprint, the module-size budget, and the
> phased migration roadmap.

---

## 1. Layer Model

Four concentric layers, with dependencies flowing **outward → inward** only.
Inner layers never import from outer ones.

```
                                      ┌───────────────────┐
                                      │   data.js         │  static config
                                      └───────────────────┘
                                              ▲
                       ┌──────────────────────┴──────────────────────┐
                       │                domain/                       │  pure rules
                       │  math · session · i18n · persistence ·       │  (no DOM,
                       │  magic-input · combat · quest · ai · world · │   no engine)
                       │  inventory · economy · npc · player          │
                       └──────────────────────┬──────────────────────┘
                                              ▲
                       ┌──────────────────────┴──────────────────────┐
                       │                runtime/                      │  engine glue
                       │   events · input · timers · registry         │  (Phaser bus,
                       │                                              │   no game rules)
                       └──────────────────────┬──────────────────────┘
                                              ▲
                ┌─────────────────────────────┼─────────────────────────────┐
                │                             │                             │
        ┌───────┴────────┐           ┌────────┴────────┐          ┌────────┴────────┐
        │   scenes/      │           │    display/     │          │      ui/        │
        │  Boot · Menu · │           │  tilemap · GO · │          │  panels · menus │
        │  Game · Hud ·  │           │  fx · physics · │          │  (HTML or       │
        │  Pause · Panels│           │  hud · particles│          │   canvas DOM)   │
        └────────────────┘           └─────────────────┘          └─────────────────┘
                                              ▲
                                              │
                                      ┌───────┴────────┐
                                      │    main.js     │  Phaser config + scene list
                                      └────────────────┘
```

**Dependency rules**

| Layer       | Imports from                          | Forbidden imports                   |
|-------------|---------------------------------------|-------------------------------------|
| `domain/`   | `data.js`, sibling domain modules     | `display/`, `scenes/`, `ui/`, DOM, Phaser GameObjects |
| `runtime/`  | Phaser (event emitter / time / input only), `domain/` | `display/`, `scenes/`, `ui/`        |
| `display/`  | Phaser, `runtime/`, `domain/`, `data.js` | `scenes/`, `ui/`                    |
| `scenes/`   | everything below                      | sibling scenes (use Phaser scene manager) |
| `ui/`       | `runtime/events.js`, `domain/`, DOM   | `scenes/`, `display/`, Phaser GameObjects |

---

## 2. Target Directory Blueprint

```
phaser/src/
├── main.js                       # ~25 lines · Phaser config + scene list
├── data.js                       # static catalog (regions, bestiary, gear…)
│
├── runtime/                      # engine glue, no rules
│   ├── events.js                 # singleton Phaser.EventEmitter bus + Events enum
│   ├── input.js                  # keyboard wrappers (movement vector, action keys)
│   ├── timers.js                 # startCooldown · schedulePeriodic · scheduleOnce
│   └── registry.js               # state-on-Phaser-DataManager facade  (planned)
│
├── domain/                       # pure JS rules, engine-agnostic
│   ├── math.js                   # clamp/dist/rand/normalize/escapeHtml…
│   ├── session.js                # ownership + ids + multiplayer-ready helpers
│   ├── i18n.js                   # uiText catalog + t(), setLanguage emits LANGUAGE_CHANGED
│   ├── persistence.js            # save-slot localStorage + record (de)serialisation
│   ├── magic-input.js            # spell-name normalisation + fuzzy matching
│   ├── combat/                   # (planned)
│   │   ├── weapon.js             #   currentWeapon / totalAtk / totalDef / gear mods
│   │   ├── attack.js             #   playerAttack / attackSpec / nearestAttackTarget
│   │   ├── damage.js             #   damagePlayer / damagePet / defeatEntity
│   │   └── race.js               #   raceDamageMultiplier and family
│   ├── magic.js                  # (planned) beginCast / resolveCast / mp regen
│   ├── quest.js                  # (planned) accept / settle / track / reward
│   ├── world.js                  # (planned) makeMap / spawnWorld / regions / scene flow
│   ├── dungeon.js                # (planned) generateDungeon
│   ├── ai/
│   │   ├── entity.js             # (planned) updateEntities
│   │   └── pet.js                # (planned) updatePets · pet-remain decay
│   ├── inventory/                # (planned)
│   │   ├── gear.js               #   equipGear / gearBag / gear-mod application
│   │   ├── materials.js          #   addMaterial / materialSummary
│   │   ├── resources.js          #   wood/stone/etc resource bag
│   │   └── pets.js               #   makePet / adoptPet
│   ├── economy/                  # (planned)
│   │   ├── shop.js               #   buyPotion / buyArrows / sellMaterial
│   │   └── forge.js              #   forgeRing / forgeMaterial / forgeWeapon
│   ├── npc.js                    # (planned) talkOrUse / chatWithNpc / gift
│   └── player.js                 # (planned) updatePlayer (input→velocity, stamina)
│
├── display/                      # engine-native rendering (DONE)
│   ├── runtime.js                # mutable D object (Phaser GameObject refs)
│   ├── colors.js                 # hex→int helpers
│   ├── tiles.js                  # programmatic tileset texture
│   ├── physics.js                # Arcade bodies + colliders
│   ├── world.js                  # tilemap + entity/pet/object/pickup sync
│   ├── effects.js                # weapons + arrows + attack AoE rings
│   ├── hud.js                    # fixed-to-camera HUD bars/text
│   ├── animations.js             # tween-driven hit feedback
│   ├── particles.js              # ParticleEmitter spell visuals
│   └── index.js                  # orchestrator + re-exports + initDisplay
│
├── scenes/
│   ├── Boot.js                   # asset preload + transition to Menu
│   ├── Menu.js                   # (planned) main-menu scene (race select, save load)
│   ├── Game.js                   # core world scene — slim under target
│   ├── Hud.js                    # (planned) parallel HUD overlay scene
│   ├── Pause.js                  # (planned) modal pause scene
│   └── Panels.js                 # (planned) modal panel scene (backpack/quest/shop/forge/magic)
│
└── ui/                           # (planned) HTML or canvas UI components
    ├── panels/
    │   ├── stats.js              # subscribes to PLAYER_STATS bus event
    │   ├── gear.js               # subscribes to GEAR_EQUIPPED · INVENTORY_CHANGED
    │   ├── backpack.js           # subscribes to PANEL_OPEN/CLOSE + INVENTORY_CHANGED
    │   ├── quest.js              # subscribes to QUEST_* events
    │   ├── shop.js               # subscribes to economy events
    │   ├── forge.js              # subscribes to economy events
    │   └── magic.js              # subscribes to MAGIC_* events
    ├── menus/
    │   ├── main.js               # subscribes to GAME_NEW / GAME_LOADED
    │   └── pause.js              # subscribes to GAME_PAUSED / GAME_RESUMED
    └── toast.js                  # subscribes to TOAST_SHOWN
```

---

## 3. Module-Size Budget

* **Hard ceiling per file:** 300 lines (excluding imports / comments).
* **Soft target:** 150 lines. Modules close to 300 are split further.
* **Exception:** `domain/i18n.js` is exactly the text catalog; size is data-driven.

Current scoreboard (Phase-1 done · Phase-2 mostly done · Phase-3 started):

| Path                                  | Lines | Budget |
|---------------------------------------|------:|-------:|
| `runtime/events.js`                   |   65  | ≤ 300 ✓ |
| `runtime/input.js`                    |   71  | ≤ 300 ✓ |
| `runtime/timers.js`                   |   56  | ≤ 300 ✓ |
| `domain/math.js`                      |   74  | ≤ 300 ✓ |
| `domain/session.js`                   |   88  | ≤ 300 ✓ |
| `domain/i18n.js`                      |  291  | ≤ 300 ✓ (catalog) |
| `domain/persistence.js`               |  103  | ≤ 300 ✓ |
| `domain/magic-input.js`               |   78  | ≤ 300 ✓ |
| `domain/world.js`                     |  210  | ≤ 300 ✓ |
| `domain/world-spawn.js`               |  166  | ≤ 300 ✓ |
| `domain/ai.js`                        |  167  | ≤ 300 ✓ |
| `domain/quest.js`                     |  181  | ≤ 300 ✓ |
| `domain/magic.js`                     |  234  | ≤ 300 ✓ |
| `domain/inventory.js`                 |  182  | ≤ 300 ✓ |
| `domain/economy.js`                   |  109  | ≤ 300 ✓ |
| `domain/combat/weapon.js`             |   94  | ≤ 300 ✓ |
| `domain/combat/race.js`               |  102  | ≤ 300 ✓ |
| `domain/combat/damage.js`             |  184  | ≤ 300 ✓ |
| `scenes/Pause.js`                     |   68  | ≤ 300 ✓ |
| `ui/stats.js`                         |   77  | ≤ 300 ✓ |
| `display/world.js`                    |  285  | ≤ 300 ✓ |
| `display/effects.js`                  |  268  | ≤ 300 ✓ |
| `display/particles.js`                |  203  | ≤ 300 ✓ |
| `domain/combat/targeting.js`          |  121  | ≤ 300 ✓ (split from old attack.js) |
| `domain/combat/bow.js`                |  168  | ≤ 300 ✓ (split from old attack.js) |
| `domain/combat/actions.js`            |  155  | ≤ 300 ✓ (split from old attack.js) |
| `domain/combat/damage.js`             |  184  | ≤ 300 ✓ |
| `domain/npc.js`                       |  248  | ≤ 300 ✓ |
| `domain/magic.js`                     |  236  | ≤ 300 ✓ |
| `domain/dungeon.js`                   |  115  | ≤ 300 ✓ |
| `domain/player.js`                    |   87  | ≤ 300 ✓ |
| **`scenes/Game.js`**                  | **1974** | **▲ shrinking — was 4400+, ~55% reduction. Remainder: 16 HTML `render*` functions + scene `create()` setup, both pending Phase 3.** |

**Every domain / runtime / display / ui / scene file is now within the 300-line budget except Game.js itself**, which will be carved up the rest of the way in Phase 3 (UI extraction + multi-scene split).

---

## 4. Event-Bus Contract (the *bridge*)

A singleton `Phaser.Events.EventEmitter` exported from `runtime/events.js`.
Domain services **publish** facts; scenes / display / UI **subscribe**.

```
[ Domain ]  ───emit───►  [ bus ]  ───on────►  [ Scene · Display · UI ]

PLAYER_HURT       { amount, source }
PLAYER_STATS      (any stat change)
ENTITY_HIT        { entity, critical }
ENTITY_DEFEATED   { entity, byPet?, byPlayer? }
QUEST_ACCEPTED    { quest }
QUEST_SETTLED     { quest, reward }
MAGIC_CAST_BEGIN  { spell }
MAGIC_CAST_RESOLVE{ spell, target?, damage? }
INVENTORY_CHANGED ()
GEAR_EQUIPPED     { slot, gearId }
PANEL_OPEN / PANEL_CLOSE  { id }
LANGUAGE_CHANGED  { language }
TOAST_SHOWN       { text }
LOG_APPENDED      { text }
GAME_NEW / GAME_LOADED / GAME_PAUSED / GAME_RESUMED / GAME_SAVED
SCENE_LOADED      { scene }
DUNGEON_ENTERED / DUNGEON_LEFT
```

Subscription side-effects (UI re-render, particle spawn, autosave, etc.) live
in the layer that owns them — never inside `domain/`.

---

## 5. Phased Migration Roadmap

> Each phase keeps the game **bootable and playable** at HEAD. No "big-bang"
> rewrite. Order matters — earlier phases unblock later ones.

### Phase 1 · Inputs & Timers   *(DONE)*

Foundational because every other subsystem depends on them.

| Step                                               | Status |
|----------------------------------------------------|:------:|
| `runtime/events.js` event bus singleton             | ✅ |
| `runtime/input.js` Phaser-keyboard wrapper          | ✅ |
| `runtime/timers.js` `startCooldown` tween, `schedulePeriodic`, `scheduleOnce` | ✅ |
| Purge `window.addEventListener('keydown/up')`      | ✅ |
| Purge `state.X -= dt` decrement loops              | ✅ |
| Convert `toastTimer`, `dayClock`, `newsClock`, `spawnClock` to engine timers | ✅ |

### Phase 2 · Domain Service Extraction   *(in progress)*

Order matters: extract leaves first (no upstream deps) so each pull is safe.

| Order | Module                | Status | Notes |
|------:|-----------------------|:------:|-------|
| 1     | `domain/math.js`      | ✅ | leaf, no state |
| 2     | `domain/session.js`   | ✅ | leaf, depends only on `state` |
| 3     | `domain/i18n.js`      | ✅ | emits LANGUAGE_CHANGED; DOM refresh stays in Game.js subscriber |
| 4     | `domain/persistence.js` | ✅ | localStorage I/O isolated |
| 5     | `domain/magic-input.js` | ✅ | pure text normalisation + fuzzy match |
| 6     | `domain/combat/weapon.js` | ✅ | weapon stats + gear mods |
| 7     | `domain/combat/race.js`   | ✅ | race multipliers + starting loadout |
| 8     | `domain/combat/damage.js` | ✅ | damagePlayer/damagePet/defeatEntity + loot drops |
| 9     | `domain/world.js` + `domain/world-spawn.js` | ✅ | makeMap, factories, per-scene spawn tables |
| 10    | `domain/ai.js`        | ✅ | `updateEntities` + `updatePets` + `updatePetRemains` |
| 11    | `domain/quest.js`     | ✅ | accept/settle/track; ready to emit QUEST_* |
| 12    | `domain/magic.js`     | ✅ | beginCast / resolveCast / mp regen + zone tick |
| 13    | `domain/inventory.js` | ✅ | gear bag, materials, resources, pet adoption |
| 14    | `domain/economy.js`   | ✅ | shop + forge (sellMaterial, buyPotion, forgeRing/Material/Weapon) |
| 15    | `domain/combat/attack.js` | ✅ | attack specs + target search + bow + actions + feedback (415 lines, scheduled to split into `targeting.js` + `bow.js` + `actions.js`) |
| 16    | `domain/dungeon.js`   | ✅ | loadScene / enterDungeon / leaveDungeon / generateDungeon |
| 17    | `domain/npc.js`       | ✅ | talkOrUse / chatWithNpc / gift / rest / helpWounded / handlePetRescue / worldNews |
| 18    | `domain/player.js`    | ✅ | updatePlayer + pickupItems |

**Phase 2 complete — all 18 domain modules extracted.** Total domain layer:
~2,985 lines across 18 files. Game.js shrank from 4,400+ to under 2,000.

### Phase 3 · UI / Scene split   *(in progress)*

| Step | Status | Description |
|------|:------:|-------------|
| 3.1  | ✅ | **All 16 `render*` functions extracted into `ui/*.js`** focused modules (`stats`, `gear`, `backpack`, `shop`, `forge`, `magic`, `quest`, `menus`). Each is 45–90 lines, under budget. A shared `ui/cache.js` holds the per-panel HTML caches; `ui/dom.js` lazy-resolves DOM element refs; `ui/wire.js` centralises every `data-X-action` click dispatcher. The 16 panel render functions + 165 lines of event-listener wiring moved out of Game.js. |
| 3.2  | ✅ | **MenuScene shipped** (`scenes/Menu.js`). GameScene now: `init defaults → launch MenuScene → scene.pause`. `startNewGame`/`startLoadedSave` emit `GAME_NEW`/`GAME_LOADED`; MenuScene catches them and resumes GameScene. "Main Menu" from PauseScene also re-launches MenuScene + pauses GameScene. **All three modes (Menu / Game / Pause) are now independent parallel Phaser scenes**, coordinated entirely by `scene.launch / pause / resume / stop`. The `appMode` flag is reduced to a debug breadcrumb — every check on it could now be `scene.isActive('XScene')`. |
| 3.2a | ✅ | **PauseScene** — first parallel overlay scene shipped (`scenes/Pause.js`). GameScene now does `this.scene.launch('PauseScene'); this.scene.pause();` on Esc; PauseScene resumes via `this.scene.resume('GameScene')`. Buttons are wired through `bus.emit(PANEL_CLOSE, { id:'pause', action })` so no direct calls leak across the scene boundary. **This is the reference implementation other modal scenes follow.** |
| 3.3  | ⏳ | Move modal-stack logic (`isModalOpen / closers`) into `PanelsScene` — it owns its own scene plugin and reports open/close via PANEL_OPEN/CLOSE bus events. |
| 3.4  | ⏳ | (Optional) Promote HTML panels to Canvas-native Phaser UI in `PanelsScene`. The event-driven bridge means swapping the implementation requires no domain-layer changes. |

### Phase 4 · State on the registry   *(reference shipped)*

| Step | Status | Description |
|------|:------:|-------------|
| 4.1  | ✅ | **`runtime/registry.js` shipped.** Exposes `seedRegistry(scene, state)` + `syncRegistry(state)` + `getPlayerStat(key)` + `onPlayerStat(key, fn)` over `scene.registry` (Phaser DataManager). GameScene seeds tracked player stats (hp/mp/stamina/gold/atk/def/cooldowns/race/job) on create() and diffs+publishes them every frame, so cross-scene subscribers can listen for `changedata-player.hp` etc. without polling the legacy state object. |
| 4.2  | ⏳ | Move per-scene runtime state (active entity list, current map data) into scene properties (`this.entities`, `this.map`) rather than the shared `state` object. |
| 4.3  | ⏳ | `domain/persistence.js` serialises the registry snapshot + scene data; deserialise into the registry on load. |

### Phase 5 · Engine-native polish

| Step | Description |
|------|-------------|
| 5.1  | Replace `Arc` GameObjects with `Sprite` + texture atlas (open the door to walk-cycle animations). |
| 5.2  | Add `this.sound.play()` hooks behind bus events (`ENTITY_HIT`, `PLAYER_HURT`, …). |
| 5.3  | Add post-FX (`cameras.main.postFX.addBloom()`) on magic effect resolve. |
| 5.4  | Entity-vs-entity Arcade collisions (single `physics.add.collider(entitiesGroup, entitiesGroup)`). |

---

## 6. Stability Gates

After each phase, the build + smoke test must pass:

```
$ npm run build           # zero errors, no new chunks over budget
$ node /tmp/probe.mjs      # game boots, no JS errors, menu → race → playing
```

Pull requests touch one module at a time, with the `Game.js` re-export façade
kept stable until Phase 4 lands. Display modules continue to read game state
through the `state` re-export from `scenes/Game.js`, so each domain extraction
is a *move + delegate* change rather than a wide API refactor.

---

## 7. Why this ordering

| Concern                          | Why it ships first                          |
|----------------------------------|---------------------------------------------|
| Inputs & timers                  | Every other layer reads them. If they leak DOM/`dt`, every later extraction inherits the leak. |
| Pure domain leaves (math, session, i18n, persistence, magic-input) | Zero upstream deps. Cheapest moves, build confidence + tooling. |
| Combat / quest / world           | Bigger but well-bounded; depend only on leaves + bus events.   |
| AI                               | Reads world + combat domains; must come *after* them.          |
| UI & scenes                      | Last because they consume the bus events that all earlier phases emit; rewriting them before the domains stabilise would produce churn. |
| Registry & sprites               | Polish — only meaningful once the domain boundary is final.    |
