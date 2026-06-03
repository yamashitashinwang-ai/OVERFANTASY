import type { ResourceBag } from './common.ts';
import type { QuestState } from './quests.ts';

export interface RegionState {
  name: string;
  trust: number;
  hate: number;
}

export type RegionTable = Record<string, RegionState>;

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
