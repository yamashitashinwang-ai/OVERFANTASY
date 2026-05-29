// Shared runtime state. Domain + display + UI modules all import from here.
// Previously these lived as `let`s in scenes/Game.ts with getX/setX wrappers;
// the wrappers are gone — direct reads/writes via `runtime.attackEffect = ...`.

import DATA from '../data.ts';
import { clonePlain } from '../domain/math.ts';
import type {
  ArrowProjectile, AttackEffect, BowCharge, GameState, MagicEffectState,
  MovementKeys, PendingMagicCast, RegionTable, RuntimeState, SceneRefLike
} from '../domain/types.ts';
import {
  saveSchemaVersion, localPlayerId, localPartyId,
  defaultSessionState
} from '../domain/session.ts';
import { readLanguageSetting } from '../domain/i18n.ts';

const { regions: defaultRegions } = DATA;

// Reassignable runtime singletons. All of these are mutated by game logic +
// read by display each frame. Bundled into one object so ES modules don't
// fight over `let` reassignment across imports.
export const runtime: RuntimeState = {
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
export const logs: string[] = [];
export const flyingArrows: ArrowProjectile[] = [];
export const magicEffects: MagicEffectState[] = [];

// Full game state — what gets serialised on save / restored on load.
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
export const initialState = clonePlain(state) as GameState;
export const initialRegions = clonePlain(defaultRegions) as RegionTable;

// Accessor wrappers — preserved as shims for the handful of remaining call
// sites that still go through the getX/setX API. New code should read /
// write `runtime.X` directly.
export const getAttackEffect = (): AttackEffect | null => runtime.attackEffect;
export const setAttackEffect = (v: AttackEffect | null) => { runtime.attackEffect = v; };
export const getBowCharge = (): BowCharge | null => runtime.bowCharge;
export const setBowCharge = (v: BowCharge | null) => { runtime.bowCharge = v; };
export const getPendingMagicCast = (): PendingMagicCast | null => runtime.pendingMagicCast;
export const setPendingMagicCast = (v: PendingMagicCast | null) => { runtime.pendingMagicCast = v; };
export const getHitStopTimer = (): number => runtime.hitStopTimer;
export const setHitStopTimer = (v: number) => { runtime.hitStopTimer = v; };
export const getAimVector = () => runtime.aimVector;
export const getAimWorld = () => runtime.aimWorld;
export const getMvKeys = (): MovementKeys | null => runtime.mvKeys;
export const getPScene = (): SceneRefLike | null => runtime.pSceneRef;
