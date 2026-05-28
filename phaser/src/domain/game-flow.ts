// Game lifecycle — reset / new game / load / continue / delete save.  These
// orchestrate the state mutation + persistence + bus events for major game
// transitions.

import DATA from '../data.ts';
import { state, runtime, logs, flyingArrows, magicEffects, initialState, initialRegions } from '../runtime/state.ts';
import { bus, Events } from '../runtime/events.ts';
import { setAutoSaveHandler } from '../runtime/autosave.ts';
import { uiState, isPlaying } from '../runtime/ui-state.ts';
import { log } from '../runtime/services.ts';
import { clonePlain, replaceObject } from './math.ts';
import {
  worldOwnerId,
  currentPlayerId, currentPartyId,
  ensureOwnedRecord, ensureSessionState, makeRuntimeId
} from './session.ts';
import { isValidLanguage, readLanguageSetting, currentLanguage } from './i18n.ts';
import { isRemovedMapWeaponPickup } from './world.ts';
import { syncResourceTotals } from './inventory.ts';
import {
  readSaveSlots, makeSaveId, buildSaveRecord, commitSaveRecord,
  deleteSaveSlot as domainDeleteSaveSlot, findLatestSave
} from './persistence.ts';
import {
  playableRaces, raceStartPoint, applyRaceStartingLoadout, applyRaceInitialRegionRelations
} from './combat/race.ts';
import { refreshCombatStats } from './combat/weapon.ts';
import { makeMap } from './world.ts';
import { spawnWorld } from './world-spawn.ts';
import { rebuildDisplay } from '../display/index.ts';
import { resetRuntimeUi, applyLanguage } from '../ui/dom-chrome.ts';
import { renderGearPanel } from '../ui/gear.ts';
import { renderMainMenu } from '../ui/menus.ts';
import { htmlCache } from '../ui/cache.ts';
import { get as domGet } from '../ui/dom.ts';
import { installPlayerCooldowns } from '../runtime/player-cooldowns.ts';
import type { GearSlot } from './types.ts';

const { regions } = DATA;

