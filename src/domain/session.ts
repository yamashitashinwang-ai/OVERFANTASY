// Session / identity compatibility facade. Constants, default session state,
// runtime ID creation, current identity lookups, ownership helpers, and state
// normalization live under `domain/session/`.

export { localPlayerId, localPartyId, worldOwnerId, saveSchemaVersion } from './session/constants.ts';
export { defaultSessionState } from './session/defaults.ts';
export { makeRuntimeId } from './session/ids.ts';
export { currentPlayerId, currentPartyId } from './session/current.ts';
export {
  ownedByCurrentPlayer,
  questBelongsToCurrentPlayer,
  ensureOwnedRecord,
  ensureQuestOwnership
} from './session/ownership.ts';
export { ensureSessionState } from './session/ensure.ts';
