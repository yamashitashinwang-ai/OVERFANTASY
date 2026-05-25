# OVERFANTASY Source Notes

This prototype intentionally keeps the runtime simple: plain HTML, CSS, and classic browser scripts.

- `src/data.js`: pure configuration tables. Add or tune creatures, drops, gear, materials, pets, regions, colors, and scene names here first.
- `game.js`: gameplay runtime. It owns state, map generation, combat, interactions, pet rescue, world updates, rendering, UI, and input.
- `index.html`: load order matters. `src/data.js` must be loaded before `game.js`.

When adding a feature, prefer this order:

1. Put numbers and names in `src/data.js` when they are content data.
2. Add behavior in the matching section of `game.js`.
3. Keep rendering-only changes in the `Rendering` section and panel text in the `Side panel UI` section.
