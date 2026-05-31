import { describe, expect, it } from 'vitest';
import {
  computeCameraScrollForAnchor,
  playerDisplayMotionFromKinematics
} from './world.ts';

describe('manual player camera sync', () => {
  it('centers the camera on the player anchor while inside map bounds', () => {
    const scroll = computeCameraScrollForAnchor({
      anchorX: 1200,
      anchorY: 900,
      worldWidth: 3000,
      worldHeight: 2200,
      viewportWidth: 960,
      viewportHeight: 640
    });

    expect(scroll.x).toBe(720);
    expect(scroll.y).toBe(580);
  });

  it('clamps camera scroll at world edges', () => {
    const nearOrigin = computeCameraScrollForAnchor({
      anchorX: 100,
      anchorY: 120,
      worldWidth: 3000,
      worldHeight: 2200,
      viewportWidth: 960,
      viewportHeight: 640
    });
    const nearEnd = computeCameraScrollForAnchor({
      anchorX: 2900,
      anchorY: 2100,
      worldWidth: 3000,
      worldHeight: 2200,
      viewportWidth: 960,
      viewportHeight: 640
    });

    expect(nearOrigin).toEqual({ x: 0, y: 0 });
    expect(nearEnd).toEqual({ x: 2040, y: 1560 });
  });

  it('accounts for camera zoom when calculating visible world size', () => {
    const scroll = computeCameraScrollForAnchor({
      anchorX: 1200,
      anchorY: 900,
      worldWidth: 3000,
      worldHeight: 2200,
      viewportWidth: 960,
      viewportHeight: 640,
      zoomX: 2,
      zoomY: 2
    });

    expect(scroll.x).toBe(960);
    expect(scroll.y).toBe(740);
  });
});

describe('player display motion detection', () => {
  it('keeps walk animation active when velocity exists before body position advances', () => {
    const motion = playerDisplayMotionFromKinematics({
      deltaX: 0,
      deltaY: 0,
      velocityX: 115.2,
      velocityY: 0,
      running: false
    });

    expect(motion.moving).toBe(true);
    expect(motion.facingDx).toBe(115.2);
    expect(motion.facingDy).toBe(0);
  });

  it('falls back to body delta when velocity is absent', () => {
    const motion = playerDisplayMotionFromKinematics({
      deltaX: 1.92,
      deltaY: 0,
      velocityX: 0,
      velocityY: 0,
      running: false
    });

    expect(motion.moving).toBe(true);
    expect(motion.facingDx).toBe(1.92);
    expect(motion.facingDy).toBe(0);
  });

  it('does not mark idle as moving when there is no velocity or body delta', () => {
    const motion = playerDisplayMotionFromKinematics({
      deltaX: 0,
      deltaY: 0,
      velocityX: 0,
      velocityY: 0,
      running: false
    });

    expect(motion.moving).toBe(false);
  });
});
