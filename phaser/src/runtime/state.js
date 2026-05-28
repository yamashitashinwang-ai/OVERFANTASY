// Shared runtime state. Domain + display + UI modules all import from here.
// Previously these lived as `let`s in scenes/Game.js with getX/setX wrappers;
// the wrappers are gone — direct reads/writes via `runtime.attackEffect = ...`.

import DATA from '../data.js';
import { clonePlain } from '../domain/math.js';
import {
  saveSchemaVersion, localPlayerId, localPartyId,
  defaultSessionState
} from '../domain/session.js';
import { readLanguageSetting } from '../domain/i18n.js';

const { regions: defaultRegions } = DATA;

// Reassignable runtime singletons. All of these are mutated by game logic +
// read by display each frame. Bundled into one object so ES modules don't
// fight over `let` reassignment across imports.
export const runtime = {
  attackEffect: null,
  bowCharge: null,
  pendingMagicCast: null,
  hitStopTimer: 0,
  aimVector: { x: 1, y: 0 },
  aimWorld: null,
  mvKeys: null,
  pSceneRef: null
};

// Append-only collections.
export const logs = [];
export const flyingArrows = [];
export const magicEffects = [];

// Full game state — what gets serialised on save / restored on load.
export const state = {
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
    mp: 18,
    maxMp: 18,
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
    spouse: null,
    conceptSword: false,
    lastHitBy: null,
    invuln: 0,
    attackCooldown: 0,
    giftCooldown: 0,
    dodgeCooldown: 0,
    dodgeTimer: 0,
    blockTimer: 0,
    running: false
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

// Snapshot for resets. `regions` lives in DATA but we keep its initial shape
// here so the game-flow domain can restore both state + regions atomically.
export const initialState = clonePlain(state);
export const initialRegions = clonePlain(defaultRegions);

// Accessor wrappers — preserved as shims for the handful of remaining call
// sites that still go through the getX/setX API. New code should read /
// write `runtime.X` directly.
export const getAttackEffect     = () => runtime.attackEffect;
export const setAttackEffect     = v => { runtime.attackEffect = v; };
export const getBowCharge        = () => runtime.bowCharge;
export const setBowCharge        = v => { runtime.bowCharge = v; };
export const getPendingMagicCast = () => runtime.pendingMagicCast;
export const setPendingMagicCast = v => { runtime.pendingMagicCast = v; };
export const getHitStopTimer     = () => runtime.hitStopTimer;
export const setHitStopTimer     = v => { runtime.hitStopTimer = v; };
export const getAimVector        = () => runtime.aimVector;
export const getAimWorld         = () => runtime.aimWorld;
export const getMvKeys           = () => runtime.mvKeys;
export const getPScene           = () => runtime.pSceneRef;
