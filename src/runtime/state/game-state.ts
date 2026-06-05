import DATA from '../../data.ts';
import { clonePlain } from '../../domain/math.ts';
import type { GameState, RegionTable } from '../../domain/types.ts';
import {
  saveSchemaVersion, localPlayerId, localPartyId,
  defaultSessionState
} from '../../domain/session.ts';
import { readLanguageSetting } from '../../domain/i18n/storage.ts';
import { createDefaultProficiencyState } from '../../domain/proficiency/defaults.ts';

const { regions: defaultRegions } = DATA;

// Full game state: this is the serializable state shape that save/load and
// gameplay domains mutate. Runtime-only refs live in runtime.ts instead.
export const state: GameState = {
  schemaVersion: saveSchemaVersion,
  session: defaultSessionState(),
  settings: { language: readLanguageSetting() },
  mode: 'world',
  scene: 'field',
  time: 0,
  dayClock: 0,
  newsClock: 0,
  spawnClock: 8,
  toastTimer: 0,
  shrineLoads: {},
  shrineLoadDecayClock: 0,
  lostPackages: [],
  lastDeath: null,
  pendingDeathRespawn: null,
  player: {
    id: localPlayerId,
    ownerId: localPlayerId,
    partyId: localPartyId,
    control: 'local',
    actorType: 'player',
    x: 11.5,
    y: 10.5,
    r: 11,
    hp: 42,
    maxHp: 42,
    baseMaxHp: 42,
    mp: 18,
    maxMp: 18,
    baseMaxMp: 18,
    stamina: 30,
    gold: 16,
    herbs: 1,
    potions: 0,
    arrows: 0,
    rings: 0,
    wood: 0,
    stone: 0,
    resources: {},
    atk: 7,
    def: 0,
    race: '人类',
    job: '剑士',
    proficiency: createDefaultProficiencyState(),
    weapon: '练习剑',
    gear: {
      weapon: 'trainingSword',
      head: null,
      body: 'clothTunic',
      legs: 'linenPants',
      feet: null,
      accessory: null
    },
    gearBag: ['trainingSword', 'clothTunic', 'linenPants'],
    gearMods: {},
    materials: {},
    magicKnown: [],
    magicClues: {},
    mpRegenLock: 0,
    monsterForm: false,
    originalRace: null,
    corruption: 0,
    corruptionHitCooldown: 0,
    corruptionStageWarnings: {},
    corruptionChoicePending: false,
    corruptionRampageWarningTimer: 0,
    corruptionRampageTimer: 0,
    corruptionRampageAttackCooldown: 0,
    reversePotions: 0,
    deathFatigue: 0,
    deathFatigueReliefCooldown: 0,
    spouse: null,
    conceptSword: false,
    lastHitBy: null,
    invuln: 0,
    attackCooldown: 0,
    giftCooldown: 0,
    portalCooldown: 0,
    dodgeCooldown: 0,
    dodgeTimer: 0,
    blockTimer: 0,
    running: false,
    runExhausted: false
  },
  map: [],
  solids: [],
  entities: [],
  pets: [],
  petRemains: [],
  quests: { major: null, small: [] },
  npcMemory: {},
  npcMemoryByPlayer: { [localPlayerId]: {} },
  objects: [],
  pickups: [],
  dungeon: null
};

// Snapshots used by reset/load flows to restore state and static region data.
export const initialState = clonePlain(state) as GameState;
export const initialRegions = clonePlain(defaultRegions) as RegionTable;
