import DATA from '../../data.ts';
import { bus, Events } from '../../runtime/events.ts';
import { setAutoSaveHandler } from '../../runtime/autosave.ts';
import { uiState, isPlaying } from '../../runtime/ui-state.ts';
import { log } from '../../runtime/services.ts';
import { invalidateGameFlowMenuCache } from '../../runtime/game-flow-ui.ts';
import { makeSaveId, buildSaveRecord, commitSaveRecord } from '../persistence.ts';

const { regions } = DATA;

export function saveCurrentGame(announce = false) {
  if (!uiState.currentSaveId) uiState.currentSaveId = makeSaveId();
  const record = buildSaveRecord(uiState.currentSaveId, regions);
  commitSaveRecord(record);
  invalidateGameFlowMenuCache();
  if (announce) log('游戏已保存。');
  bus.emit(Events.GAME_SAVED, { saveId: uiState.currentSaveId });
  return record;
}

export function autoSave() {
  if (uiState.currentSaveId && isPlaying()) saveCurrentGame(false);
}

setAutoSaveHandler(autoSave);
