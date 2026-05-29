// Player death flow: record the death, roll inventory loss once, create a
// retrievable lost package, apply death fatigue, then respawn or defer to the
// existing corruption threshold choice.

import { state } from '../runtime/state.ts';
import { log } from '../runtime/services.ts';
import { autoSave } from '../runtime/autosave.ts';
import { clamp, clonePlain } from './math.ts';
import { mapBounds, tileAt } from './world.ts';
import { loadScene } from './dungeon.ts';
import { raceStartPoint } from './combat/race.ts';
import { refreshCombatStats } from './combat/weapon.ts';
import { syncResourceTotals } from './inventory.ts';
import { addCorruptionFromMonsterDeath, isMonsterSource } from './corruption.ts';
import { createLostPackage, hasLostPackageContents, normalizeLostPackages, syncLostPackagePickupsForScene } from './lost-packages.ts';
import type {
  ActorState,
  DeathInventorySnapshot,
  DeathRespawnState,
  LostPackageContents,
  ResourceBag,
  SceneKey
} from './types.ts';

const FATIGUE_MAX = 3;
const FATIGUE_RELIEF_INTERVAL = 300;
const NON_CORRUPTING_DEATH_SPECIES = new Set(['slime', 'wolf']);
const UNIQUE_GEAR_IDS = new Set(['conceptSword']);

function bagAdd(bag: ResourceBag, name: string, amount: number) {
  if (amount <= 0) return;
  bag[name] = (bag[name] || 0) + amount;
}

function contentAdd(contents: LostPackageContents, key: 'gold' | 'herbs' | 'potions' | 'arrows', amount: number) {
  if (amount <= 0) return;
  contents[key] = (contents[key] || 0) + amount;
}

function splitCount(amount: number, allowPermanentLoss: boolean): { keep: number; packageAmount: number; lost: number } {
  let keep = 0;
  let packageAmount = 0;
  let lost = 0;
  for (let i = 0; i < Math.max(0, Math.floor(amount)); i += 1) {
    const roll = Math.random();
    if (roll < 0.67) keep += 1;
    else if (roll < 0.97 || !allowPermanentLoss) packageAmount += 1;
    else lost += 1;
  }
  return { keep, packageAmount, lost };
}

export function normalizeDeathState() {
  const p = state.player;
  if (!p.baseMaxHp) p.baseMaxHp = Math.max(1, p.maxHp || 42);
  if (!p.baseMaxMp) p.baseMaxMp = Math.max(1, p.maxMp || 18);
  p.deathFatigue = clamp(Math.floor(Number(p.deathFatigue || 0)), 0, FATIGUE_MAX);
  p.deathFatigueReliefCooldown = Math.max(0, Number(p.deathFatigueReliefCooldown || 0));
  if (!Array.isArray(state.lostPackages)) state.lostPackages = [];
  if (state.lastDeath === undefined) state.lastDeath = null;
  if (state.pendingDeathRespawn === undefined) state.pendingDeathRespawn = null;
  normalizeLostPackages();
  applyDeathFatigueStats();
}

export function applyDeathFatigueStats() {
  const p = state.player;
  const layers = clamp(Math.floor(Number(p.deathFatigue || 0)), 0, FATIGUE_MAX);
  const hpBase = Math.max(1, Number(p.baseMaxHp || p.maxHp || 42));
  const mpBase = Math.max(1, Number(p.baseMaxMp || p.maxMp || 18));
  const multiplier = Math.max(0.1, 1 - layers * 0.1);
  p.maxHp = Math.max(1, Math.ceil(hpBase * multiplier));
  p.maxMp = Math.max(1, Math.ceil(mpBase * multiplier));
  p.hp = Math.min(p.hp, p.maxHp);
  p.mp = Math.min(p.mp, p.maxMp);
  refreshCombatStats();
}

export function deathFatigueStaminaRegenMultiplier(): number {
  normalizeDeathState();
  return Math.max(0.1, 1 - (state.player.deathFatigue || 0) * 0.1);
}

export function updateDeathSystem(dt: number) {
  normalizeDeathState();
  state.player.deathFatigueReliefCooldown = Math.max(0, (state.player.deathFatigueReliefCooldown || 0) - dt);
}

