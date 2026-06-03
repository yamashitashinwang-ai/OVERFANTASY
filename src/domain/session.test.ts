import { beforeEach, describe, expect, it } from 'vitest';
import { initialState, state } from '../runtime/state.ts';
import { clonePlain, replaceObject } from './math.ts';
import type { QuestState } from './types.ts';
import {
  currentPartyId,
  currentPlayerId,
  defaultSessionState,
  ensureOwnedRecord,
  ensureQuestOwnership,
  ensureSessionState,
  localPartyId,
  localPlayerId,
  makeRuntimeId,
  saveSchemaVersion,
  worldOwnerId
} from './session.ts';

function resetState() {
  replaceObject(state, clonePlain(initialState));
}

describe('session facade', () => {
  beforeEach(resetState);

  it('builds the single-player default session shape', () => {
    expect(defaultSessionState()).toEqual({
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
    });
  });

  it('reads current identity from session before falling back to player defaults', () => {
    state.session.localPlayerId = 'player:custom';
    state.session.partyId = 'party:custom';

    expect(currentPlayerId()).toBe('player:custom');
    expect(currentPartyId()).toBe('party:custom');

    state.session.localPlayerId = '';
    state.session.partyId = '';
    state.player.id = 'player:fallback';
    state.player.partyId = 'party:fallback';

    expect(currentPlayerId()).toBe('player:fallback');
    expect(currentPartyId()).toBe('party:fallback');
  });

  it('fills ownership fields without adding a party to world-owned records', () => {
    const local = ensureOwnedRecord({});
    const world = ensureOwnedRecord({}, worldOwnerId);

    expect(local).toEqual({ ownerId: localPlayerId, partyId: localPartyId });
    expect(world).toEqual({ ownerId: worldOwnerId });
  });

  it('adds quest ownership and a safe runtime instance id', () => {
    const quest = ensureQuestOwnership({ id: 'wolf', type: 'hunt' } as QuestState);

    expect(quest?.ownerId).toBe(localPlayerId);
    expect(quest?.partyId).toBe(localPartyId);
    expect(quest?.instanceId).toMatch(/^quest:wolf:/);
    expect(makeRuntimeId('unsafe prefix!*')).toMatch(/^unsafe_prefix__:/);
  });

  it('repairs missing session shape and schema version', () => {
    state.session = { players: {}, localPlayerId: '', partyId: '' } as never;
    state.schemaVersion = 0;

    ensureSessionState();

    expect(state.session.schemaVersion).toBe(saveSchemaVersion);
    expect(state.session.playMode).toBe('single');
    expect(state.session.localPlayerId).toBe(localPlayerId);
    expect(state.session.partyId).toBe(localPartyId);
    expect(state.session.players[localPlayerId]).toEqual(expect.objectContaining({
      id: localPlayerId,
      partyId: localPartyId,
      control: 'local',
      connected: true
    }));
    expect(state.schemaVersion).toBe(saveSchemaVersion);
  });
});
