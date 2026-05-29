// Corruption / monsterification system. This module keeps the persistent
// state transitions together: monster attacks, shrine purification, rampage,
// monster-form acceptance, and rare reverse-potion recovery.

import DATA from '../data.ts';
import { state, runtime } from '../runtime/state.ts';
import { uiState } from '../runtime/ui-state.ts';
import { log, toast } from '../runtime/services.ts';
import { clamp, dist, rand } from './math.ts';
import { regionAt, currentPetScene } from './world.ts';
import { loadScene } from './dungeon.ts';
import { moveActor } from '../display/physics.ts';
import { currentPlayerId, currentPartyId } from './session.ts';
import { refreshCombatStats } from './combat/weapon.ts';
import { autoSave } from '../runtime/autosave.ts';
import type { ActorState, PetState, WorldObjectState } from './types.ts';

const { regions } = DATA;

export const CORRUPTION_MAX = 100;
export const CORRUPTION_HIT_INTERVAL = 2;
export const SHRINE_LOAD_MAX = 50;
export const SHRINE_LOAD_DECAY_INTERVAL = 180;
export const RAMPAGE_WARNING_TIME = 10;
export const RAMPAGE_TIME = 60;

const STRONG_MONSTER_SPECIES = new Set(['gargoyle', 'demonKnight', 'demonKing']);
const CIVILIZED_REGIONS = ['village', 'silverleaf', 'stonegorge'];

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeCorruptionState() {
  const p = state.player;
  p.corruption = clamp(Number(p.corruption || 0), 0, CORRUPTION_MAX);
  p.corruptionHitCooldown = Math.max(0, Number(p.corruptionHitCooldown || 0));
  if (!isPlainRecord(p.corruptionStageWarnings)) p.corruptionStageWarnings = {};
  p.corruptionChoicePending = !!p.corruptionChoicePending;
  p.corruptionRampageWarningTimer = Math.max(0, Number(p.corruptionRampageWarningTimer || 0));
  p.corruptionRampageTimer = Math.max(0, Number(p.corruptionRampageTimer || 0));
  p.corruptionRampageAttackCooldown = Math.max(0, Number(p.corruptionRampageAttackCooldown || 0));
  p.reversePotions = Math.max(0, Math.floor(Number(p.reversePotions || 0)));
  if (p.originalRace === undefined) p.originalRace = null;
  if (!isPlainRecord(state.shrineLoads)) state.shrineLoads = {};
  state.shrineLoadDecayClock = Math.max(0, Number(state.shrineLoadDecayClock || 0));
}

export function isMonsterSource(source: ActorState | null | undefined): boolean {
  return !!source && (source.faction === 'monster' || source.kind === 'monster');
}

export function isDemonCastleSource(source: ActorState | null | undefined): boolean {
  return isMonsterSource(source) && (source.region === 'demon' || source.species === 'demonKnight' || state.scene === 'demon');
}

export function isStrongMonsterSource(source: ActorState | null | undefined): boolean {
  return isDemonCastleSource(source) || (isMonsterSource(source) && STRONG_MONSTER_SPECIES.has(String(source.species || '')));
}

export function shrineLoadKey(obj: WorldObjectState): string {
  return `${state.scene}:${obj.name}:${obj.x}:${obj.y}`;
}

function showStageWarnings(previous: number, next: number) {
  const warnings = state.player.corruptionStageWarnings;
  const stages = [
    [30, '你感知到了危险的气息。'],
    [50, '你警觉地四周望去，但并没有发现魔王的踪迹。'],
    [90, '你感受到了召唤，它来自血脉，来自灵魂。']
  ] as const;
  for (const [stage, message] of stages) {
    const key = String(stage);
    if (previous < stage && next >= stage && !warnings[key]) {
      warnings[key] = true;
      log(message);
      toast(message, 5000);
    }
  }
}

