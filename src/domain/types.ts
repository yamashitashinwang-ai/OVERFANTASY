export type SceneKey = string;
export type ResourceBag = Record<string, number>;
export type FlagBag = Record<string, boolean>;

export interface Vector2 {
  x: number;
  y: number;
}

export interface RegionState {
  name: string;
  trust: number;
  hate: number;
}

export type RegionTable = Record<string, RegionState>;

export interface OwnedRecord {
  id?: string;
  ownerId?: string;
  partyId?: string;
}

export interface GearMod {
  material?: string;
  label?: string;
  atk?: number;
  def?: number;
  thorns?: number;
  slowOnHit?: number;
  slowOnBlock?: number;
  aoeSlowOnHit?: number;
  repelMonsters?: boolean;
  cooldownMult?: number;
  radius?: number;
  duration?: number;
  [key: string]: unknown;
}

export type GearSlot = 'weapon' | 'head' | 'body' | 'legs' | 'feet' | 'accessory';
export type PlayerGear = Record<GearSlot, string | null>;

export interface DropSpec {
  kind: string;
  name: string;
  color: string;
  chance: number;
  value?: number;
}

export interface BestiaryEntry {
  name: string;
  kind: string;
  faction: string;
  color: string;
  r: number;
  hp: number;
  atk: number;
  speed: number;
  flee?: boolean;
  split?: boolean;
  pounce?: boolean;
  guard?: boolean;
  ranged?: boolean;
  commonDrop?: DropSpec;
  rareDrop?: DropSpec;
  extraDrops?: DropSpec[];
  [key: string]: unknown;
}

export interface GearCatalogItem {
  slot: GearSlot;
  name: string;
  type?: string;
  atk?: number;
  def?: number;
  range?: number;
  cooldown?: number;
  stamina?: number;
  note?: string;
  [key: string]: unknown;
}

export interface MaterialCatalogItem {
  sell?: number;
  atk?: number;
  def?: number;
  unsellable?: boolean;
  cooldownMult?: number;
  repel?: boolean;
  thorns?: number;
  slow?: number;
  aoeSlow?: number;
  radius?: number;
  duration?: number;
  pet?: string;
  desc?: string;
}

export interface ResourceCatalogItem {
  group: string;
  desc: string;
}

export interface WeaponForgeRecipe {
  gearId: string;
  materials: ResourceBag;
}

export interface PetCatalogItem {
  name: string;
  color: string;
  r: number;
  maxHp: number;
  atk: number;
  speed: number;
  roamRadius: number;
  attackRange: number;
  guardRange: number;
  cooldown: number;
}

export interface MagicCatalogItem {
  name: string;
  aliases: string[];
  cost: number;
  kind: string;
  damage?: number;
  heal?: number;
  damagePerSecond?: number;
  slowPower?: number;
  radius: number;
  color: string;
  chant?: number;
  effectDuration?: number;
  desc?: string;
  clueLine?: string;
}

export interface QuestTemplate extends QuestState {
  id: string;
  reward: Record<string, number | [number, number]>;
}

export interface DataCatalog {
  regions: RegionTable;
  colors: Record<string, string>;
  sceneNames: Record<string, string>;
  bestiary: Record<string, BestiaryEntry>;
  gearCatalog: Record<string, GearCatalogItem>;
  materialCatalog: Record<string, MaterialCatalogItem>;
  resourceCatalog: Record<string, ResourceCatalogItem>;
  weaponForgeCatalog: Record<string, WeaponForgeRecipe[]>;
  petCatalog: Record<string, PetCatalogItem>;
  magicCatalog: Record<string, MagicCatalogItem>;
  questCatalog: {
    major: QuestTemplate[];
    small: QuestTemplate[];
  };
  graveDecayInterval: number;
  graveMaxDecay: number;
}

export interface ActorState extends OwnedRecord, Vector2 {
  kind?: string;
  actorType?: string;
  name?: string;
  relationId?: string;
  species?: string;
  faction?: string;
  region?: string;
  r?: number;
  color?: string;
  hp?: number;
  maxHp?: number;
  mp?: number;
  maxMp?: number;
  stamina?: number;
  atk?: number;
  def?: number;
  speed?: number;
  alive?: boolean;
  cooldown?: number;
  cooldownTimer?: number;
  specialClock?: number;
  playerAggro?: number;
  petAggro?: Record<string, number>;
  slowTimer?: number;
  slowPower?: number;
  arrowHits?: number;
  guard?: boolean;
  ranged?: boolean;
  pounce?: boolean;
  flee?: boolean;
  split?: boolean;
  slimeGen?: number;
  wounded?: boolean;
  wantsTalk?: boolean;
  lastTalk?: number;
  affection?: number;
  devotion?: number;
  [key: string]: unknown;
}

