import DATA from '../../data.ts';
import { state, runtime } from '../../runtime/state.ts';
import { uiState } from '../../runtime/ui-state.ts';
import { autoSave } from '../../runtime/autosave.ts';
import { log, toast } from '../../runtime/services.ts';
import { clamp } from '../math.ts';
import { loadScene } from '../dungeon.ts';
import { refreshCombatStats } from '../combat/weapon.ts';
import { tryAwardSurvivalProficiency } from '../proficiency.ts';
import { CIVILIZED_REGIONS, CORRUPTION_MAX, RAMPAGE_WARNING_TIME } from './constants.ts';
import { normalizeCorruptionState } from './state.ts';

const { regions } = DATA;

export function showCorruptionChoice() {
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
  const before = p.corruption || 0;
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
  if ((p.corruption || 0) < before) tryAwardSurvivalProficiency();
  log('逆魔药灼烧血脉，魔物化被强行逆转，魔化值降到10。');
  return true;
}