function showCorruptionChoice() {
  const scene = runtime.pSceneRef;
  state.player.corruptionChoicePending = true;
  uiState.corruptionChoiceOpen = true;
  if (scene?.scene?.isActive?.('CorruptionChoiceScene')) return;
  scene?.scene?.launch('CorruptionChoiceScene');
  scene?.scene?.pause();
}

export function resumeCorruptionStateAfterLoad() {
  normalizeCorruptionState();
  uiState.corruptionChoiceOpen = false;
  if (state.player.corruptionChoicePending || state.player.corruption >= CORRUPTION_MAX) {
    state.player.corruption = CORRUPTION_MAX;
    showCorruptionChoice();
  } else if (state.player.corruptionRampageWarningTimer > 0) {
    toast('魔化即将失控。', 5000);
  }
}

export function addCorruption(amount: number, bypassHitInterval = false): number {
  normalizeCorruptionState();
  if (amount <= 0) return 0;
  if (!bypassHitInterval) {
    if (state.player.corruptionHitCooldown > 0) return 0;
    state.player.corruptionHitCooldown = CORRUPTION_HIT_INTERVAL;
  }
  const previous = state.player.corruption;
  const next = clamp(previous + amount, 0, CORRUPTION_MAX);
  state.player.corruption = next;
  const gained = next - previous;
  if (gained <= 0) return 0;
  showStageWarnings(previous, next);
  if (next >= CORRUPTION_MAX) showCorruptionChoice();
  return gained;
}

export function addCorruptionFromMonsterHit(source: ActorState | null | undefined): number {
  if (!isMonsterSource(source) || state.player.monsterForm) return 0;
  return addCorruption(isStrongMonsterSource(source) ? Math.floor(rand(4, 7)) : Math.floor(rand(1, 4)), false);
}

export function addCorruptionFromMonsterDeath(source: ActorState | null | undefined): number {
  if (!isMonsterSource(source) || state.player.monsterForm) return 0;
  return addCorruption(isStrongMonsterSource(source) ? 60 : 40, true);
}

export function hasCorruptionControlLock(): boolean {
  const p = state.player;
  return !!p.corruptionChoicePending || (p.corruptionRampageWarningTimer || 0) > 0 || (p.corruptionRampageTimer || 0) > 0;
}

export function isCorruptionRampaging(): boolean {
  return (state.player.corruptionRampageTimer || 0) > 0;
}

export function chooseSuppressCorruption() {
  normalizeCorruptionState();
  state.player.corruptionChoicePending = false;
  uiState.corruptionChoiceOpen = false;
  const pendingRespawn = state.pendingDeathRespawn;
  state.pendingDeathRespawn = null;
  state.player.hp = Math.max(state.player.hp, Math.ceil(state.player.maxHp * 0.45));
  state.player.invuln = Math.max(state.player.invuln || 0, 1.2);
  state.player.corruptionRampageWarningTimer = RAMPAGE_WARNING_TIME;
  state.player.corruptionRampageTimer = 0;
  state.player.corruptionRampageAttackCooldown = 0.6;
  log('你选择压制魔化，身体开始不听使唤。');
  toast('魔化即将失控。', 5000);
  if (pendingRespawn) {
    state.player.hp = Math.max(1, Math.ceil(state.player.maxHp * 0.5));
    state.player.mp = Math.max(0, Math.ceil(state.player.maxMp * 0.3));
    state.player.stamina = 15;
    loadScene(pendingRespawn.scene, pendingRespawn.x, pendingRespawn.y, pendingRespawn.message);
  }
  const scene = runtime.pSceneRef;
  scene?.scene?.resume();
  scene?.scene?.stop('CorruptionChoiceScene');
  if (!pendingRespawn) autoSave();
}

