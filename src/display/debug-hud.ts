// Debug HUD — fixed-to-viewport top-right overlay that shows every
// gameplay variable that matters for combat in real time. When the player
// says "no damage", they can read this HUD and tell me which value is wrong:
//
//   HP / invuln / monsterForm / mode    — player state
//   Closest hostile + distance + cd     — what should be attacking
//   Last damage event timestamp         — when damage last fired
//   AI tick rate                        — to detect frozen-game scenarios
//
// Toggle with the F2 key.

import { display as D } from './runtime.ts';
import type Phaser from 'phaser';
import { state, runtime } from '../runtime/state.ts';
import { isPlaying } from '../runtime/ui-state.ts';
import { W } from '../runtime/constants.ts';
import { bus, Events } from '../runtime/events.ts';
import { dumpLogs } from '../runtime/log.ts';

let lastDamageT = 0;
let lastDealtT = 0;
let aiTickT = 0;
let aiTickCount = 0;

bus.on(Events.PLAYER_HURT, () => { lastDamageT = performance.now(); });
bus.on(Events.ENTITY_DEFEATED, () => { lastDealtT = performance.now(); });
bus.on(Events.ENTITY_HIT, () => { lastDealtT = performance.now(); });

export function initDebugHud(scene: Phaser.Scene) {
  D.debugHudBg = scene.add.rectangle(W - 16, 152, 320, 220, 0x07090b, 0.78)
    .setOrigin(1, 0).setScrollFactor(0).setDepth(90).setVisible(false);
  D.debugHudText = scene.add.text(W - 26, 158, '', {
    fontFamily: 'monospace', fontSize: '12px', color: '#dbe4ea',
    lineSpacing: 2
  }).setOrigin(1, 0).setScrollFactor(0).setDepth(91).setVisible(false);

  // F2 toggle
  scene.input.keyboard.on('keydown-F2', () => {
    const next = !D.debugHudBg.visible;
    D.debugHudBg.setVisible(next);
    D.debugHudText.setVisible(next);
  });

  // F3 → copy the recent log timeline to clipboard. The user pastes this
  // back to support when something feels broken.
  scene.input.keyboard.on('keydown-F3', async () => {
    const text = dumpLogs(300);
    try {
      await navigator.clipboard.writeText(text);
      console.log('[support] copied %d chars of game log to clipboard', text.length);
    } catch (e) {
      console.warn('[support] clipboard blocked — log:\n' + text);
    }
  });
}

export function syncDebugHud() {
  if (!D.debugHudText?.visible) return;
  aiTickCount++;
  const now = performance.now();
  if (now - aiTickT > 1000) {
    D._debugFps = aiTickCount;
    aiTickCount = 0;
    aiTickT = now;
  }

  const p = state.player;
  const monsters = state.entities
    .filter(e => e.alive && e.faction === 'monster')
    .map(e => ({ d: Math.hypot(e.x - p.x, e.y - p.y), e }))
    .sort((a, b) => a.d - b.d);
  const closest = monsters[0];

  const lines = [
    `=== DEBUG (F2) ===`,
    `mode=${state.mode}  scene=${state.scene}`,
    `isPlaying=${isPlaying()}  pSceneRef=${!!runtime.pSceneRef}`,
    `appMode? monsterForm=${p.monsterForm}`,
    `player pos=(${p.x.toFixed(2)},${p.y.toFixed(2)})`,
    `HP ${p.hp}/${p.maxHp}  invuln=${(p.invuln||0).toFixed(2)}`,
    `stamina=${p.stamina.toFixed(1)}  hitStop=${(runtime.hitStopTimer||0).toFixed(2)}`,
    `weapon=${p.gear?.weapon}  atk=${p.atk}  def=${p.def}`,
    `attackCD=${(p.attackCooldown||0).toFixed(2)}`,
    ``,
    `MONSTERS NEARBY (${monsters.length}):`,
    ...monsters.slice(0, 3).map(m =>
      `  ${m.d.toFixed(2)}t ${m.e.name} hp=${m.e.hp} cd=${(m.e.cooldown||0).toFixed(2)} aggro=${(m.e.playerAggro||0).toFixed(1)}`
    ),
    ``,
    `last PLAYER_HURT: ${lastDamageT ? ((now - lastDamageT)/1000).toFixed(1)+'s ago' : 'never'}`,
    `last ENTITY_HIT/DEFEATED: ${lastDealtT ? ((now - lastDealtT)/1000).toFixed(1)+'s ago' : 'never'}`,
    `fps≈${D._debugFps || '?'}`
  ];
  D.debugHudText.setText(lines.join('\n'));

  // Diagnose what's broken when closest monster is adjacent but no damage
  if (closest && closest.d < 0.9 && !p.monsterForm && (p.invuln||0) <= 0) {
    const since = now - lastDamageT;
    if (since > 2000) {
      D.debugHudText.setColor('#ff6b6b');
      return;
    }
  }
  D.debugHudText.setColor('#dbe4ea');
}
