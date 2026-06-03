import { beforeEach, describe, expect, it } from 'vitest';
import DATA from '../data.ts';
import { bus, Events } from '../runtime/events.ts';
import { initialState, state } from '../runtime/state.ts';
import { clonePlain, replaceObject } from './math.ts';
import { helpWounded } from './npc/services.ts';
import type { ActorState } from './types.ts';

function woundedFriendly(): ActorState {
  return {
    id: 'friendly:wounded-test',
    kind: 'friendly',
    name: '受伤的旅人',
    faction: 'human',
    x: 0,
    y: 0,
    r: 10,
    hp: 3,
    maxHp: 12,
    atk: 1,
    color: '#ffffff',
    alive: true,
    wounded: true,
    affection: 0,
    devotion: 0
  } as ActorState;
}

describe('NPC interaction domain events', () => {
  beforeEach(() => {
    replaceObject(state, clonePlain(initialState));
    state.player.x = 0;
    state.player.y = 0;
    state.player.herbs = 1;
    state.player.potions = 0;
    state.entities = [woundedFriendly()];
    DATA.regions.village.trust = 50;
  });

  it('publishes interaction feedback events while helping wounded NPCs', () => {
    const events: Array<{ type: string; payload: unknown }> = [];
    const onPlayer = (payload: unknown) => { events.push({ type: 'player', payload }); };
    const onEntity = (payload: unknown) => { events.push({ type: 'entity', payload }); };
    bus.on(Events.PLAYER_INTERACTED, onPlayer);
    bus.on(Events.ENTITY_INTERACTED, onEntity);

    try {
      expect(helpWounded()).toBe(true);
    } finally {
      bus.off(Events.PLAYER_INTERACTED, onPlayer);
      bus.off(Events.ENTITY_INTERACTED, onEntity);
    }

    expect(state.player.herbs).toBe(0);
    expect(state.entities[0].wounded).toBe(false);
    expect(events).toEqual([
      { type: 'player', payload: undefined },
      { type: 'entity', payload: expect.objectContaining({ actor: state.entities[0] }) }
    ]);
  });
});
