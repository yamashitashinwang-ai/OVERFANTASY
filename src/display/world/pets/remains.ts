import { display as D } from '../../runtime.ts';
import { hexToInt } from '../../colors.ts';
import DATA from '../../../data.ts';
import { state } from '../../../runtime/state.ts';
import { tile } from '../../../runtime/constants.ts';
import { clamp } from '../../../domain/math.ts';
import { currentPetScene } from '../../../domain/world.ts';

const { graveMaxDecay } = DATA;

export function syncPetRemainsDisplay() {
  if (!D.petRemainsGfx) return;
  D.petRemainsGfx.clear();
  const sceneKey = currentPetScene();
  for (const remain of state.petRemains) {
    if (remain.scene !== sceneKey) continue;
    const x = remain.x * tile;
    const y = remain.y * tile;
    if (remain.kind === 'corpse') {
      D.petRemainsGfx.fillStyle(0x3f3b3d, 1);
      D.petRemainsGfx.fillEllipse(x, y + 5, 28, 14);
      D.petRemainsGfx.lineStyle(2, hexToInt(remain.color || '#ff8f70'), 1);
      D.petRemainsGfx.strokeEllipse(x, y + 5, 28, 14);
    } else {
      const rot = clamp(remain.decay / graveMaxDecay, 0, 1);
      const alpha = 0.95 - rot * 0.55;
      const h = 24 - remain.decay * 3;
      D.petRemainsGfx.fillStyle(0x8e8a82, alpha);
      D.petRemainsGfx.fillRect(x - 9, y - h + 7, 18, h);
      D.petRemainsGfx.fillStyle(0x4b4642, alpha);
      D.petRemainsGfx.fillRect(x - 14, y + 7, 28, 7);
      D.petRemainsGfx.lineStyle(1, 0x121110, alpha);
      D.petRemainsGfx.strokeRect(x - 9, y - h + 7, 18, h);
      D.petRemainsGfx.strokeRect(x - 14, y + 7, 28, 7);
    }
  }
}
