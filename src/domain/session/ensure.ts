import { state } from '../../runtime/state.ts';
import { clonePlain } from '../math.ts';
import { localPartyId, localPlayerId, saveSchemaVersion } from './constants.ts';
import { defaultSessionState } from './defaults.ts';

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