export interface PlayerState extends ActorState {
  id: string;
  ownerId: string;
  partyId: string;
  control: string;
  actorType: 'player';
  x: number;
  y: number;
  r: number;
  hp: number;
  maxHp: number;
  baseMaxHp: number;
  mp: number;
  maxMp: number;
  baseMaxMp: number;
  stamina: number;
  gold: number;
  herbs: number;
  potions: number;
  arrows: number;
  rings: number;
  wood: number;
  stone: number;
  resources: ResourceBag;
  atk: number;
  def: number;
  race: string;
  job: string;
  weapon: string;
  gear: PlayerGear;
  gearBag: string[];
  gearMods: Record<string, GearMod[]>;
  materials: ResourceBag;
  magicKnown: string[];
  magicClues: FlagBag;
  mpRegenLock: number;
  monsterForm: boolean;
  originalRace: string | null;
  corruption: number;
  corruptionHitCooldown: number;
  corruptionStageWarnings: FlagBag;
  corruptionChoicePending: boolean;
  corruptionRampageWarningTimer: number;
  corruptionRampageTimer: number;
  corruptionRampageAttackCooldown: number;
  reversePotions: number;
  deathFatigue: number;
  deathFatigueReliefCooldown: number;
  spouse: string | null;
  conceptSword: boolean;
  lastHitBy: ActorState | null;
  invuln: number;
  attackCooldown: number;
  giftCooldown: number;
  portalCooldown: number;
  dodgeCooldown: number;
  dodgeTimer: number;
  blockTimer: number;
  running: boolean;
}

export interface PetState extends ActorState {
  id: string;
  petId?: string;
  name: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  alive: boolean;
  injured?: boolean;
  carried?: boolean;
  lost?: boolean;
  dead?: boolean;
  rescueTimer?: number;
  scene?: SceneKey;
  roamRadius?: number;
  guardRange?: number;
  attackRange?: number;
  cooldown?: number;
  cooldownTimer?: number;
  wanderTimer?: number;
  wanderX?: number;
  wanderY?: number;
}

export interface PetRemainState extends OwnedRecord, Vector2 {
  id: string;
  kind: 'corpse' | 'grave' | string;
  petName: string;
  scene: SceneKey;
  color?: string;
  age: number;
  decay: number;
  decayClock: number;
}

export interface WorldObjectState extends OwnedRecord, Vector2 {
  id: string;
  kind: string;
  name: string;
  w: number;
  h: number;
  color: string;
  action?: string;
  sourceScene?: SceneKey;
  portalId?: string;
  targetMapId?: SceneKey;
  targetScene?: SceneKey;
  targetSpawnId?: string;
  [key: string]: unknown;
}

export interface PickupState extends OwnedRecord, Vector2 {
  id: string;
  kind: string;
  name: string;
  color: string;
  value: number;
  reservedFor?: string | null;
  sourceId?: string | null;
  taken?: boolean;
  takenBy?: string | null;
  scene?: SceneKey;
  contents?: LostPackageContents;
}

export interface LostPackageContents {
  gold?: number;
  herbs?: number;
  potions?: number;
  arrows?: number;
  materials?: ResourceBag;
  resources?: ResourceBag;
  gearBag?: string[];
}

export interface LostPackageState extends OwnedRecord, Vector2 {
  id: string;
  scene: SceneKey;
  name: string;
  color: string;
  contents: LostPackageContents;
  taken?: boolean;
  createdAt: number;
  deathScene?: SceneKey;
  deathX?: number;
  deathY?: number;
}

export interface DeathInventorySnapshot {
  gold: number;
  herbs: number;
  potions: number;
  arrows: number;
  rings: number;
  reversePotions: number;
  resources: ResourceBag;
  materials: ResourceBag;
  gearBag: string[];
}

export interface DeathRecordState {
  id: string;
  scene: SceneKey;
  mode: string;
  x: number;
  y: number;
  sourceName: string;
  sourceKind?: string;
  sourceSpecies?: string;
  sourceFaction?: string;
  sourceRegion?: string;
  reason: string;
  inventoryBefore: DeathInventorySnapshot;
  corruptionBefore: number;
  corruptionAfter: number;
  lostPackageId?: string | null;
  permanentLosses?: LostPackageContents;
  createdAt: number;
}

