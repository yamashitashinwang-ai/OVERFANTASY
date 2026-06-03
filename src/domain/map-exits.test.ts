import { describe, expect, it } from 'vitest';
import DATA from '../data.ts';
import * as mapExits from './map-exits.ts';
import { mapExitConfigs, mapExitConfigFor } from './map-exits/config.ts';
import { paintMapExitPath } from './map-exits/paint.ts';
import { currentMapExit, mapExitZoneFor, pointInObject } from './map-exits/query.ts';
import type { WorldObjectState } from './types.ts';
import { worldH, worldW } from './world/constants.ts';

describe('map-exit domain facade and config integrity', () => {
  it('re-exports split map-exit modules through the legacy entry point', () => {
    expect(mapExits.mapExitConfigs).toBe(mapExitConfigs);
    expect(mapExits.mapExitConfigFor).toBe(mapExitConfigFor);
    expect(mapExits.paintMapExitPath).toBe(paintMapExitPath);
    expect(mapExits.mapExitZoneFor).toBe(mapExitZoneFor);
    expect(mapExits.pointInObject).toBe(pointInObject);
    expect(mapExits.currentMapExit).toBe(currentMapExit);
  });

  it('keeps map-exit config records unique and inside world bounds', () => {
    const ids = new Set<string>();
    const validTiles = new Set(['road', 'elvenRoad']);

    for (const config of mapExitConfigs) {
      const id = `${config.sourceScene}:${config.portalId}`;
      expect(ids.has(id)).toBe(false);
      ids.add(id);
      expect(DATA.sceneNames[config.sourceScene]).toBeDefined();
      expect(config.portalId.trim()).not.toBe('');
      expect(config.path.length).toBeGreaterThan(0);

      for (const rect of [config.zone, ...config.path]) {
        expect(Number.isInteger(rect.x)).toBe(true);
        expect(Number.isInteger(rect.y)).toBe(true);
        expect(Number.isInteger(rect.w)).toBe(true);
        expect(Number.isInteger(rect.h)).toBe(true);
        expect(rect.x).toBeGreaterThanOrEqual(0);
        expect(rect.y).toBeGreaterThanOrEqual(0);
        expect(rect.w).toBeGreaterThan(0);
        expect(rect.h).toBeGreaterThan(0);
        expect(rect.x + rect.w).toBeLessThanOrEqual(worldW);
        expect(rect.y + rect.h).toBeLessThanOrEqual(worldH);
        const tile = 'tile' in rect ? rect.tile : undefined;
        if (tile != null) {
          expect(typeof tile).toBe('string');
          if (typeof tile === 'string') expect(validTiles.has(tile)).toBe(true);
        }
      }
    }
  });

  it('keeps map-exit lookup helpers aligned with config data', () => {
    for (const config of mapExitConfigs) {
      expect(mapExitConfigFor(config.sourceScene, config.portalId)).toBe(config);
      expect(mapExitZoneFor(config.sourceScene, config.portalId)).toBe(config.zone);
    }

    expect(mapExitConfigFor('field', 'missing_exit')).toBeNull();
    expect(mapExitZoneFor('field', 'missing_exit')).toBeNull();

    const object: WorldObjectState = {
      id: 'test-exit',
      ownerId: 'world',
      kind: 'mapExit',
      name: 'Test Exit',
      x: 1,
      y: 1,
      w: 2,
      h: 2,
      color: '#ffffff'
    };
    expect(pointInObject({ x: 2, y: 2 }, object)).toBe(true);
    expect(pointInObject({ x: 3.1, y: 2 }, object)).toBe(false);
  });
});