export function acceptMonsterFate() {
  normalizeCorruptionState();
  const p = state.player;
  if (!p.originalRace) p.originalRace = p.race;
  p.monsterForm = true;
  p.corruption = 60;
  p.corruptionChoicePending = false;
  p.corruptionRampageWarningTimer = 0;
  p.corruptionRampageTimer = 0;
  p.corruptionRampageAttackCooldown = 0;
  p.hp = Math.max(1, Math.ceil(p.maxHp * 0.65));
  for (const regionKey of CIVILIZED_REGIONS) {
    const region = regions[regionKey];
    if (!region) continue;
    region.trust = clamp(region.trust - 35, 0, 100);
    region.hate = clamp(region.hate + 40, 0, 100);
  }
  refreshCombatStats();
  uiState.corruptionChoiceOpen = false;
  state.pendingDeathRespawn = null;
  log('你接受了命运。文明聚落开始恐惧你，普通魔物的敌意降低。');
  const scene = runtime.pSceneRef;
  scene?.scene?.resume();
  scene?.scene?.stop('CorruptionChoiceScene');
  autoSave();
}

export function useReversePotion(): boolean {
  normalizeCorruptionState();
  const p = state.player;
  if ((p.reversePotions || 0) <= 0) return false;
  p.reversePotions -= 1;
  if (p.originalRace) p.race = p.originalRace;
  p.originalRace = null;
  p.monsterForm = false;
  p.corruption = 10;
  p.corruptionChoicePending = false;
  p.corruptionRampageWarningTimer = 0;
  p.corruptionRampageTimer = 0;
  p.corruptionRampageAttackCooldown = 0;
  uiState.corruptionChoiceOpen = false;
  refreshCombatStats();
  log('逆魔药灼烧血脉，魔物化被强行逆转，魔化值降到10。');
  return true;
}

export function purifyAtShrine(obj: WorldObjectState): boolean {
  normalizeCorruptionState();
  const key = shrineLoadKey(obj);
  const load = clamp(Number(state.shrineLoads[key] || 0), 0, SHRINE_LOAD_MAX);
  const remaining = Math.max(0, SHRINE_LOAD_MAX - load);
  const current = Math.floor(state.player.corruption || 0);
  log(`玩家当前魔化值：${current}。当前祠堂负荷：${Math.floor(load)}/${SHRINE_LOAD_MAX}。`);
  if (current <= 0) {
    if (state.player.monsterForm) {
      toast('普通祠堂无法逆转魔物化。');
      return false;
    }
    if ((state.player.deathFatigue || 0) > 0) return false;
    toast('你的精神从来没有这么好过，也不需要净化。');
    return false;
  }
  if (remaining <= 0) {
    toast('战士的伤痕让神明也不堪重负，一会再来吧。');
    return false;
  }
  const transfer = Math.min(current, remaining);
  state.player.corruption = clamp(current - transfer, 0, CORRUPTION_MAX);
  state.shrineLoads[key] = clamp(load + transfer, 0, SHRINE_LOAD_MAX);
  log(`${obj.name || '祠堂'}净化了${Math.floor(transfer)}点魔化值。当前祠堂负荷：${Math.floor(state.shrineLoads[key])}/${SHRINE_LOAD_MAX}。`);
  return true;
}

function decayShrineLoads(dt: number) {
  state.shrineLoadDecayClock += dt;
  while (state.shrineLoadDecayClock >= SHRINE_LOAD_DECAY_INTERVAL) {
    state.shrineLoadDecayClock -= SHRINE_LOAD_DECAY_INTERVAL;
    for (const [key, value] of Object.entries(state.shrineLoads)) {
      const next = Math.max(0, Number(value || 0) - 1);
      if (next <= 0) delete state.shrineLoads[key];
      else state.shrineLoads[key] = next;
    }
  }
}

function woundPetDuringRampage(pet: PetState, amount: number) {
  if (!pet.alive || pet.injured || pet.lost) return;
  pet.hp -= Math.max(1, Math.ceil(amount));
  if (pet.hp > 0) return;
  pet.alive = false;
  pet.injured = true;
  pet.carried = false;
  pet.scene = currentPetScene();
  pet.rescueTimer = 900;
  pet.hp = 0;
  log(`${pet.name}被失控的你重伤倒下。`);
}

