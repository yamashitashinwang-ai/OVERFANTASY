import type { FacingDir } from './types.ts';

export const facingDirs: FacingDir[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

export function isFacingDir(value: unknown): value is FacingDir {
  return typeof value === 'string' && facingDirs.includes(value as FacingDir);
}

export function directionFromAngle(angle: number): FacingDir {
  const oct = Math.round(angle / (Math.PI / 4));
  return (['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'][((oct % 8) + 8) % 8] || 's') as FacingDir;
}
