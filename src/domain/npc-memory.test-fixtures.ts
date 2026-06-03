import { initialState, state } from '../runtime/state.ts';
import { clonePlain, replaceObject } from './math.ts';
import type { ActorState, PetState } from './types.ts';

export function resetNpcMemoryTestState() {
  replaceObject(state, clonePlain(initialState));
  state.player.id = 'player:local';
  state.player.ownerId = 'player:local';
  state.player.partyId = 'party:local';
  state.session.localPlayerId = 'player:local';
  state.session.partyId = 'party:local';
  state.npcMemory = {};
  state.npcMemoryByPlayer = { 'player:local': {} };
  state.entities = [];
  state.pets = [];
}

export function npcMemorySubject(overrides: Partial<ActorState> = {}): ActorState {
  return {
    kind: 'npc',
    name: '测试村民',
    relationId: 'villager:test',
    faction: 'human',
    x: 0,
    y: 0,
    r: 10,
    hp: 10,
    maxHp: 10,
    atk: 1,
    color: '#fff',
    alive: true,
    affection: 0,
    devotion: 0,
    ...overrides
  } as ActorState;
}

export function npcMemoryPet(ownerId: string | undefined): PetState {
  return {
    id: `pet-${ownerId || 'none'}`,
    ownerId,
    partyId: ownerId === 'player:local' ? 'party:local' : 'party:other',
    name: '测试宠物',
    x: 0,
    y: 0,
    hp: 10,
    maxHp: 10,
    alive: true,
    atk: 1,
    speed: 1,
    roamRadius: 1,
    guardRange: 1,
    attackRange: 1,
    cooldown: 1,
    cooldownTimer: 0,
    wanderTimer: 0,
    wanderX: 0,
    wanderY: 0
  } as PetState;
}
