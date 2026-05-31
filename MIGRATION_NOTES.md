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

## 2026-05-29 - Placeholder RPG readability pass

### Change

The world renderer now uses generated placeholder RPG art instead of bare circles and rectangles:

- generated terrain tiles show grass, roads, forest ground, walls, water, mountains, ruins, and related surface patterns
- player, NPCs, friendly creatures, pets, and each current monster species use distinct placeholder silhouettes
- shops, guilds, forges, shrines, magic cottages, houses, road signs, and dungeon/keep entrances use recognizable placeholder facility icons
- pickups draw different icons for herbs, potions, gold, materials/resources, arrows, gear, cleanse items, and lost packages

This is not final art. It is a readability pass so object categories are identifiable during play.

### Collision Separation

Visual sprites/images do not create or decide movement collision.

Current separation:

- the player still uses the existing small physics anchor/body for movement, while the taller character sprite is purely visual
- NPCs, monsters, and pets use hidden movement bodies plus separate visual sprites
- pickups remain non-colliding and only use pickup range checks
- map exit zones remain hidden non-colliding trigger areas
- buildings/facilities use separate invisible static collision rectangles instead of deriving collision from their visible sprite size

### Debug Overlay

`F4` toggles a pure display-only collision/range overlay. It only reads existing collision bodies, wall/water tiles, object interaction ranges, pickup ranges, monster combat ranges, and map exit trigger rectangles. It does not create, modify, or choose any collision logic.

### Scope Guard

This change is visual/debug-display only. It does not add or change combat, backpack, shop, forge, magic, race, death, corruption, map teleport execution, quests, or maps.

## 2026-05-29 - Static environment prop placement

### Change

The placeholder art pass now appears in the actual world population:

- White Bell Village / Morningwind Field has a small number of trees, bushes, and a static guild-front flag
- Spiritwood Forest has denser trees, bushes, and leaf piles so it reads differently from the village field
- the guild flag is a future wind-direction cue placeholder only; it has no animation or gameplay effect

### Collision Separation

Environment props use the same visual/collision split as the readability pass:

- trees use a small trunk/bottom collision profile
- tree crowns do not block movement
- bushes, leaves, and the flag are non-colliding
- environment props are skipped by nearest-object interaction selection, so they do not consume interaction input

### Scope Guard

This change only places static environment decoration. It does not add or change movement, map teleport logic, combat, backpack, shop, forge, magic, race, death, corruption, quests, or gameplay systems.

## 2026-05-29 - Basic character action states

### Change

The placeholder character art now has visual-only action states on top of the existing readable sprites:

- player idle and 8-direction walk remain in place
- player run uses separate generated run frames while keeping the same movement logic
- player interaction, hurt, and generic attack use short placeholder visual overrides
- NPCs keep their idle sprite and get a brief non-gameplay reaction when interacted with
- attack hook names are reserved for later weapon-specific art: `attack_sword`, `attack_dagger`, `attack_spear`, `attack_hammer`, `attack_bow`, and `cast_magic`

### Collision Separation

These states only change textures, tint, scale, and display offsets on visual sprites. The Arcade Physics bodies, player movement speed, object collision rectangles, hitboxes, interaction ranges, pickup ranges, and map exit trigger zones are unchanged.

### Scope Guard

This change does not add or change movement, collision, map teleport logic, combat damage, backpack, shop, forge, magic, race, death, corruption, quests, weapons, monsters, or maps.

## 2026-05-29 - Mouse-facing player direction and hand-mounted weapon display

### Change

Player-facing animation direction is now separated from movement direction:

- `runtime.aimDirection` records the current 8-direction mouse aim when a mouse world position is available
- `runtime.facingDirection` drives the player's idle, walk, run, interact, hurt, and attack placeholder sprite direction
- mouse / last mouse world position is the primary facing source
- while the pointer is inside the game canvas, the active pointer screen position is re-projected through the camera each frame so facing still tracks the visible cursor while the player/camera moves
- movement direction is only used as a fallback before any valid mouse world position exists

The weapon display now reads the same facing direction and uses 8-direction hand offsets, so placeholder weapons begin near the character's hand instead of the body center. Downward facings draw the weapon in front of the player sprite; upward facings draw it behind.

### Scope Guard

This is display-only. Attack angle, hit detection, damage, cooldowns, stamina costs, bow charge/release logic, magic targeting, movement, collision, map exits, pickups, interactions, camera follow, and gameplay systems are unchanged.

## 2026-05-30 - Action-ready protagonist placeholder body

### Change

The generated player placeholder art now uses a clearer low-head, traditional Japanese RPG-style placeholder body instead of a mostly unified block:

- the player frame uses a 48x64 generated texture so the body has enough room for readable parts
- the silhouette is roughly 2.5 heads tall, with a large head and smaller body
- head, torso, left/right arms, and left/right legs are drawn as separate readable parts
- arms are split into upper arm / forearm segments, and legs into thigh / lower-leg segments
- left/right hands and feet are separately visible
- all 8 facing directions still generate `idle`, `walk`, and `run` placeholder frames under the existing texture key naming
- walk and run frames add simple opposing arm/leg swing while keeping the same movement logic
- existing interact, hurt, and generic attack placeholder poses remain visual-only overrides

### Mount Points

