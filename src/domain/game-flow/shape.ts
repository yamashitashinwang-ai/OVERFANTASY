import { state, initialState } from '../../runtime/state.ts';
import { clamp, clonePlain } from '../math.ts';
import {
  worldOwnerId,
  currentPlayerId, currentPartyId,
  ensureOwnedRecord, ensureSessionState, makeRuntimeId
} from '../session.ts';
import { isValidLanguage, readLanguageSetting } from '../i18n.ts';
import { isRemovedMapWeaponPickup } from '../world.ts';
import { syncResourceTotals } from '../inventory.ts';
import { normalizeCorruptionState } from '../corruption.ts';
import { normalizeDeathState } from '../death.ts';
import { ensureProficiencyState } from '../proficiency.ts';
import type { GearSlot } from '../types.ts';

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
  ensureProficiencyState();
  if (!state.player.corruptionStageWarnings || typeof state.player.corruptionStageWarnings !== 'object') state.player.corruptionStageWarnings = {};
  state.player.corruption = clamp(Number(state.player.corruption || 0), 0, 100);
  state.player.corruptionHitCooldown = Math.max(0, Number(state.player.corruptionHitCooldown || 0));
  state.player.corruptionChoicePending = !!state.player.corruptionChoicePending;
  state.player.corruptionRampageWarningTimer = Math.max(0, Number(state.player.corruptionRampageWarningTimer || 0));
  state.player.corruptionRampageTimer = Math.max(0, Number(state.player.corruptionRampageTimer || 0));
  state.player.corruptionRampageAttackCooldown = Math.max(0, Number(state.player.corruptionRampageAttackCooldown || 0));
  state.player.reversePotions = Math.max(0, Math.floor(Number(state.player.reversePotions || 0)));
  if (state.player.originalRace === undefined) state.player.originalRace = null;
  if (!state.shrineLoads || typeof state.shrineLoads !== 'object' || Array.isArray(state.shrineLoads)) state.shrineLoads = {};
  state.shrineLoadDecayClock = Math.max(0, Number(state.shrineLoadDecayClock || 0));
  if (!Array.isArray(state.lostPackages)) state.lostPackages = [];
  if (state.lastDeath === undefined) state.lastDeath = null;
  if (state.pendingDeathRespawn === undefined) state.pendingDeathRespawn = null;
  normalizeCorruptionState();
  normalizeDeathState();
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
