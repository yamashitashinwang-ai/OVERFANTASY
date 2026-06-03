import type { Page } from 'playwright';
import type { E2eProbeState } from './types.ts';

export function readE2eState(page: Page): Promise<E2eProbeState> {
  return page.evaluate(() => ({
    player: { ...window.__state.player },
    scene: window.__state.scene,
    mode: window.__state.mode,
    npcMemory: Object.keys(window.__state.npcMemory || {}),
    entities: window.__state.entities.filter(e => e.alive).length,
    pickups: window.__state.pickups.length,
    pets: window.__state.pets.length
  }));
}