export interface DeathRespawnState {
  scene: SceneKey;
  x: number;
  y: number;
  message: string;
}

export interface QuestState extends OwnedRecord {
  id?: string;
  instanceId?: string;
  name: string;
  type: string;
  giver?: string;
  targetNpc?: string;
  targetName?: string;
  species?: string;
  scene?: SceneKey;
  x?: number;
  y?: number;
  radius?: number;
  count?: number;
  progress?: number;
  goalDone?: boolean;
  delivered?: boolean;
  settled?: boolean;
  autoSettleAt?: number | null;
  autoSettleDelay?: number;
  reward?: Record<string, number | [number, number]>;
  [key: string]: unknown;
}

export interface QuestStateBag {
  major: QuestState | null;
  small: QuestState[];
}

export interface NpcMemoryState {
  ownerId: string;
  affection: number;
  devotion: number;
}

export interface SessionPlayerState {
  id: string;
  name: string;
  partyId: string;
  control: string;
  connected: boolean;
}

export interface SessionState {
  schemaVersion: number;
  playMode: string;
  localPlayerId: string;
  hostPlayerId: string;
  partyId: string;
  players: Record<string, SessionPlayerState>;
}

export interface GameState {
  schemaVersion: number;
  session: SessionState;
  settings: { language: string };
  mode: 'world' | 'dungeon' | string;
  scene: SceneKey;
  time: number;
  dayClock: number;
  newsClock: number;
  spawnClock: number;
  toastTimer: number;
  shrineLoads: Record<string, number>;
  shrineLoadDecayClock: number;
  lostPackages: LostPackageState[];
  lastDeath: DeathRecordState | null;
  pendingDeathRespawn: DeathRespawnState | null;
  player: PlayerState;
  map: string[][];
  solids: WorldObjectState[];
  entities: ActorState[];
  pets: PetState[];
  petRemains: PetRemainState[];
  quests: QuestStateBag;
  npcMemory: Record<string, NpcMemoryState>;
  npcMemoryByPlayer: Record<string, Record<string, NpcMemoryState>>;
  objects: WorldObjectState[];
  pickups: PickupState[];
  dungeon: { w: number; h: number } | null;
}

export interface AttackEffect {
  shape: string;
  effect: string;
  angle: number;
  duration: number;
  weaponType?: string;
  weaponName?: string;
  hit?: boolean;
  critical?: boolean;
  time?: number;
  reach?: number;
  halfAngle?: number;
  halfWidth?: number;
  centerDist?: number;
  radius?: number;
  color?: string;
  lineWidth?: number;
  [key: string]: unknown;
}

export interface BowCharge {
  time: number;
  rushed?: boolean;
}

export interface PendingMagicCast {
  spellId: string;
  timer: number;
  total: number;
}

export interface ArrowProjectile extends Vector2 {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  vx: number;
  vy: number;
  speed: number;
  angle: number;
  range: number;
  traveled: number;
  damageScale: number;
  weaponAtk: number;
}

export interface MagicEffectState extends Vector2 {
  spellId: string;
  name?: string;
  kind?: string;
  radius: number;
  color?: string;
  time: number;
  duration: number;
  tickTimer: number;
  damagePerSecond?: number;
  slowPower?: number;
}

export interface MovementKeyLike {
  isDown: boolean;
}

export interface MovementKeys {
  up: MovementKeyLike;
  down: MovementKeyLike;
  left: MovementKeyLike;
  right: MovementKeyLike;
  upAlt: MovementKeyLike;
  downAlt: MovementKeyLike;
  leftAlt: MovementKeyLike;
  rightAlt: MovementKeyLike;
  run: MovementKeyLike;
  dodge: MovementKeyLike;
}

export interface SceneControllerLike {
  launch(key: string): void;
  pause(): void;
  resume(): void;
  stop(key?: string): void;
  isActive?(key: string): boolean;
}

export interface SceneRefLike {
  scene: SceneControllerLike;
}

export interface RuntimeState {
  attackEffect: AttackEffect | null;
  bowCharge: BowCharge | null;
  pendingMagicCast: PendingMagicCast | null;
  hitStopTimer: number;
  aimVector: Vector2;
  aimWorld: Vector2 | null;
  mvKeys: MovementKeys | null;
  pSceneRef: SceneRefLike | null;
}
