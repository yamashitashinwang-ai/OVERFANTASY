// World compatibility facade. Map generation/querying, region labels,
// object/portal factories, entity factories, and pickup helpers live under
// `domain/world/` by responsibility.

export { worldH, worldW } from './world/constants.ts';
export { currentAreaName, currentPetScene, regionAt } from './world/regions.ts';
export { makeMap, mapBounds, tileAt } from './world/map.ts';
export { addEntity, makeCreature, spawnCreature } from './world/entities.ts';
export { addEnvironmentObject, addObject, addPortal } from './world/objects.ts';
export { addPickup, isRemovedMapWeaponPickup, scatterPickups } from './world/pickups.ts';