Player facing data now exposes action-ready mount offsets for:

- foot center
- body center
- right shoulder
- right hand
- left hand
- weapon

`mainHand` / `offHand` are retained as compatibility aliases, but they now map to the semantic right hand / left hand. The weapon visual is bound to the semantic right hand for every facing direction rather than being mirrored to whichever hand is screen-right.

Idle keeps both hands lowered. Walk and run use a simple right-shoulder-centered arc so the right hand and weapon move together; run uses a larger arc than walk. This swing is visual only and does not create attack hitboxes.

The legacy combat/bow hand offset remains separate so melee hit-zone placement and bow projectile origin do not inherit the idle/walk/run visual swing.

`F4` debug display now reads these mounts and draws the foot/body/right-shoulder/right-hand/left-hand/weapon points as a pure overlay.

### Scope Guard

This change is visual/debug-display only. It does not change player movement speed, player collision shape, attack damage, attack hit detection, bow projectiles, magic, backpack, shop, forge, race, death, corruption, camera behavior, or map teleport logic.

## 2026-05-29 - Composite melee hit zones

### Change

Melee hit detection now separates the visual weapon mount from the gameplay hit zones:

- weapon graphics still start from the 8-direction hand mount
- melee logic now uses composite zones: a small front-only close compensation zone plus a weapon-specific main zone
- swords and daggers use a close front sector plus a hand-referenced forward sector
- spears use a very narrow close front sector plus a hand-referenced forward rectangle
- hammers use a close front sector plus a forward impact circle
- monster claws use a close front sector plus a short 180-degree claw sector
- bows do not create melee zones and keep projectile logic

The combat hand reference keeps the weapon's forward hand offset but clamps the perpendicular visual sprite offset, so tall character art does not drag the logical hitbox away from the world-plane attack line.

### Debug Overlay

`F4` now draws active melee hit zones when an attack effect is present:

- yellow = close compensation zone
- pink = weapon-specific main attack zone
- white dot/line = combat hand reference point

### Scope Guard

This changes melee target selection geometry only. Weapon damage, cooldowns, stamina costs, bow projectile logic, magic targeting, movement, collision, map teleport, backpack, shop, forge, race, death, and corruption systems are unchanged.

## 2026-05-29 - Bow projectile trajectory aligned with charge guide

### Change

The bow charge dashed guide remains unchanged. Actual arrows now use the same hand-anchor origin as that guide:

- projectile `x/y` and `startX/startY` begin at the current bow hand anchor
- projectile `endX/endY` is computed from that same anchor plus the existing aim angle and charged range
- arrow speed, damage scale, stamina cost, cooldown, charge timing, and projectile hit logic are unchanged

### Scope Guard

This only aligns bow projectile trajectory data with the existing visual guide. It does not change the dashed guide rendering, melee logic, magic, movement, collision, map teleport, backpack, shop, forge, race, death, or corruption systems.

## 2026-05-31 - Runtime segmented player rig

### Change

The player visual is now driven by a lightweight runtime `PlayerRig` instead of relying only on pre-rendered whole-body sprite frames:

- the rig root stays anchored to the existing hidden `playerCircle`
- head, torso, upper arms, forearms, thighs, shins, hands, and feet are separate Phaser image parts inside one container
- each part is positioned by a data-driven 8-direction pose solver
- idle, walk, and run update local joint positions and rotations rather than changing gameplay state
- run uses the same pose structure as walk with stronger visual swing
- the semantic right hand remains the weapon mount in every facing direction

The old whole-player generated sprite textures are still produced and kept as a hidden fallback so current animation triggers and tests remain compatible.

### Separation

This is a visual-layer change only. Player movement, collision, camera follow, map teleport execution, melee hitboxes, bow projectile origin, magic targeting, backpack, shop, forge, race, death, and corruption logic continue to read the existing state and physics bodies.

Weapon graphics now prefer the current rig right-hand mount when available. Combat and bow projectile calculations keep using the existing separate gameplay hand offsets, so idle/walk/run arm swing cannot move attack hitboxes.

### Debug Overlay

`F4` now draws the runtime rig points in addition to the movement collision box:

- foot and body center
- head
- right shoulder, right elbow, right hand
- left shoulder, left elbow, left hand
- hips, knees, and feet
- weapon mount

The overlay remains read-only and does not create, modify, or decide any collision, interaction, pickup, hitbox, or teleport behavior.

## 2026-05-31 - Continuous player locomotion poses

### Change

The segmented player rig no longer relies on hard visual switching between two locomotion poses. The display loop now sends a normalized animation progress value into `PlayerRig`, and the rig solves joint positions every frame:

- idle uses a subtle breathing cycle on body, head, and lowered hands
- walk uses continuous arm swing, leg stride, and a small body bob
- run uses the same cycle structure with larger stride, stronger arm swing, and a slightly larger bounce
- right leg / left arm and left leg / right arm move in opposing pairs
- weapon visual mount remains bound to the semantic right hand and follows the shoulder/arm/hand motion

The walk full joint cycle remains `0.628s`, and the run full joint cycle remains `0.518s`.

### Scope Guard

This remains visual-only. Player movement speed, movement collision, map teleport, attack hitboxes, attack damage, bow projectile logic, magic, death, corruption, and save data are unchanged.
