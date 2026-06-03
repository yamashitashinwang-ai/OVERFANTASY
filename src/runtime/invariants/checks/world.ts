import { state } from '../../state.ts';
import type { RuntimeInvariant } from '../types.ts';

export const entityPositionNeverNanInvariant: RuntimeInvariant = {
  id: 'entity-position-never-nan',
  check() {
    for (const e of state.entities) {
      if (e.alive && (!Number.isFinite(e.x) || !Number.isFinite(e.y))) {
        return `entity ${e.name} x=${e.x} y=${e.y}`;
      }
    }
    return null;
  }
};
