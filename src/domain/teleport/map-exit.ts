import { state } from '../../runtime/state.ts';
import { currentMapExit } from '../map-exits.ts';
import { teleportThroughPortal } from './portal.ts';

export function triggerMapExitIfNeeded(): boolean {
  if (state.mode !== 'world' || state.player.portalCooldown > 0) return false;
  const exit = currentMapExit();
  if (!exit) return false;
  return teleportThroughPortal(exit);
}
