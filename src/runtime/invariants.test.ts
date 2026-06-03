import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bus, Events } from './events.ts';
import { clearViolations, getViolations, tickInvariants } from './invariants.ts';
import { initialState, runtime, state } from './state.ts';
import { uiState } from './ui-state.ts';
import { clonePlain, replaceObject } from '../domain/math.ts';
import type { ActorState } from '../domain/types.ts';

function resetRuntime() {
  replaceObject(state, clonePlain(initialState));
  uiState.appMode = 'playing';
  runtime.pSceneRef = { scene: { isActive: () => false } } as never;
  state.entities = [];
  state.player.x = 10;
  state.player.y = 10;
  state.player.hp = state.player.maxHp;
  state.player.invuln = 0;
  state.player.monsterForm = false;
  clearViolations();
}

function adjacentMonster(overrides: Partial<ActorState> = {}): ActorState {
  return {
    id: 'monster-a',
    name: '测试魔物',
    kind: 'monster',
    faction: 'monster',
    x: state.player.x + 0.4,
    y: state.player.y,
    alive: true,
    cooldown: 0,
    ...overrides
  };
}

describe('runtime invariants facade', () => {
  beforeEach(() => {
    resetRuntime();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearViolations();
    runtime.pSceneRef = null;
    uiState.appMode = 'menu';
  });

  it('records and exposes player HP invariant violations', () => {
    const events: unknown[] = [];
    bus.on(Events.INVARIANT_BROKEN, event => events.push(event));
    state.player.hp = -1;

    tickInvariants(0.1);

    expect(getViolations()).toEqual([
      expect.objectContaining({
        id: 'player-hp-never-negative',
        message: 'player.hp = -1',
        severity: 'error'
      })
    ]);
    expect(events).toEqual([
      expect.objectContaining({ id: 'player-hp-never-negative' })
    ]);
    bus.off(Events.INVARIANT_BROKEN);
  });

  it('clears recorded violations through the public facade', () => {
    state.player.x = Number.NaN;

    tickInvariants(0.1);
    expect(getViolations().length).toBeGreaterThan(0);

    clearViolations();

    expect(getViolations()).toEqual([]);
  });

  it('does not report adjacent monster damage liveness when a recent hurt event exists', () => {
    state.entities = [adjacentMonster()];
    bus.emit(Events.PLAYER_HURT, { amount: 1, blocked: false, source: state.entities[0] });

    tickInvariants(3);

    expect(getViolations().some(v => v.id === 'adjacent-monster-must-damage')).toBe(false);
  });

  it('reports monster-form adjacent monster suppression as info', () => {
    state.player.monsterForm = true;
    state.entities = [adjacentMonster({ name: '友好魔物' })];

    tickInvariants(6.1);

    expect(getViolations()).toEqual([
      expect.objectContaining({
        id: 'monsterform-suppresses-monster-damage',
        severity: 'info'
      })
    ]);
  });
});
