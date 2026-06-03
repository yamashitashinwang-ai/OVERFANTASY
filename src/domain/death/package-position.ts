import { state } from '../../runtime/state.ts';
import { clamp } from '../math.ts';
import { mapBounds, tileAt } from '../world.ts';
import type { SceneKey } from '../types.ts';

function isSafePackageTile(x: number, y: number): boolean {
  const bounds = mapBounds();
  if (x < 0.5 || y < 0.5 || x > bounds.w - 0.5 || y > bounds.h - 0.5) return false;
  const tile = tileAt(x, y);
  if (tile === 'wall' || tile === 'water') return false;
  return !state.solids.some(obj => x >= obj.x && x <= obj.x + obj.w && y >= obj.y && y <= obj.y + obj.h);
}

export function safePackagePosition(x: number, y: number): { scene: SceneKey; x: number; y: number } {
  if (state.mode === 'dungeon') return { scene: 'ruins', x: 50.5, y: 36.5 };
  if (isSafePackageTile(x, y)) return { scene: state.scene, x, y };
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  for (let radius = 1; radius <= 8; radius += 1) {
    let best: { x: number; y: number; d: number } | null = null;
    for (let yy = ty - radius; yy <= ty + radius; yy += 1) {
      for (let xx = tx - radius; xx <= tx + radius; xx += 1) {
        const candidate = { x: xx + 0.5, y: yy + 0.5 };
        if (!isSafePackageTile(candidate.x, candidate.y)) continue;
        const d = Math.hypot(candidate.x - x, candidate.y - y);
        if (!best || d < best.d) best = { ...candidate, d };
      }
    }
    if (best) return { scene: state.scene, x: best.x, y: best.y };
  }
  const bounds = mapBounds();
  return { scene: state.scene, x: clamp(x, 0.5, bounds.w - 0.5), y: clamp(y, 0.5, bounds.h - 0.5) };
}
