import { describe, expect, it } from 'vitest';
import * as world from './world.ts';
import { worldH, worldW } from './world/constants.ts';
import { addEntity, makeCreature, spawnCreature } from './world/entities.ts';
import { makeMap, mapBounds, tileAt } from './world/map.ts';
import { addEnvironmentObject, addObject, addPortal } from './world/objects.ts';
import { addPickup, isRemovedMapWeaponPickup, scatterPickups } from './world/pickups.ts';
import { currentAreaName, currentPetScene, regionAt } from './world/regions.ts';

describe('world domain facade', () => {
  it('re-exports split world modules through the legacy entry point', () => {
    expect(world.worldH).toBe(worldH);
    expect(world.worldW).toBe(worldW);
    expect(world.currentAreaName).toBe(currentAreaName);
    expect(world.currentPetScene).toBe(currentPetScene);
    expect(world.regionAt).toBe(regionAt);
    expect(world.makeMap).toBe(makeMap);
    expect(world.mapBounds).toBe(mapBounds);
    expect(world.tileAt).toBe(tileAt);
    expect(world.addEntity).toBe(addEntity);
    expect(world.makeCreature).toBe(makeCreature);
    expect(world.spawnCreature).toBe(spawnCreature);
    expect(world.addEnvironmentObject).toBe(addEnvironmentObject);
    expect(world.addObject).toBe(addObject);
    expect(world.addPortal).toBe(addPortal);
    expect(world.addPickup).toBe(addPickup);
    expect(world.isRemovedMapWeaponPickup).toBe(isRemovedMapWeaponPickup);
    expect(world.scatterPickups).toBe(scatterPickups);
  });
});
