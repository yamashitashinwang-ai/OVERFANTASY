import { state } from '../../runtime/state.ts';
import { log } from '../../runtime/services.ts';
import { CORRUPTION_MAX, RAMPAGE_TIME } from './constants.ts';
import { normalizeCorruptionState } from './state.ts';
import { decayShrineLoads } from './shrine.ts';
import { updateRampage } from './rampage.ts';

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