function defeatFriendlyDuringRampage(target: ActorState) {
  target.alive = false;
  const region = regions[target.region] || regionAt(target.x || state.player.x, target.y || state.player.y);
  region.trust = clamp(region.trust - 22, 0, 100);
  region.hate = clamp(region.hate + 26, 0, 100);
  log(`${target.name || '友方'}在你的暴走中倒下了。${region.name}信任下降，仇恨上升。`);
}

function nearestRampageTarget(): ActorState | PetState | null {
  const candidates: Array<ActorState | PetState> = [];
  for (const e of state.entities) {
    if (!e.alive) continue;
    if (e.kind === 'npc' || e.kind === 'friendly' || e.kind === 'animal') candidates.push(e);
  }
  for (const pet of state.pets) {
    if (pet.lost || pet.injured || !pet.alive) continue;
    if (pet.ownerId === currentPlayerId() || pet.partyId === currentPartyId()) candidates.push(pet);
  }
  return candidates
    .filter(candidate => dist(candidate, state.player) < 10)
    .sort((a, b) => dist(a, state.player) - dist(b, state.player))[0] || null;
}

function fleeRampagingPlayer(dt: number) {
  for (const pet of state.pets) {
    if (pet.lost || pet.injured || !pet.alive) continue;
    const d = dist(pet, state.player);
    if (d <= 0 || d > 4.2) continue;
    moveActor(pet, (pet.x - state.player.x) / d, (pet.y - state.player.y) / d, (pet.speed || 2.2) * 1.35, dt);
  }
}

function updateRampage(dt: number) {
  const p = state.player;
  const target = nearestRampageTarget();
  if (target) {
    const d = Math.max(0.001, dist(target, p));
    if (d > 0.8) moveActor(p, (target.x - p.x) / d, (target.y - p.y) / d, 4.25, dt);
    p.corruptionRampageAttackCooldown = Math.max(0, (p.corruptionRampageAttackCooldown || 0) - dt);
    if (d <= 1.0 && p.corruptionRampageAttackCooldown <= 0) {
      const amount = Math.max(4, Math.ceil(p.atk * 0.85));
      if ('petId' in target || ('roamRadius' in target && 'guardRange' in target)) {
        woundPetDuringRampage(target as PetState, amount);
      } else {
        const actor = target as ActorState;
        actor.hp = (actor.hp || 1) - amount;
        log(`失控的你攻击${actor.name || '友方'}，造成${amount}点伤害。`);
        if ((actor.hp || 0) <= 0) defeatFriendlyDuringRampage(actor);
      }
      p.corruptionRampageAttackCooldown = 0.72;
    }
  } else {
    moveActor(p, rand(-1, 1), rand(-1, 1), 2.8, dt);
  }
  fleeRampagingPlayer(dt);
}

export function updateCorruption(dt: number) {
  normalizeCorruptionState();
  if (state.player.monsterForm && !state.player.corruptionChoicePending && state.player.corruptionRampageWarningTimer <= 0 && state.player.corruptionRampageTimer <= 0) {
    state.player.corruption = 60;
  }
  state.player.corruptionHitCooldown = Math.max(0, state.player.corruptionHitCooldown - dt);
  decayShrineLoads(dt);
  if (state.player.corruptionChoicePending) {
    state.player.corruption = CORRUPTION_MAX;
    return;
  }
  if (state.player.corruptionRampageWarningTimer > 0) {
    state.player.corruptionRampageWarningTimer = Math.max(0, state.player.corruptionRampageWarningTimer - dt);
    if (state.player.corruptionRampageWarningTimer <= 0) {
      state.player.corruptionRampageTimer = RAMPAGE_TIME;
      state.player.corruptionRampageAttackCooldown = 0.2;
      log('魔化失控，身体开始攻击身边的友方。');
    }
    return;
  }
  if (state.player.corruptionRampageTimer > 0) {
    updateRampage(dt);
    state.player.corruptionRampageTimer = Math.max(0, state.player.corruptionRampageTimer - dt);
    if (state.player.corruptionRampageTimer <= 0) {
      state.player.corruption = 70;
      log('暴走结束，你重新夺回了身体的控制。');
    }
  }
}
