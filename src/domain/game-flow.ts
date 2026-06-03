// Game lifecycle compatibility facade. State shape migration, reset/new-game,
// save/autosave, and load/delete flows live under domain/game-flow/.

export { ensureStateShape } from './game-flow/shape.ts';
export { saveCurrentGame, autoSave } from './game-flow/save.ts';
export { resetGameState } from './game-flow/reset.ts';
export { startNewGame, startLoadedSave, continueLatestSave, deleteSaveSlot } from './game-flow/session.ts';
