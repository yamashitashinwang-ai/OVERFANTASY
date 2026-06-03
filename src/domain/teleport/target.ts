import { parsePortalAction } from '../portal.ts';
import type { SceneKey, WorldObjectState } from '../types.ts';

export interface PortalTargetResolution {
  targetScene?: SceneKey;
  targetSpawnId?: string;
}

export function portalTargetFor(obj: WorldObjectState): PortalTargetResolution {
  const parsed = parsePortalAction(obj.action);
  const targetScene = typeof obj.targetMapId === 'string'
    ? obj.targetMapId
    : (typeof obj.targetScene === 'string' ? obj.targetScene : parsed?.targetScene);
  const targetSpawnId = typeof obj.targetSpawnId === 'string' ? obj.targetSpawnId : parsed?.targetSpawnId;
  return { targetScene, targetSpawnId };
}
