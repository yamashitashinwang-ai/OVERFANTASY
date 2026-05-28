// World construction + scene queries. Tiles, regions, factories that
// populate scene contents (entities/objects/pickups/portals), and the big
// switch in spawnWorld() that places NPC + monster + pickup spawns per scene.
//
// Pure logic: writes to `state.{map, solids, entities, objects, pickups, mode,
// scene}` via factory helpers. No DOM, no Phaser. The display layer reads
// these arrays each frame and reconciles its GameObjects.

import DATA from '../data.js';
import { state } from '../scenes/Game.js';
import { rand, clamp } from './math.js';
import {
  makeRuntimeId, worldOwnerId, ensureOwnedRecord,
  currentPlayerId
} from './session.js';

const {
  regions, colors, sceneNames, bestiary,
  graveDecayInterval, graveMaxDecay
} = DATA;
const worldW = 96;
const worldH = 72;

// Some legacy weapon pickups have been removed from the world but may still
// be referenced in old save files. Skip them on rehydrate.
const removedMapWeaponPickupNames = new Set(['短木弓', '铁剑', '石剑', '橡木锤', '战锤', '剑的概念']);
export function isRemovedMapWeaponPickup(pickup) {
  return pickup?.kind === 'weapon' && removedMapWeaponPickupNames.has(pickup?.name);
}

// npcMemoryFor lives in Game.js for now; we import it lazily so this module
// doesn't pull DOM-y dependencies at load time.
import { npcMemoryFor } from '../scenes/Game.js';

export function regionAt(x, y) {
  if (state.mode === "dungeon") return regions.ruins;
  if (state.scene === "forest") return y > 46 || x > 63 ? regions.swamp : regions.forest;
  if (state.scene === "ruins") return x > 58 || y > 42 ? regions.mountain : regions.ruins;
  if (state.scene === "demon") return regions.demon;
  if (state.scene === "silverleaf") return regions.silverleaf;
  if (state.scene === "peakless") return regions.peakless;
  if (state.scene === "stonegorge") return regions.stonegorge;
  if (state.scene === "hatepit") return regions.hatepit;
  if (x < 27 && y < 25) return regions.village;
  if (x >= 28 && x < 61 && y < 37) return regions.forest;
  if (x >= 58 && y >= 38) return regions.ruins;
  return regions.field;
}

export function mapBounds() {
  if (state.mode === "dungeon" && state.dungeon) return { w: state.dungeon.w, h: state.dungeon.h };
  return { w: worldW, h: worldH };
}

export function tileAt(x, y) {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  const bounds = mapBounds();
  if (tx < 0 || ty < 0 || tx >= bounds.w || ty >= bounds.h) return "wall";
  return state.map[ty]?.[tx] || "wall";
}

export function addObject(kind, name, x, y, w, h, color, action) {
  const obj = { id: makeRuntimeId(`object:${kind}`), ownerId: worldOwnerId, kind, name, x, y, w, h, color, action };
  state.objects.push(obj);
  if (action !== "exit" && kind !== "portal") state.solids.push(obj);
  return obj;
}

export function addEntity(entity) {
  if (!entity.id) entity.id = makeRuntimeId(entity.species || entity.kind || "entity");
  if (!entity.ownerId) entity.ownerId = worldOwnerId;
  if ((entity.kind === "npc" || entity.kind === "friendly") && !entity.relationId) entity.relationId = entity.name;
  const memory = (entity.kind === "npc" || entity.kind === "friendly") ? npcMemoryFor(entity) : null;
  if (memory) {
    entity.affection = Math.max(entity.affection || 0, memory.affection || 0);
    entity.devotion = Math.max(entity.devotion || 0, memory.devotion || 0);
  }
  entity.cooldown = rand(0, 1);
  entity.specialClock = rand(1.2, 3.6);
  entity.alive = true;
  state.entities.push(entity);
  return entity;
}

export function addPickup(kind, name, x, y, color, value = 1, options = {}) {
  state.pickups.push({
    id: options.id || makeRuntimeId("pickup"),
    ownerId: options.ownerId || worldOwnerId,
    reservedFor: options.reservedFor || null,
    sourceId: options.sourceId || null,
    kind,
    name,
    x,
    y,
    color,
    value,
    taken: false,
    takenBy: null
  });
}

export function addPortal(name, x, y, targetScene, targetX, targetY, color = "#d6c16d") {
  return addObject("portal", name, x, y, 2, 2, color, `portal:${targetScene}:${targetX}:${targetY}`);
}

