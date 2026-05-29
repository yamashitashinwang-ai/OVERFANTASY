import DATA from '../data.ts';
import { state } from '../runtime/state.ts';
import { log, toast } from '../runtime/services.ts';
import { loadScene } from './dungeon.ts';
import { parsePortalAction, resolveSceneSpawn } from './portal.ts';
import type { WorldObjectState } from './types.ts';

export const TELEPORT_COOLDOWN_SECONDS = 1.2;

const { sceneNames } = DATA;

export function teleportThroughPortal(obj: WorldObjectState): boolean {
  if (state.player.portalCooldown > 0) {
    toast('传送后的脚步还没站稳。');
    return false;
  }

  const parsed = parsePortalAction(obj.action);
  const targetScene = typeof obj.targetMapId === 'string' ? obj.targetMapId : (typeof obj.targetScene === 'string' ? obj.targetScene : parsed?.targetScene);
  const targetSpawnId = typeof obj.targetSpawnId === 'string' ? obj.targetSpawnId : parsed?.targetSpawnId;
  if (!targetScene || !targetSpawnId) {
    const message = `传送门 ${obj.name} 缺少目标地图或入口点，传送已取消。`;
    log(message);
    toast(message);
    return false;
  }

  const resolved = resolveSceneSpawn(targetScene, targetSpawnId);
  if (!resolved) {
    const message = `目标地图 ${targetScene} 没有可用入口配置，传送已取消。`;
    log(message);
    toast(message);
    return false;
  }

  if (resolved.usedFallback) {
    const message = `目标入口 ${targetScene}:${targetSpawnId} 不存在，已回退到 ${targetScene}:start。`;
    log(message);
    toast(message);
  }

  state.player.portalCooldown = TELEPORT_COOLDOWN_SECONDS;
  loadScene(targetScene, resolved.x, resolved.y, `穿过${obj.name}，来到${sceneNames[targetScene] || '新区域'}。`);
  return true;
}
