import { afterEach, describe, expect, it } from 'vitest';
import type { ActorState } from '../domain/types.ts';
import {
  rebuildDisplayIfRegistered,
  registerActorTeleporter,
  registerDisplayRebuilder,
  resetActorTeleporter,
  resetDisplayRebuilder,
  teleportActorBody
} from './display-sync.ts';

function actor(): ActorState {
  return { id: 'actor:teleport', x: 4, y: 5, alive: true } as ActorState;
}

describe('runtime display sync service', () => {
  afterEach(() => {
    resetActorTeleporter();
    resetDisplayRebuilder();
  });

  it('keeps actor body teleport a no-op until display registers an implementation', () => {
    expect(() => teleportActorBody(actor())).not.toThrow();
  });

  it('delegates actor body teleport to the registered display implementation', () => {
    const target = actor();
    const calls: unknown[] = [];
    registerActorTeleporter(moved => { calls.push(moved); });

    teleportActorBody(target);

    expect(calls).toEqual([target]);
  });

  it('delegates display rebuild to the registered display implementation until reset', () => {
    let count = 0;
    registerDisplayRebuilder(() => { count += 1; });

    rebuildDisplayIfRegistered();
    resetDisplayRebuilder();
    rebuildDisplayIfRegistered();

    expect(count).toBe(1);
  });
});