export function makeCreature(species, x, y, overrides = {}) {
  const template = bestiary[species];
  const slimeGen = species === "slime" ? (overrides.slimeGen || 1) : undefined;
  const genScale = species === "slime" ? [1, 0.55, 0.28][slimeGen - 1] || 1 : 1;
  const entity = {
    ...template,
    species,
    x,
    y,
    maxHp: Math.max(3, Math.ceil((overrides.maxHp || template.hp) * genScale)),
    region: overrides.region || state.scene,
    ...overrides
  };
  if (species === "slime") {
    entity.slimeGen = slimeGen;
    entity.name = slimeGen === 1 ? template.name : (slimeGen === 2 ? "小灰史莱姆" : "微型灰史莱姆");
    entity.atk = Math.max(1, Math.ceil(template.atk * genScale));
    entity.r = Math.max(6, Math.ceil(template.r * (slimeGen === 1 ? 1 : slimeGen === 2 ? 0.8 : 0.62)));
    entity.speed = Math.max(0.8, template.speed * (slimeGen === 1 ? 1 : slimeGen === 2 ? 0.88 : 0.72));
    entity.split = slimeGen < 3;
  }
  entity.maxHp = overrides.maxHp || entity.maxHp;
  entity.hp = overrides.hp || entity.maxHp;
  return entity;
}

export function spawnCreature(species, x, y, overrides = {}) {
  return addEntity(makeCreature(species, x, y, overrides));
}

export function scatterPickups(list) {
  for (const p of list) addPickup(p.kind, p.name, p.x, p.y, p.color, p.value || 1);
}

export function makeMap(scene = "field") {
  state.map = [];
  state.mode = "world";
  state.scene = scene;
  state.dungeon = null;
  for (let y = 0; y < worldH; y += 1) {
    const row = [];
    for (let x = 0; x < worldW; x += 1) {
      let t = "grass";
      if (scene === "field") {
        if (x < 27 && y < 25) t = "village";
        if (x >= 28 && x < 61 && y < 37) t = "forest";
        if (x >= 58 && y >= 38) t = "ruins";
        if ((x === 27 && y < 58) || (y === 26 && x < 78) || (y === 56 && x > 18 && x < 88)) t = "road";
      } else if (scene === "forest") {
        t = "forest";
        if ((x + y) % 13 === 0) t = "grass";
        if (x > 62 || y > 46) t = "swamp";
        if (x > 70 && y > 52) t = "water";
        if ((x === 47 && y > 5 && y < 66) || (y === 34 && x > 6 && x < 86)) t = "road";
      } else if (scene === "ruins") {
        t = "ruins";
        if (x < 22 && y < 22) t = "grass";
        if (x > 62 || y > 46) t = "mountain";
        if ((x === 45 && y > 7 && y < 64) || (y === 35 && x > 10 && x < 86)) t = "road";
      } else if (scene === "silverleaf") {
        t = "silverleaf";
        if ((x + y * 2) % 17 === 0) t = "paleGrove";
        if (x > 8 && x < 39 && y > 8 && y < 31) t = "paleGrove";
        if ((x === 48 && y > 5 && y < 68) || (y === 58 && x > 11 && x < 84) || (y === 18 && x > 9 && x < 42)) t = "elvenRoad";
        if (x > 73 && y < 20) t = "forest";
      } else if (scene === "peakless") {
        t = "mountain";
        if ((x * 3 + y) % 19 === 0) t = "ore";
        if ((y === 35 && x > 4 && x < 91) || (x === 48 && y > 10 && y < 63)) t = "road";
        if ((y === 24 && x > 20 && x < 70 && !(x > 43 && x < 53)) || (y === 49 && x > 31 && x < 83 && !(x > 45 && x < 56))) t = "wall";
      } else if (scene === "stonegorge") {
        t = "mountain";
        if (x > 8 && x < 39 && y > 9 && y < 33) t = "ore";
        if ((x + y) % 11 === 0) t = "ore";
        if ((y === 35 && x > 5 && x < 91) || (x === 48 && y > 5 && y < 66) || (y === 20 && x > 9 && x < 42)) t = "road";
        if ((x === 64 && y > 12 && y < 55 && !(y > 31 && y < 39)) || (y === 51 && x > 18 && x < 65 && !(x > 43 && x < 53))) t = "wall";
      } else if (scene === "hatepit") {
        t = "chasm";
        if ((x + y * 3) % 13 === 0) t = "ore";
        if ((x === 48 && y > 8 && y < 68) || (y === 36 && x > 10 && x < 75)) t = "road";
        if ((x > 38 && x < 59 && y > 23 && y < 46) || (x > 70 && y < 24)) t = "seal";
        if ((y === 18 && x > 17 && x < 79 && !(x > 44 && x < 52)) || (x === 76 && y > 28 && y < 60)) t = "wall";
      } else if (scene === "demon") {
        t = "ash";
        if (x > 19 && x < 77 && y > 12 && y < 58) t = "castle";
        if ((x === 48 && y > 5 && y < 67) || (y === 35 && x > 8 && x < 88)) t = "road";
        if ((x > 29 && x < 35 && y > 24 && y < 47) || (x > 61 && x < 67 && y > 24 && y < 47)) t = "wall";
      }
      if (x < 2 || y < 2 || x > worldW - 3 || y > worldH - 3) t = scene === "demon" ? "wall" : "water";
      row.push(t);
    }
    state.map.push(row);
  }
}


export function currentAreaName() {
  if (state.mode === "dungeon") return "排列迷宫";
  return `${sceneNames[state.scene] || "未知地带"} / ${regionAt(state.player.x, state.player.y).name}`;
}

export function currentPetScene() {
  return state.mode === "dungeon" ? "dungeon" : state.scene;
}
