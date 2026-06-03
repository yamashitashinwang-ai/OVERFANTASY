import DATA from '../../data.ts';
import { bus, Events } from '../../runtime/events.ts';
import { getPendingMagicCast } from '../../runtime/state.ts';
import { hexToInt } from '../colors.ts';
import type { MagicCastVisualAction, PlayerMagicCastVisual } from './types.ts';
import { clamp01, nowMs } from './timing.ts';

let playerMagicCastAction: MagicCastVisualAction | null = null;

type MagicCastVisualEventPayload = {
  spellId?: unknown;
  durationMs?: unknown;
  color?: unknown;
};

function magicCastVisualPayload(payload: unknown): MagicCastVisualEventPayload | null {
  if (!payload || typeof payload !== 'object') return null;
  return payload as MagicCastVisualEventPayload;
}

function magicCastColor(payload: MagicCastVisualEventPayload): string {
  return typeof payload.color === 'string' ? payload.color : '#d9d4ff';
}

function onMagicCastBegin(payload: unknown) {
  const cast = magicCastVisualPayload(payload);
  if (!cast || typeof cast.spellId !== 'string') return;
  const durationMs = typeof cast.durationMs === 'number' ? cast.durationMs : 0;
  triggerPlayerMagicCharge(cast.spellId, durationMs, magicCastColor(cast));
}

function onMagicCastResolve(payload: unknown) {
  const cast = magicCastVisualPayload(payload);
  if (!cast || typeof cast.spellId !== 'string') return;
  triggerPlayerMagicRelease(cast.spellId, magicCastColor(cast));
}

function activeMagicCastAction(): PlayerMagicCastVisual | null {
  const pendingCast = getPendingMagicCast();
  if (pendingCast) {
    const colorHex = DATA.magicCatalog[pendingCast.spellId]?.color || '#d9d4ff';
    return {
      stage: 'charge',
      spellId: pendingCast.spellId,
      color: playerMagicCastAction?.spellId === pendingCast.spellId ? playerMagicCastAction.color : hexToInt(colorHex),
      progress: clamp01(1 - pendingCast.timer / Math.max(0.001, pendingCast.total))
    };
  }
  if (!playerMagicCastAction) return null;
  if (playerMagicCastAction.stage === 'charge') {
    playerMagicCastAction = null;
    return null;
  }
  const now = nowMs();
  if (now >= playerMagicCastAction.endsAt) {
    playerMagicCastAction = null;
    return null;
  }
  return {
    stage: playerMagicCastAction.stage,
    spellId: playerMagicCastAction.spellId,
    color: playerMagicCastAction.color,
    progress: clamp01((now - playerMagicCastAction.startedAt) / Math.max(1, playerMagicCastAction.endsAt - playerMagicCastAction.startedAt))
  };
}

export function triggerPlayerMagicCharge(spellId: string, durationMs: number, colorHex = '#d9d4ff') {
  const now = nowMs();
  playerMagicCastAction = {
    stage: 'charge',
    spellId,
    color: hexToInt(colorHex),
    startedAt: now,
    endsAt: now + Math.max(90, durationMs)
  };
}

export function triggerPlayerMagicRelease(spellId: string, colorHex = '#d9d4ff') {
  const now = nowMs();
  playerMagicCastAction = {
    stage: 'release',
    spellId,
    color: hexToInt(colorHex),
    startedAt: now,
    endsAt: now + 260
  };
}

export function currentPlayerMagicCastVisual(): PlayerMagicCastVisual | null {
  return activeMagicCastAction();
}

export function currentPlayerMagicCastDebugLabel(): string {
  const cast = activeMagicCastAction();
  if (!cast) return 'cast: none';
  return `cast: ${cast.stage} ${Math.round(cast.progress * 100)}% ${cast.spellId}`;
}

export function clearPlayerMagicCastVisual() {
  playerMagicCastAction = null;
}

export type { PlayerMagicCastVisual };
bus.on(Events.MAGIC_CAST_BEGIN, onMagicCastBegin);
bus.on(Events.MAGIC_CAST_RESOLVE, onMagicCastResolve);
bus.on(Events.MAGIC_CAST_INTERRUPTED, () => { clearPlayerMagicCastVisual(); });
