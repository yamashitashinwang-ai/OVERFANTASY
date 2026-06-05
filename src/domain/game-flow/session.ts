import DATA from '../../data.ts';
import { bus, Events } from '../../runtime/events.ts';
import { installPlayerCooldowns } from '../../runtime/player-cooldowns.ts';
import { state, logs, initialState, initialRegions } from '../../runtime/state.ts';
import { uiState } from '../../runtime/ui-state.ts';
import { log } from '../../runtime/services.ts';
import { currentLanguage } from '../i18n.ts';
import { replaceObject } from '../math.ts';
import {
  readSaveSlots, makeSaveId, deleteSaveSlot as domainDeleteSaveSlot, findLatestSave
} from '../persistence.ts';
import { refreshCombatStats } from '../combat/weapon.ts';
import { rebuildDisplayIfRegistered } from '../../runtime/display-sync.ts';
import {
  applyGameFlowLanguage,
  invalidateGameFlowMenuCache,
  renderGameFlowMainMenu,
  resetRuntimeUiForGameFlow
} from '../../runtime/game-flow-ui.ts';
import { resumeCorruptionStateAfterLoad } from '../corruption.ts';
import { syncLostPackagePickupsForScene } from '../lost-packages.ts';
import { resetGameState } from './reset.ts';
import { saveCurrentGame } from './save.ts';
import { ensureStateShape } from './shape.ts';

const { regions } = DATA;

export function startNewGame(race = '人类') {
  resetGameState(race);
  uiState.currentSaveId = makeSaveId();
  uiState.appMode = 'playing';
  saveCurrentGame(false);
  log(`${state.player.race}角色的新游戏开始。当前存档槽已创建。`);
  bus.emit(Events.GAME_NEW, { race });
}

export function startLoadedSave(saveId: string) {
  const save = readSaveSlots().find(item => item.id === saveId);
  if (!save) return;
  const language = currentLanguage();
  replaceObject(state, save.state || initialState);
  replaceObject(regions, save.regions || initialRegions);
  installPlayerCooldowns(state.player);
  ensureStateShape();
  state.settings.language = language;
  uiState.currentSaveId = save.id;
  syncLostPackagePickupsForScene(state.scene);
  logs.length = 0;
  resetRuntimeUiForGameFlow();
  uiState.appMode = 'playing';
  applyGameFlowLanguage();
  refreshCombatStats();
  rebuildDisplayIfRegistered();
  log(`读取了${save.name}。`);
  bus.emit(Events.GAME_LOADED, { saveId });
  resumeCorruptionStateAfterLoad();
}

export function continueLatestSave() {
  const latest = findLatestSave();
  if (latest) startLoadedSave(latest.id);
}

export function deleteSaveSlot(saveId: string) {
  domainDeleteSaveSlot(saveId);
  if (uiState.selectedSaveId === saveId) uiState.selectedSaveId = null;
  if (uiState.pendingDeleteSaveId === saveId) uiState.pendingDeleteSaveId = null;
  if (uiState.currentSaveId === saveId) uiState.currentSaveId = null;
  invalidateGameFlowMenuCache();
  renderGameFlowMainMenu();
}
