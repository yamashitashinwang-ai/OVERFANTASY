import { vi } from 'vitest';
import { bus, Events } from '../../runtime/events.ts';
import { initialState, state } from '../../runtime/state.ts';
import { clonePlain, replaceObject } from '../math.ts';
import type { ActorState, PetState } from '../types.ts';

vi.mock('../magic-casting.ts', () => ({
  interruptPendingMagicCast: vi.fn()
}));

export function setupCombatDamageTestState() {
  replaceObject(state, clonePlain(initialState));
  state.entities = [];
  state.pets = [];
  state.petRemains = [];
  state.pickups = [];
  state.player.x = 10;
  state.player.y = 10;
  state.player.hp = state.player.maxHp;
  state.player.def = 0;
  state.player.invuln = 0;
  state.player.blockTimer = 0;
  state.player.lastHitBy = null;
  state.player.monsterForm = false;
  state.player.gearMods = {};
  vi.restoreAllMocks();
  bus.off(Events.PLAYER_HURT);
}

export function monster(overrides: Partial<ActorState> = {}): ActorState {
  return {
    id: 'monster-a',
    kind: 'monster',
    name: '测试魔物',
    species: 'wolf',
    faction: 'monster',
    region: 'forest',
    x: 10,
    y: 10,
    hp: 12,
    maxHp: 12,
    alive: true,
    ...overrides
  };
}

export function pet(overrides: Partial<PetState> = {}): PetState {
  return {
    id: 'pet-a',
    name: '护主犬',
    x: 10,
    y: 10,
    hp: 8,
    maxHp: 8,
    alive: true,
    ...overrides
  };
}
