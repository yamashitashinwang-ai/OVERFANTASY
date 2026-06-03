import { display as D } from '../runtime.ts';
import { magicEffects } from '../../runtime/state.ts';
import { tile } from '../../runtime/constants.ts';
import { clamp } from '../../domain/math.ts';
import { hexToInt } from '../colors.ts';
import { drawAttackEffect } from './attack.ts';
import { drawMagicCastHandEffect } from './magic.ts';

export function syncEffectsDisplay() {
  if (!D.effectsGfx) return;
  D.effectsGfx.clear();

  drawAttackEffect(D.effectsGfx);
  drawMagicCastHandEffect(D.effectsGfx);

  // Magic effects are now rendered by Phaser ParticleEmitters spawned from
  // startMagicEffect (see src/display/particles.ts). We draw a thin outline
  // ring while the effect is alive so the area-of-effect is still legible.
  for (const effect of magicEffects) {
    const x = effect.x * tile;
    const y = effect.y * tile;
    const progress = clamp(effect.time / effect.duration, 0, 1);
    const radius = effect.radius * tile * (0.65 + progress * 0.45);
    const c = hexToInt(effect.color);
    D.effectsGfx.lineStyle(effect.spellId === 'thunderFlash' ? 5 : 2, c, 0.55 * (1 - progress * 0.6));
    D.effectsGfx.strokeCircle(x, y, radius);
  }
}
