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
