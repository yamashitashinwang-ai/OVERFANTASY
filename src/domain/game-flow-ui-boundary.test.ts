import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import DATA from '../data.ts';
import { registerDisplayRebuilder, resetDisplayRebuilder } from '../runtime/display-sync.ts';
import {
  registerGameFlowUiHandlers,
  resetGameFlowUiHandlers
} from '../runtime/game-flow-ui.ts';
import { initialState, state } from '../runtime/state.ts';
import { uiState } from '../runtime/ui-state.ts';
import { clonePlain, replaceObject } from './math.ts';
import { writeSaveSlots } from './persistence.ts';
import { saveRecord } from './persistence.test-fixtures.ts';
import { resetGameState } from './game-flow/reset.ts';
import { deleteSaveSlot, startLoadedSave } from './game-flow/session.ts';
import { saveCurrentGame } from './game-flow/save.ts';

function resetRuntimeState() {
  replaceObject(state, clonePlain(initialState));
  uiState.currentSaveId = null;
  uiState.selectedSaveId = null;
  uiState.pendingDeleteSaveId = null;
  window.localStorage.clear();
  writeSaveSlots([]);
  resetDisplayRebuilder();
  resetGameFlowUiHandlers();
}

function registerCallHandlers(calls: string[]) {
  registerGameFlowUiHandlers({
    clearLogPanel: () => calls.push('clearLog'),
    clearToast: () => calls.push('clearToast'),
    resetRuntimeUi: () => calls.push('resetUi'),
    applyLanguage: () => calls.push('applyLanguage'),
    renderGearPanel: () => calls.push('renderGear'),
    invalidateMenuCache: () => calls.push('invalidateMenu'),
    renderMainMenu: () => calls.push('renderMainMenu')
  });
}

describe('game-flow UI boundary', () => {
  beforeEach(resetRuntimeState);
  afterEach(resetRuntimeState);

  it('requests UI cleanup and refresh through runtime handlers when resetting', () => {
    const calls: string[] = [];
    registerCallHandlers(calls);

    resetGameState('人类');

    expect(calls).toEqual([
      'clearLog',
      'clearToast',
      'resetUi',
      'renderGear',
      'applyLanguage'
    ]);
  });

  it('requests UI cleanup and refresh through runtime handlers when loading', () => {
    const calls: string[] = [];
    registerCallHandlers(calls);
    registerDisplayRebuilder(() => calls.push('rebuildDisplay'));
    writeSaveSlots([saveRecord({
      id: 'save-load',
      state: clonePlain(state),
      regions: clonePlain(DATA.regions)
    })]);

    startLoadedSave('save-load');

    expect(calls).toEqual([
      'clearLog',
      'resetUi',
      'applyLanguage',
      'rebuildDisplay',
      'renderGear'
    ]);
  });

  it('invalidates the menu cache after saving without rendering the menu', () => {
    const calls: string[] = [];
    registerCallHandlers(calls);
    uiState.currentSaveId = 'save-current';

    const record = saveCurrentGame(false);

    expect(record.id).toBe('save-current');
    expect(calls).toEqual(['invalidateMenu']);
  });

  it('invalidates and renders the menu after deleting a save slot', () => {
    const calls: string[] = [];
    registerCallHandlers(calls);
    writeSaveSlots([saveRecord({ id: 'save-delete' })]);
    uiState.currentSaveId = 'save-delete';
    uiState.selectedSaveId = 'save-delete';
    uiState.pendingDeleteSaveId = 'save-delete';

    deleteSaveSlot('save-delete');

    expect(uiState.currentSaveId).toBeNull();
    expect(uiState.selectedSaveId).toBeNull();
    expect(uiState.pendingDeleteSaveId).toBeNull();
    expect(calls).toEqual(['invalidateMenu', 'renderMainMenu']);
  });
});
