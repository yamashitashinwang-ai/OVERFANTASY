import type { OwnedRecord, QuestState } from '../types.ts';
import { currentPartyId, currentPlayerId } from './current.ts';
import { makeRuntimeId } from './ids.ts';
import { worldOwnerId } from './constants.ts';

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
