import { describe, expect, it } from 'vitest';
import { handOffsetForFacing } from './facing.ts';

describe('player weapon hand offsets', () => {
  it('mounts weapons away from the player body center', () => {
    for (const dir of ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const) {
      const offset = handOffsetForFacing(dir);
      expect(Math.hypot(offset.x, offset.y)).toBeGreaterThan(10);
    }
  });

  it('uses basic front/back layering by facing direction', () => {
    expect(handOffsetForFacing('s').front).toBe(true);
    expect(handOffsetForFacing('se').front).toBe(true);
    expect(handOffsetForFacing('sw').front).toBe(true);
    expect(handOffsetForFacing('n').front).toBe(false);
    expect(handOffsetForFacing('ne').front).toBe(false);
    expect(handOffsetForFacing('nw').front).toBe(false);
  });
});
