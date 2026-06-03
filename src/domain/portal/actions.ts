import type { SceneKey } from '../types.ts';
import type { PortalTarget } from './types.ts';

export function portalAction(targetScene: SceneKey, targetSpawnId: string) {
  return `portal:${targetScene}:${targetSpawnId}`;
}

export function parsePortalAction(action: string | undefined): PortalTarget | null {
  if (!action?.startsWith('portal:')) return null;
  const [, targetScene, targetSpawnId, ...extra] = action.split(':');
  if (!targetScene || !targetSpawnId || extra.length > 0) return null;
  return { targetScene, targetSpawnId };
}