export function ensureStateShape() {
  if (!state.player) state.player = clonePlain(initialState.player);
  for (const [key, value] of Object.entries(initialState.player)) {
    if (state.player[key] === undefined) state.player[key] = clonePlain(value);
  }
  ensureSessionState();
  if (!state.settings || typeof state.settings !== 'object') state.settings = { language: readLanguageSetting() };
  if (!isValidLanguage(state.settings.language)) state.settings.language = readLanguageSetting();
  state.player.id = currentPlayerId();
  state.player.ownerId = currentPlayerId();
  state.player.partyId = currentPartyId();
  state.player.control = state.player.control || 'local';
  state.player.actorType = 'player';
  if (!state.player.gear) state.player.gear = clonePlain(initialState.player.gear);
  for (const [slot, gearId] of Object.entries(initialState.player.gear) as [GearSlot, string | null][]) {
    if (state.player.gear[slot] === undefined) state.player.gear[slot] = gearId;
  }
  if (!Array.isArray(state.player.gearBag)) state.player.gearBag = clonePlain(initialState.player.gearBag);
  for (const gearId of Object.values(state.player.gear)) {
    if (gearId && !state.player.gearBag.includes(gearId)) state.player.gearBag.push(gearId);
  }
  if (!state.player.gear.weapon) {
    state.player.gear.weapon = 'trainingSword';
    if (!state.player.gearBag.includes('trainingSword')) state.player.gearBag.push('trainingSword');
  }
  if (!state.player.gearMods || typeof state.player.gearMods !== 'object') state.player.gearMods = {};
  if (!state.player.materials || typeof state.player.materials !== 'object') state.player.materials = {};
  const hadResources = state.player.resources && typeof state.player.resources === 'object' && !Array.isArray(state.player.resources);
  if (!hadResources) state.player.resources = {};
  if (!hadResources) {
    if ((state.player.wood || 0) > 0) state.player.resources['木材'] = (state.player.resources['木材'] || 0) + state.player.wood;
    if ((state.player.stone || 0) > 0) state.player.resources['反重力石'] = (state.player.resources['反重力石'] || 0) + state.player.stone;
  }
  syncResourceTotals();
  if (!Array.isArray(state.player.magicKnown)) state.player.magicKnown = [];
  if (!state.player.magicClues || typeof state.player.magicClues !== 'object') state.player.magicClues = {};
  if (!Array.isArray(state.map)) state.map = [];
  if (!Array.isArray(state.solids)) state.solids = [];
  if (!Array.isArray(state.entities)) state.entities = [];
  for (const entity of state.entities) {
    if (!entity.id) entity.id = makeRuntimeId(entity.species || entity.kind || 'entity');
    if (!entity.ownerId) entity.ownerId = worldOwnerId;
    if ((entity.kind === 'npc' || entity.kind === 'friendly') && !entity.relationId) entity.relationId = entity.name;
  }
  if (!Array.isArray(state.objects)) state.objects = [];
  for (const object of state.objects) {
    if (!object.id) object.id = makeRuntimeId(`object:${object.kind || 'unknown'}`);
    if (!object.ownerId) object.ownerId = worldOwnerId;
  }
  if (!Array.isArray(state.pickups)) state.pickups = [];
  for (const pickup of state.pickups) {
    if (!pickup.id) pickup.id = makeRuntimeId('pickup');
    if (!pickup.ownerId) pickup.ownerId = worldOwnerId;
    if (pickup.reservedFor === undefined) pickup.reservedFor = null;
    if (pickup.takenBy === undefined) pickup.takenBy = null;
  }
  state.pickups = state.pickups.filter(p => !isRemovedMapWeaponPickup(p));
  if (!Array.isArray(state.pets)) state.pets = [];
  for (const pet of state.pets) ensureOwnedRecord(pet, currentPlayerId());
  if (!Array.isArray(state.petRemains)) state.petRemains = [];
  for (const remain of state.petRemains) ensureOwnedRecord(remain, currentPlayerId());
  if (!state.scene) state.scene = 'field';
  if (!state.mode) state.mode = 'world';
  if (typeof state.time !== 'number') state.time = 0;
  if (typeof state.dayClock !== 'number') state.dayClock = 0;
  if (typeof state.newsClock !== 'number') state.newsClock = 0;
  if (typeof state.spawnClock !== 'number') state.spawnClock = 8;
}

export function saveCurrentGame(announce = false) {
  if (!uiState.currentSaveId) uiState.currentSaveId = makeSaveId();
  const record = buildSaveRecord(uiState.currentSaveId, regions);
  commitSaveRecord(record);
  htmlCache.menu = '';
  if (announce) log('游戏已保存。');
  bus.emit(Events.GAME_SAVED, { saveId: uiState.currentSaveId });
  return record;
}

export function autoSave() {
  if (uiState.currentSaveId && isPlaying()) saveCurrentGame(false);
}

setAutoSaveHandler(autoSave);

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
  if (domGet.logEl) domGet.logEl.innerHTML = '';
  if (domGet.toastEl) domGet.toastEl.textContent = '';
  resetRuntimeUi();
  const start = raceStartPoint(state.player.race);
  makeMap(start.scene);
  spawnWorld(start.scene);
  state.player.x = start.x;
  state.player.y = start.y;
  refreshCombatStats();
  rebuildDisplay();
  renderGearPanel();
  applyLanguage();
}

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
  logs.length = 0;
  if (domGet.logEl) domGet.logEl.innerHTML = '';
  resetRuntimeUi();
  uiState.appMode = 'playing';
  applyLanguage();
  refreshCombatStats();
  rebuildDisplay();
  renderGearPanel();
  log(`读取了${save.name}。`);
  bus.emit(Events.GAME_LOADED, { saveId });
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
  htmlCache.menu = '';
  renderMainMenu();
}
