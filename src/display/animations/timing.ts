import { display as D } from '../runtime.ts';
import type { ActiveVisualAction, VisualAction } from './types.ts';

export function nowMs() {
  return D.pScene?.time.now ?? (typeof performance !== 'undefined' ? performance.now() : Date.now());
}

export function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export function activeAction(action: VisualAction | null | undefined): ActiveVisualAction | null {
  if (!action) return null;
  const now = nowMs();
  if (now >= action.endsAt) return null;
  return {
    ...action,
    progress: clamp01((now - action.startedAt) / Math.max(1, action.endsAt - action.startedAt))
  };
}
