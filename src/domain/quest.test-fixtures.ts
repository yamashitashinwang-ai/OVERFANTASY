import { initialState, state } from '../runtime/state.ts';
import { clonePlain, replaceObject } from './math.ts';
import type { ActorState } from './types.ts';

export function resetQuestTestState(): void {
  replaceObject(state, clonePlain(initialState));
  state.quests = { major: null, small: [] };
  state.entities = [];
  state.player.gold = 0;
  state.player.potions = 0;
  state.player.herbs = 0;
  state.player.resources = {};
  state.player.wood = 0;
  state.player.stone = 0;
}

export function actor(partial: Partial<ActorState>): ActorState {
  return {
    kind: 'npc',
    name: '测试目标',
    faction: 'human',
    x: 0,
    y: 0,
    r: 10,
    hp: 1,
    maxHp: 1,
    atk: 0,
    color: '#fff',
    alive: true,
    ...partial
  } as ActorState;
}
