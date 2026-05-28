// Session / identity domain. Single-player game today, but every record
// carries ownerId + partyId so multi-player can layer on without rewriting
// the world. Pure logic — no DOM, no engine.

import { clonePlain } from './math.ts';
import { state } from '../runtime/state.ts';
import type { OwnedRecord, QuestState, SessionState } from './types.ts';

const localPlayerId = 'player:local';
const localPartyId  = 'party:local';
export const worldOwnerId = 'world';
const saveSchemaVersion = 2;

export function defaultSessionState(): SessionState {
  return {
    schemaVersion: saveSchemaVersion,
    playMode: 'single',
    localPlayerId,
    hostPlayerId: localPlayerId,
    partyId: localPartyId,
    players: {
      [localPlayerId]: {
        id: localPlayerId,
        name: '本地玩家',
        partyId: localPartyId,
        control: 'local',
        connected: true
      }
    }
  };
}

export function makeRuntimeId(prefix = 'id'): string {
  const safePrefix = String(prefix).replace(/[^a-zA-Z0-9:_-]/g, '_');
  return `${safePrefix}:${Date.now().toString(36)}:${Math.floor(Math.random() * 0xffffff).toString(36)}`;
}

export function currentPlayerId(): string {
  return state.session?.localPlayerId || state.player?.id || localPlayerId;
}

export function currentPartyId(): string {
  return state.session?.partyId || state.player?.partyId || localPartyId;
}

export function ownedByCurrentPlayer(record: OwnedRecord | null | undefined): boolean {
  return !record?.ownerId || record.ownerId === currentPlayerId();
}

export function questBelongsToCurrentPlayer(quest: QuestState | null | undefined): boolean {
  return !!quest && (!quest.ownerId || quest.ownerId === currentPlayerId());
}

export function ensureOwnedRecord<T extends OwnedRecord | null | undefined>(record: T, fallbackOwnerId = currentPlayerId()): T {
  if (!record) return record;
  if (!record.ownerId) record.ownerId = fallbackOwnerId;
  if (!record.partyId && fallbackOwnerId !== worldOwnerId) record.partyId = currentPartyId();
  return record;
}

export function ensureQuestOwnership<T extends QuestState | null | undefined>(quest: T): T {
  if (!quest) return null;
  ensureOwnedRecord(quest, currentPlayerId());
  if (!quest.instanceId) quest.instanceId = makeRuntimeId(`quest:${quest.id || quest.type || 'unknown'}`);
  return quest;
}

export function ensureSessionState() {
  if (!state.session || typeof state.session !== 'object') state.session = defaultSessionState();
  const defaults = defaultSessionState();
  const sessionRecord = state.session as unknown as Record<string, unknown>;
  for (const [key, value] of Object.entries(defaults)) {
    if (sessionRecord[key] === undefined) sessionRecord[key] = clonePlain(value);
  }
  if (!state.session.players || typeof state.session.players !== 'object') state.session.players = {};
  if (!state.session.localPlayerId) state.session.localPlayerId = state.player?.id || localPlayerId;
  if (!state.session.partyId) state.session.partyId = state.player?.partyId || localPartyId;
  if (!state.session.players[state.session.localPlayerId]) {
    state.session.players[state.session.localPlayerId] = {
      id: state.session.localPlayerId,
      name: '本地玩家',
      partyId: state.session.partyId,
      control: 'local',
      connected: true
    };
  }
  if (!state.schemaVersion || state.schemaVersion < saveSchemaVersion) state.schemaVersion = saveSchemaVersion;
}

export { localPlayerId, localPartyId, saveSchemaVersion };
