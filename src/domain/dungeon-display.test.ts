import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clonePlain, replaceObject } from './math.ts';
import { registerActorTeleporter, registerDisplayRebuilder, resetActorTeleporter, resetDisplayRebuilder } from '../runtime/display-sync.ts';
import { initialState, runtime, state } from '../runtime/state.ts';
import { rebuildDisplayIfReady } from './dungeon/display.ts';

describe('dungeon display sync boundary', () => {
  beforeEach(() => {
    replaceObject(state, clonePlain(initialState));
    runtime.pSceneRef = null;
    resetActorTeleporter();
    resetDisplayRebuilder();
  });

  afterEach(() => {
    runtime.pSceneRef = null;
    resetActorTeleporter();
    resetDisplayRebuilder();
  });

  it('does not touch display services before a scene is ready', () => {
    let teleports = 0;
    let rebuilds = 0;
    registerActorTeleporter(() => { teleports += 1; });
    registerDisplayRebuilder(() => { rebuilds += 1; });

    rebuildDisplayIfReady();

    expect(teleports).toBe(0);
    expect(rebuilds).toBe(0);
  });

  it('syncs player body and rebuilds display through runtime services when ready', () => {
    const teleported: unknown[] = [];
    let rebuilds = 0;
    runtime.pSceneRef = {} as never;
    registerActorTeleporter(actor => { teleported.push(actor); });
    registerDisplayRebuilder(() => { rebuilds += 1; });

    rebuildDisplayIfReady();

    expect(teleported).toEqual([state.player]);
    expect(rebuilds).toBe(1);
  });
});
