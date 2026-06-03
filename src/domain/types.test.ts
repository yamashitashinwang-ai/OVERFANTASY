import { describe, expect, it } from 'vitest';
import type {
  ActorState,
  AttackEffect,
  DataCatalog,
  GameState,
  MovementKeys,
  RuntimeState,
  WorldObjectState
} from './types.ts';

describe('domain type facade', () => {
  it('keeps grouped type exports available through the legacy facade', () => {
    const actor = { id: 'a', x: 1, y: 2 } satisfies ActorState;
    const attack = { shape: 'sector', effect: 'slash', angle: 0, duration: 0.2 } satisfies AttackEffect;
    const object = { id: 'o', x: 1, y: 2, kind: 'tree', name: 'Tree', w: 1, h: 1, color: '#fff' } satisfies WorldObjectState;

    expect(actor.x).toBe(1);
    expect(attack.effect).toBe('slash');
    expect(object.kind).toBe('tree');

    type _DataCatalog = DataCatalog;
    type _GameState = GameState;
    type _MovementKeys = MovementKeys;
    type _RuntimeState = RuntimeState;
    const used: Array<keyof _RuntimeState | keyof _GameState | keyof _MovementKeys | keyof _DataCatalog> = [
      'attackEffect',
      'player',
      'up',
      'regions'
    ];
    expect(used).toHaveLength(4);
  });
});
