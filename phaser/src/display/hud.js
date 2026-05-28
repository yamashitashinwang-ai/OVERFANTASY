// Fixed-to-viewport HUD: area name, weapon line, HP/MP/Stamina bars,
// cooldown text, dungeon exit hint, and magic chant progress bar.

import { display as D } from './runtime.js';
import { hexToInt } from './colors.js';
import {
  state, tile, W, H,
  magicCatalog,
  clamp, formatNumber,
  currentWeapon, currentAreaName, refreshCombatStats, hasPathosEffect,
  getPendingMagicCast
} from '../scenes/Game.js';

export function syncHudDisplay() {
  if (!D.pScene || !D.hudBarsGfx) return;
  refreshCombatStats();
  const weapon = currentWeapon();
  const pathos = hasPathosEffect();

  D.hudAreaText.setText(`${currentAreaName()}  ${state.player.monsterForm ? '魔物化' : state.player.race + ' ' + state.player.job}${pathos ? ' 悲怆' : ''}`);
  D.hudWeaponText.setText(`${weapon.name} ${weapon.type} 攻${state.player.atk} 防${state.player.def}  箭${state.player.arrows || 0}`);

  // Show / hide the monsterForm banner (top-centre warning).
  if (D.monsterFormBanner) D.monsterFormBanner.setVisible(!!state.player.monsterForm);

  D.hudBarsGfx.clear();
  const drawBar = (value, max, barY, color) => {
    const safeMax = Math.max(1, max || 1);
    D.hudBarsGfx.fillStyle(0x111820, 1);
    D.hudBarsGfx.fillRect(104, barY, 180, 9);
    D.hudBarsGfx.fillStyle(color, 1);
    D.hudBarsGfx.fillRect(104, barY, 180 * clamp(value / safeMax, 0, 1), 9);
  };
  drawBar(Math.max(0, state.player.hp), state.player.maxHp, 70, 0xe85b5b);
  drawBar(state.player.mp, state.player.maxMp, 86, 0x5aa7ff);
  drawBar(state.player.stamina, 30, 102, state.player.running ? 0xf3c45b : 0x62c78f);

  // Labels for bars
  D.hudBarsGfx.fillStyle(0xdbe4ea, 1);
  // bar labels are drawn as Text in create() — see hudBarLabels

  D.hudCooldownText.setText(`冷却 攻${state.player.attackCooldown.toFixed(2)}s  闪${state.player.dodgeCooldown.toFixed(2)}s`);

  // Hp/Mp/Stamina label text
  if (D.hpLabel) D.hpLabel.setText(`生命 ${Math.max(0, Math.floor(state.player.hp))}/${state.player.maxHp}`);
  if (D.mpLabel) D.mpLabel.setText(`魔力 ${formatNumber(state.player.mp)}/${state.player.maxMp}`);
  if (D.staminaLabel) D.staminaLabel.setText(`体力 ${state.player.stamina.toFixed(1)}/30`);

  // Exit hint for dungeon
  if (D.exitHintText) {
    let showExit = false;
    if (state.mode === 'dungeon') {
      const exitObj = state.objects.find(o => o.kind === 'exit');
      if (exitObj && Math.abs(state.player.x - 3) < 1.2 && Math.abs(state.player.y - 9.5) < 2.0) showExit = true;
    }
    D.exitHintText.setVisible(showExit);
  }

  // Magic chant bar
  if (getPendingMagicCast()) {
    const spell = magicCatalog[getPendingMagicCast().spellId];
    const progress = clamp(1 - getPendingMagicCast().timer / Math.max(0.001, getPendingMagicCast().total || getPendingMagicCast().timer), 0, 1);
    const barW = W * 0.5;
    const barH = 18;
    const bx = (W - barW) / 2;
    const by = H * 0.8;
    D.chantBarGfx.clear();
    D.chantBarGfx.fillStyle(0x07090b, 0.72);
    D.chantBarGfx.fillRect(bx - 4, by - 28, barW + 8, 50);
    D.chantBarGfx.lineStyle(2, 0xedf3f7, 0.7);
    D.chantBarGfx.strokeRect(bx, by, barW, barH);
    D.chantBarGfx.fillStyle(hexToInt(spell?.color || '#d9d4ff'), 1);
    D.chantBarGfx.fillRect(bx + 2, by + 2, Math.max(0, (barW - 4) * progress), barH - 4);
    D.chantText.setText(`吟唱 ${spell?.name || '魔法'} ${(progress * 100).toFixed(0)}%`);
    D.chantText.setVisible(true);
    D.chantBarGfx.setVisible(true);
  } else if (D.chantBarGfx.visible) {
    D.chantBarGfx.clear();
    D.chantBarGfx.setVisible(false);
    D.chantText.setVisible(false);
  }
}
