import { vi } from 'vitest';
import { initialState, state } from '../runtime/state.ts';
import { clonePlain, replaceObject } from './math.ts';
import type { ActorState, PetState } from './types.ts';

vi.mock('./magic.ts', () => ({
  addMagicClue: vi.fn()
}));

vi.mock('./magic-casting.ts', () => ({
  interruptPendingMagicCast: vi.fn()
}));

export function setupAiTestState() {
  replaceObject(state, clonePlain(initialState));
  state.scene = 'field';
  state.mode = 'world';
  state.entities = [];
  state.pets = [];
  state.petRemains = [];
  state.player.x = 10;
  state.player.y = 10;
  state.player.hp = state.player.maxHp;
  state.player.invuln = 0;
  state.player.blockTimer = 0;
  state.player.monsterForm = false;
}

export function pet(overrides: Partial<PetState> = {}): PetState {
  return {
    id: 'pet-a',
    name: '护主犬',
    x: 10,
    y: 10,
    hp: 20,
    maxHp: 20,
    alive: true,
    atk: 4,
    speed: 2,
    roamRadius: 3,
    guardRange: 5,
    attackRange: 1,
    cooldown: 0.8,
    cooldownTimer: 0,
    wanderTimer: 1,
    wanderX: 1,
    wanderY: 0,
    ...overrides
  };
}

export function monster(overrides: Partial<ActorState> = {}): ActorState {
  return {
    id: 'monster-a',
    kind: 'monster',
    name: '测试魔物',
    species: 'wolf',
    faction: 'monster',
    region: 'forest',
    x: 10.5,
    y: 10,
    hp: 18,
    maxHp: 18,
    atk: 3,
    speed: 1,
    alive: true,
    cooldown: 0,
    playerAggro: 4,
    petAggro: {},
    ...overrides
  };
}
