import { state } from '../../runtime/state.ts';
import { localPartyId, localPlayerId } from './constants.ts';

export function currentPlayerId(): string {
  return state.session?.localPlayerId || state.player?.id || localPlayerId;
}

export function currentPartyId(): string {
  return state.session?.partyId || state.player?.partyId || localPartyId;
}