export function relieveDeathFatigue(method: 'rest' | 'shrine'): boolean {
  normalizeDeathState();
  if ((state.player.deathFatigue || 0) <= 0) return false;
  if ((state.player.deathFatigueReliefCooldown || 0) > 0) {
    log(`死亡疲劳还没有松动。还需要${Math.ceil(state.player.deathFatigueReliefCooldown / 60)}分钟。`);
    return false;
  }
  state.player.deathFatigue = Math.max(0, state.player.deathFatigue - 1);
  state.player.deathFatigueReliefCooldown = FATIGUE_RELIEF_INTERVAL;
  applyDeathFatigueStats();
  log(method === 'rest' ? '休息驱散了一层死亡疲劳。' : '祠堂净化驱散了一层死亡疲劳。');
  return true;
}

export function inventorySnapshot(): DeathInventorySnapshot {
  return {
    gold: state.player.gold || 0,
    herbs: state.player.herbs || 0,
    potions: state.player.potions || 0,
    arrows: state.player.arrows || 0,
    rings: state.player.rings || 0,
    reversePotions: state.player.reversePotions || 0,
    resources: clonePlain(state.player.resources || {}),
    materials: clonePlain(state.player.materials || {}),
    gearBag: [...(state.player.gearBag || [])]
  };
}

function rollCountField(key: 'gold' | 'herbs' | 'potions' | 'arrows', contents: LostPackageContents, permanentLosses: LostPackageContents) {
  const current = Math.max(0, Math.floor(Number(state.player[key] || 0)));
  const split = splitCount(current, true);
  state.player[key] = split.keep;
  contentAdd(contents, key, split.packageAmount);
  contentAdd(permanentLosses, key, split.lost);
}

function rollBag(source: ResourceBag, contentsBag: ResourceBag, lostBag: ResourceBag) {
  for (const [name, amount] of Object.entries({ ...source })) {
    const split = splitCount(amount, true);
    if (split.keep > 0) source[name] = split.keep;
    else delete source[name];
    bagAdd(contentsBag, name, split.packageAmount);
    bagAdd(lostBag, name, split.lost);
  }
}

function rollUnequippedGear(contents: LostPackageContents) {
  const equipped = new Set(Object.values(state.player.gear || {}).filter(Boolean));
  const nextGearBag: string[] = [];
  for (const gearId of state.player.gearBag || []) {
    if (equipped.has(gearId) || UNIQUE_GEAR_IDS.has(gearId)) {
      nextGearBag.push(gearId);
      continue;
    }
    if (Math.random() < 0.1) {
      if (!contents.gearBag) contents.gearBag = [];
      contents.gearBag.push(gearId);
    } else {
      nextGearBag.push(gearId);
    }
  }
  state.player.gearBag = nextGearBag;
}

export function rollDeathInventoryLoss(): { packageContents: LostPackageContents; permanentLosses: LostPackageContents } {
  const packageContents: LostPackageContents = { materials: {}, resources: {}, gearBag: [] };
  const permanentLosses: LostPackageContents = { materials: {}, resources: {} };
  rollCountField('gold', packageContents, permanentLosses);
  rollCountField('herbs', packageContents, permanentLosses);
  rollCountField('potions', packageContents, permanentLosses);
  rollCountField('arrows', packageContents, permanentLosses);
  rollBag(state.player.materials || {}, packageContents.materials, permanentLosses.materials);
  rollBag(state.player.resources || {}, packageContents.resources, permanentLosses.resources);
  syncResourceTotals();
  rollUnequippedGear(packageContents);
  if (!Object.keys(packageContents.materials).length) delete packageContents.materials;
  if (!Object.keys(packageContents.resources).length) delete packageContents.resources;
  if (!packageContents.gearBag?.length) delete packageContents.gearBag;
  if (!Object.keys(permanentLosses.materials).length) delete permanentLosses.materials;
  if (!Object.keys(permanentLosses.resources).length) delete permanentLosses.resources;
  return { packageContents, permanentLosses };
}

function isSafePackageTile(x: number, y: number): boolean {
  const bounds = mapBounds();
  if (x < 0.5 || y < 0.5 || x > bounds.w - 0.5 || y > bounds.h - 0.5) return false;
  const tile = tileAt(x, y);
  if (tile === 'wall' || tile === 'water') return false;
  return !state.solids.some(obj => x >= obj.x && x <= obj.x + obj.w && y >= obj.y && y <= obj.y + obj.h);
}

