# Migration Notes

## 2026-05-29 - Runtime portal coordinate overwrite

### Symptom

Portal unit tests passed, but in real gameplay the player could arrive on the target map at the coordinates used to trigger the portal on the source map.

The affected runtime path was:

- `field` north portal (`north_exit_to_forest`) to `forest:south_entry_from_village`
- `forest` south portal (`south_exit_to_village`) to `field:north_entry_from_forest`

### Real Cause

The portal metadata and target spawn resolution were correct. The real issue happened after scene loading:

1. `loadScene` / `enterDungeon` set `state.player.x` and `state.player.y` to the target spawn coordinates.
2. The existing Phaser player physics body was still positioned at the old source-map coordinates.
3. On the next frame, `syncStateFromBodies()` treated the physics body as the source of truth.
4. That copied the old body position back into `state.player.x/y`, overwriting the correct target spawn.

So the bug was not that `teleportThroughPortal` chose the wrong target. It was a display/physics synchronization ordering bug after the target coordinates were set.

### Fix

After setting the target entrance coordinates in state, immediately synchronize the Phaser player physics body to the same target coordinates before the next frame can run.

Current fix:

- `loadScene` sets `state.player.x/y`.
- `enterDungeon` sets `state.player.x/y`.
- `rebuildDisplayIfReady()` calls `teleportBody(state.player)` before rebuilding display objects.
- The next `syncStateFromBodies()` then reads the already-correct body position.

### Regression Coverage

Keep `test/probe-portal-runtime.ts` in the full probe suite. It verifies the real runtime interaction path instead of only unit-level portal calls:

- Builds a real `field` scene.
- Finds the real `north_exit_to_forest` portal object.
- Triggers interaction through the same runtime input path.
- Confirms final position is `forest:south_entry_from_village`.
- Builds a real `forest` scene.
- Finds the real `south_exit_to_village` portal object.
- Confirms final position is `field:north_entry_from_forest`.
- Waits briefly after teleport so a stale physics body cannot silently overwrite the target coordinates.

This probe is intentionally retained to prevent future regressions where unit tests pass but the live Phaser body/state path diverges.

### Scope Guard

This note documents only the portal coordinate synchronization fix. It does not add or change combat, backpack, shop, forge, magic, race, death, or corruption systems.

## 2026-05-29 - Automatic map exit zones

### Change

Outdoor region-boundary transitions no longer require standing near a portal object and pressing the interaction key.

The old region-boundary portal connection data is still used, but `addPortal` now produces:

- a visual `roadSign` object for the old sign/label location
- a hidden walkable `mapExit` trigger zone at the appropriate map edge
- road tiles leading into that edge zone so the exit reads as a path out of the map

The original sign is now only a route marker. It does not carry a portal action and does not trigger map travel.

### Teleport Type Boundaries

There are two supported map-transition categories:

1. Region-boundary exits

   These connect two outdoor regions, such as White Bell Village / Morningwind Field to Spiritwood Forest. They should use protruding, walkable exit zones near the map edge and trigger automatically when the player enters the exit zone.

2. Interior map entrances

   These enter dungeons, buildings, underground spaces, ruins interiors, old royal city entrances, and similar contained spaces. They can be placed inside a map and do not need to sit on a map edge. Whether they auto-trigger or require interaction is a per-scene design choice.

`旧王城入口` is an interior map entrance, not a region-boundary exit. It should not be converted into an edge exit zone just because it changes the player's location.

### Execution Layer

The teleport execution layer was not rewritten.

Automatic exits still call the existing `teleportThroughPortal` path, so map changes continue to resolve:

1. source map exit zone
2. target map id
3. target spawn id
4. target map spawn coordinates

The target position is still taken from the target map entrance table. It does not use the player's current source-map coordinates.

### Verified Route

`test/probe-portal-runtime.ts` now covers the live runtime path without pressing the interaction key:

- standing near the old `north_exit_to_forest` road sign does not teleport
- stepping into the `field:north_exit_to_forest` exit zone lands at `forest:south_entry_from_village`
- stepping into the `forest:south_exit_to_village` exit zone lands at `field:north_entry_from_forest`
- different positions inside the same exit zone still land at the same fixed target entrance
- three repeated field/forest round trips keep the same target spawn coordinates
- a short wait after each transition verifies that stale physics bodies do not overwrite the target position

### Scope Guard

This change only modifies portal trigger behavior and related map-edge road presentation. It does not add or change combat, backpack, shop, forge, magic, race, death, corruption, quests, UI systems, or maps.
