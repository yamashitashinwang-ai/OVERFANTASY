import type { ActorState } from '../../domain/types.ts';
import type { ActiveVisualAction, VisualAction, VisualActionKind } from './types.ts';
import { activeAction, nowMs } from './timing.ts';

let playerAction: VisualAction | null = null;
const npcActions = new Map<string, VisualAction>();

const playerActionPriority: Record<VisualActionKind, number> = {
  interact: 1,
  attack: 2,
  hurt: 3
};

export function setPlayerAction(kind: VisualActionKind, durationMs: number, attackName?: VisualAction['attackName']) {
  const now = nowMs();
  const current = activeAction(playerAction);
  if (current && playerActionPriority[current.kind] > playerActionPriority[kind]) return;
  playerAction = { kind, startedAt: now, endsAt: now + durationMs, attackName };
}

export function activePlayerAction(): ActiveVisualAction | null {
  const action = activeAction(playerAction);
  if (!action) playerAction = null;
  return action;
}

export function setNpcAction(id: string, durationMs: number) {
  const now = nowMs();
  npcActions.set(id, { kind: 'interact', startedAt: now, endsAt: now + durationMs });
}

export function activeNpcAction(actor: ActorState): ActiveVisualAction | null {
  const action = activeAction(npcActions.get(actor.id));
  if (!action) {
    npcActions.delete(actor.id);
    return null;
  }
  return action;
}
