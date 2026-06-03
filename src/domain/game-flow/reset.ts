import DATA from '../../data.ts';
import { state, logs, initialState, initialRegions } from '../../runtime/state.ts';
import { installPlayerCooldowns } from '../../runtime/player-cooldowns.ts';
import { currentLanguage } from '../i18n.ts';
import { replaceObject } from '../math.ts';
import { playableRaces, raceStartPoint, applyRaceStartingLoadout, applyRaceInitialRegionRelations } from '../combat/race.ts';
import { refreshCombatStats } from '../combat/weapon.ts';
import { makeMap } from '../world.ts';
import { spawnWorld } from '../world-spawn.ts';
import { rebuildDisplayIfRegistered } from '../../runtime/display-sync.ts';
import {
  applyGameFlowLanguage,
  clearGameFlowLogPanel,
  clearGameFlowToast,
  renderGameFlowGearPanel,
  resetRuntimeUiForGameFlow
} from '../../runtime/game-flow-ui.ts';
import { normalizeCorruptionState } from '../corruption.ts';
import { normalizeDeathState } from '../death.ts';

const { regions } = DATA;

export function resetGameState(race = '人类') {
  const language = currentLanguage();
  replaceObject(state, initialState);
  replaceObject(regions, initialRegions);
  // replaceObject just copied raw cooldown values back onto state.player —
  // re-install the accessor properties so writes go through the tween path.
  installPlayerCooldowns(state.player);
  state.settings.language = language;
  state.player.race = playableRaces.includes(race) ? race : '人类';
  applyRaceStartingLoadout(state.player.race);
  applyRaceInitialRegionRelations(state.player.race);
  logs.length = 0;
  clearGameFlowLogPanel();
  clearGameFlowToast();
  resetRuntimeUiForGameFlow();
  const start = raceStartPoint(state.player.race);
  makeMap(start.scene);
  spawnWorld(start.scene);
  state.player.x = start.x;
  state.player.y = start.y;
  refreshCombatStats();
  rebuildDisplayIfRegistered();
  renderGameFlowGearPanel();
  applyGameFlowLanguage();
  normalizeCorruptionState();
  normalizeDeathState();
}
