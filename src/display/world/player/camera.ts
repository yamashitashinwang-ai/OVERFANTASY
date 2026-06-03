import { display as D } from '../../runtime.ts';
import { tile } from '../../../runtime/constants.ts';
import { clamp } from '../../../domain/math.ts';
import { mapBounds } from '../../../domain/world.ts';
import type { CameraScrollInput } from './types.ts';

export function computeCameraScrollForAnchor({
  anchorX,
  anchorY,
  worldWidth,
  worldHeight,
  viewportWidth,
  viewportHeight,
  zoomX = 1,
  zoomY = 1
}: CameraScrollInput) {
  const visibleWidth = viewportWidth / Math.max(0.001, Math.abs(zoomX));
  const visibleHeight = viewportHeight / Math.max(0.001, Math.abs(zoomY));
  const maxScrollX = Math.max(0, worldWidth - visibleWidth);
  const maxScrollY = Math.max(0, worldHeight - visibleHeight);
  return {
    x: clamp(anchorX - visibleWidth / 2, 0, maxScrollX),
    y: clamp(anchorY - visibleHeight / 2, 0, maxScrollY)
  };
}

export function syncCameraToPlayerAnchor() {
  if (!D.pScene || !D.playerCircle) return;
  const camera = D.pScene.cameras.main;
  const bounds = mapBounds();
  const scroll = computeCameraScrollForAnchor({
    anchorX: D.playerCircle.x,
    anchorY: D.playerCircle.y,
    worldWidth: bounds.w * tile,
    worldHeight: bounds.h * tile,
    viewportWidth: camera.width,
    viewportHeight: camera.height,
    zoomX: camera.zoomX,
    zoomY: camera.zoomY
  });
  camera.setScroll(scroll.x, scroll.y);
}
