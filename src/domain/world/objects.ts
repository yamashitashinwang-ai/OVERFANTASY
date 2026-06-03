import { state } from '../../runtime/state.ts';
import { mapExitZoneFor, paintMapExitPath } from '../map-exits.ts';
import { portalAction } from '../portal.ts';
import { makeRuntimeId, worldOwnerId } from '../session.ts';
import type { SceneKey, WorldObjectState } from '../types.ts';

export function addObject(kind: string, name: string, x: number, y: number, w: number, h: number, color: string, action?: string): WorldObjectState {
  const obj: WorldObjectState = { id: makeRuntimeId(`object:${kind}`), ownerId: worldOwnerId, kind, name, x, y, w, h, color, action };
  state.objects.push(obj);
  if (action !== "exit" && kind !== "portal" && kind !== "roadSign" && kind !== "mapExit") state.solids.push(obj);
  return obj;
}

export function addEnvironmentObject(kind: string, name: string, x: number, y: number, w: number, h: number, color: string, collisionProfile = "none"): WorldObjectState {
  const obj: WorldObjectState = { id: makeRuntimeId(`env:${kind}`), ownerId: worldOwnerId, kind, name, x, y, w, h, color };
  obj.environment = true;
  obj.visualOnly = collisionProfile === "none";
  obj.collisionProfile = collisionProfile;
  state.objects.push(obj);
  return obj;
}

export function addPortal(sourceScene: SceneKey, portalId: string, name: string, x: number, y: number, targetScene: SceneKey, targetSpawnId: string, color = "#d6c16d") {
  paintMapExitPath(sourceScene, portalId);

  const sign = addObject("roadSign", name, x, y, 2, 2, color);
  sign.sourceScene = sourceScene;
  sign.signForPortalId = portalId;
  sign.targetMapId = targetScene;
  sign.targetScene = targetScene;
  sign.targetSpawnId = targetSpawnId;
  sign.visualOnly = true;

  const zone = mapExitZoneFor(sourceScene, portalId);
  if (!zone) return sign;

  const exit = addObject("mapExit", name, zone.x, zone.y, zone.w, zone.h, color, portalAction(targetScene, targetSpawnId));
  exit.sourceScene = sourceScene;
  exit.portalId = portalId;
  exit.exitZoneId = `${sourceScene}:${portalId}`;
  exit.targetMapId = targetScene;
  exit.targetScene = targetScene;
  exit.targetSpawnId = targetSpawnId;
  return exit;
}