function safePackagePosition(x: number, y: number): { scene: SceneKey; x: number; y: number } {
  if (state.mode === 'dungeon') return { scene: 'ruins', x: 50.5, y: 36.5 };
  if (isSafePackageTile(x, y)) return { scene: state.scene, x, y };
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  for (let radius = 1; radius <= 8; radius += 1) {
    let best: { x: number; y: number; d: number } | null = null;
    for (let yy = ty - radius; yy <= ty + radius; yy += 1) {
      for (let xx = tx - radius; xx <= tx + radius; xx += 1) {
        const candidate = { x: xx + 0.5, y: yy + 0.5 };
        if (!isSafePackageTile(candidate.x, candidate.y)) continue;
        const d = Math.hypot(candidate.x - x, candidate.y - y);
        if (!best || d < best.d) best = { ...candidate, d };
      }
    }
    if (best) return { scene: state.scene, x: best.x, y: best.y };
  }
  const bounds = mapBounds();
  return { scene: state.scene, x: clamp(x, 0.5, bounds.w - 0.5), y: clamp(y, 0.5, bounds.h - 0.5) };
}

function respawnForPlayer(): DeathRespawnState {
  const race = state.player.monsterForm ? (state.player.originalRace || state.player.race) : state.player.race;
  const point = raceStartPoint(race);
  return {
    scene: point.scene,
    x: point.x,
    y: point.y,
    message: '死亡后被送回安全复活点。遗失的包裹留在了倒下的地方。'
  };
}

function sourceReason(source: ActorState | null | undefined): string {
  if (!source) return '环境或未知伤害';
  if (source.kind === 'trap') return '陷阱伤害';
  if (source.faction === 'monster' || source.kind === 'monster') return `被${source.name || '魔物'}击倒`;
  return `被${source.name || '非魔物单位'}击倒`;
}

function isCorruptingDeathSource(source: ActorState | null | undefined): boolean {
  if (!source || state.player.monsterForm) return false;
  if (!isMonsterSource(source)) return false;
  return !NON_CORRUPTING_DEATH_SPECIES.has(String(source.species || ''));
}

export function processPlayerDeath(source: ActorState | null | undefined) {
  normalizeDeathState();
  const deathScene = state.mode === 'dungeon' ? 'dungeon' : state.scene;
  const deathX = state.player.x;
  const deathY = state.player.y;
  const corruptionBefore = state.player.corruption || 0;
  const before = inventorySnapshot();
  let corruptionGain = 0;
  if (isCorruptingDeathSource(source)) corruptionGain = addCorruptionFromMonsterDeath(source);
  const { packageContents, permanentLosses } = rollDeathInventoryLoss();
  const safePackage = safePackagePosition(deathX, deathY);
  const pkg = createLostPackage(safePackage.scene, safePackage.x, safePackage.y, packageContents, deathScene, deathX, deathY);
  state.player.deathFatigue = clamp((state.player.deathFatigue || 0) + 1, 0, FATIGUE_MAX);
  applyDeathFatigueStats();
  const respawn = respawnForPlayer();
  state.lastDeath = {
    id: `death-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    scene: deathScene,
    mode: state.mode,
    x: deathX,
    y: deathY,
    sourceName: source?.name || '未知',
    sourceKind: source?.kind,
    sourceSpecies: source?.species,
    sourceFaction: source?.faction,
    sourceRegion: source?.region,
    reason: sourceReason(source),
    inventoryBefore: before,
    corruptionBefore,
    corruptionAfter: state.player.corruption || 0,
    lostPackageId: pkg?.id || null,
    permanentLosses,
    createdAt: state.time || 0
  };
  state.player.blockTimer = 0;
  state.player.dodgeTimer = 0;
  state.player.invuln = 1.2;
  if (state.player.corruptionChoicePending) {
    state.pendingDeathRespawn = respawn;
    state.player.hp = 1;
    state.player.mp = 0;
    state.player.stamina = 0;
    log(corruptionGain > 0
      ? `死亡触发魔化临界。先作出选择，遗失包裹已经生成。`
      : `死亡后魔化临界。先作出选择，遗失包裹已经生成。`);
    if (state.mode === 'world') syncLostPackagePickupsForScene(state.scene);
    autoSave();
    return;
  }
  state.player.hp = Math.max(1, Math.ceil(state.player.maxHp * 0.5));
  state.player.mp = Math.max(0, Math.ceil(state.player.maxMp * 0.3));
  state.player.stamina = 15;
  loadScene(respawn.scene, respawn.x, respawn.y, respawn.message);
  log(hasLostPackageContents(packageContents) ? '一部分物品掉进了遗失的包裹。' : '这次没有物品掉进遗失包裹。');
}
