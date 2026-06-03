import { describe, expect, it } from 'vitest';
import * as gameFlow from './game-flow.ts';
import { resetGameState } from './game-flow/reset.ts';
import { autoSave, saveCurrentGame } from './game-flow/save.ts';
import {
  continueLatestSave,
  deleteSaveSlot,
  startLoadedSave,
  startNewGame
} from './game-flow/session.ts';
import { ensureStateShape } from './game-flow/shape.ts';

describe('game-flow facade', () => {
  it('re-exports state-shape, save, reset, and session helpers by reference', () => {
    expect(gameFlow.ensureStateShape).toBe(ensureStateShape);
    expect(gameFlow.saveCurrentGame).toBe(saveCurrentGame);
    expect(gameFlow.autoSave).toBe(autoSave);
    expect(gameFlow.resetGameState).toBe(resetGameState);
    expect(gameFlow.startNewGame).toBe(startNewGame);
    expect(gameFlow.startLoadedSave).toBe(startLoadedSave);
    expect(gameFlow.continueLatestSave).toBe(continueLatestSave);
    expect(gameFlow.deleteSaveSlot).toBe(deleteSaveSlot);
  });
});
