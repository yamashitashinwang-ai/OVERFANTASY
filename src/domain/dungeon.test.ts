import { describe, expect, it } from 'vitest';
import * as dungeon from './dungeon.ts';
import * as sceneFlow from './dungeon/scene-flow.ts';
import { generateDungeon } from './dungeon/generate.ts';
import { spawnForCurrentScene } from './dungeon/spawns.ts';

describe('dungeon facade', () => {
  it('re-exports scene-flow, generation, and spawn helpers by reference', () => {
    expect(dungeon.loadScene).toBe(sceneFlow.loadScene);
    expect(dungeon.enterDungeon).toBe(sceneFlow.enterDungeon);
    expect(dungeon.leaveDungeon).toBe(sceneFlow.leaveDungeon);
    expect(dungeon.generateDungeon).toBe(generateDungeon);
    expect(dungeon.spawnForCurrentScene).toBe(spawnForCurrentScene);
  });
});
