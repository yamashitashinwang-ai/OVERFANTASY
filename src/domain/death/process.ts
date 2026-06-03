import { state } from '../../runtime/state.ts';
import { log } from '../../runtime/services.ts';
import { autoSave } from '../../runtime/autosave.ts';
import { clamp } from '../math.ts';
import { loadScene } from '../dungeon.ts';
import { raceStartPoint } from '../combat/race.ts';
import { addCorruptionFromMonsterDeath, isMonsterSource } from '../corruption.ts';
import { createLostPackage, hasLostPackageContents, syncLostPackagePickupsForScene } from '../lost-packages.ts';
import { applyDeathFatigueStats, FATIGUE_MAX, normalizeDeathState } from './fatigue.ts';
import { inventorySnapshot, rollDeathInventoryLoss } from './inventory-loss.ts';
import { safePackagePosition } from './package-position.ts';
import type { ActorState, DeathRespawnState } from '../types.ts';

const NON_CORRUPTING_DEATH_SPECIES = new Set(['slime', 'wolf']);

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
