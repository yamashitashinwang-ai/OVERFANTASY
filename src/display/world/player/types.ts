export type FacingDir = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

export interface CameraScrollInput {
  anchorX: number;
  anchorY: number;
  worldWidth: number;
  worldHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  zoomX?: number;
  zoomY?: number;
}

export interface PlayerDisplayMotionInput {
  deltaX: number;
  deltaY: number;
  velocityX?: number;
  velocityY?: number;
  running?: boolean;
}
