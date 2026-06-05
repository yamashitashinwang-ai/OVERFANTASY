import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import DATA from '../data.ts';
import { registerDisplayRebuilder, resetDisplayRebuilder } from '../runtime/display-sync.ts';
import { initialState, state } from '../runtime/state.ts';
import { uiState } from '../runtime/ui-state.ts';
import { clonePlain, replaceObject } from './math.ts';
import { writeSaveSlots } from './persistence.ts';
import { saveRecord } from './persistence.test-fixtures.ts';
import { resetGameState } from './game-flow/reset.ts';
import { startLoadedSave } from './game-flow/session.ts';

function setupDom() {
  document.body.innerHTML = `
    <div id="backpackPanel"></div>
    <div id="questPanel"></div>
    <div id="shopPanel"></div>
    <div id="forgePanel"></div>
    <div id="magicPanel"></div>
    <div id="characterPanel"></div>
    <div id="mainMenu"></div>
    <div id="pauseMenu"></div>
    <div id="toast"></div>
  `;
}

describe('game-flow display sync boundary', () => {
  beforeEach(() => {
    setupDom();
    replaceObject(state, clonePlain(initialState));
    uiState.currentSaveId = null;
    window.localStorage.clear();
    writeSaveSlots([]);
    resetDisplayRebuilder();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    window.localStorage.clear();
    resetDisplayRebuilder();
  });

  it('rebuilds display through the runtime service when resetting for a new game', () => {
    let rebuilds = 0;
    registerDisplayRebuilder(() => { rebuilds += 1; });

    resetGameState('人类');

    expect(rebuilds).toBe(1);
  });

  it('rebuilds display through the runtime service when loading a save', () => {
    let rebuilds = 0;
    registerDisplayRebuilder(() => { rebuilds += 1; });
    writeSaveSlots([saveRecord({
      id: 'save-load',
      state: clonePlain(state),
      regions: clonePlain(DATA.regions)
    })]);

    startLoadedSave('save-load');

    expect(rebuilds).toBe(1);
  });
});
