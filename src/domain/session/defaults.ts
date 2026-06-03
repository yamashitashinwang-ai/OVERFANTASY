import type { SessionState } from '../types.ts';
import { localPartyId, localPlayerId, saveSchemaVersion } from './constants.ts';

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
