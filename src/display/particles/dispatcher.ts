import { tile } from '../../runtime/constants.ts';
import { bus, Events } from '../../runtime/events.ts';
import {
  spawnColdParticles,
  spawnFireParticles,
  spawnGenericMagicBurst,
  spawnHealParticles,
  spawnLeafCutterParticles,
  spawnThunderParticles
} from './spell-spawners.ts';


type MagicEffectSpawnPayload = {
  spellId?: unknown;
  x?: unknown;
  y?: unknown;
  radius?: unknown;
  color?: unknown;
  duration?: unknown;
};

function magicEffectSpawnPayload(payload: unknown): MagicEffectSpawnPayload | null {
  if (!payload || typeof payload !== 'object') return null;
  return payload as MagicEffectSpawnPayload;
}

function onMagicEffectSpawned(payload: unknown) {
  const effect = magicEffectSpawnPayload(payload);
  if (!effect || typeof effect.spellId !== 'string') return;
  if (typeof effect.x !== 'number' || typeof effect.y !== 'number') return;
  const radius = typeof effect.radius === 'number' ? effect.radius : 0.8;
  const color = typeof effect.color === 'string' ? effect.color : '#d9d4ff';
  const duration = typeof effect.duration === 'number' ? effect.duration : 0.8;
  spawnMagicEffect(effect.spellId, effect.x, effect.y, radius, color, duration);
}
export function spawnMagicEffect(spellId: string, x: number, y: number, radius: number, color: string, durationSec: number) {
  const wx = x * tile;
  const wy = y * tile;
  switch (spellId) {
    case 'littleCold':       spawnColdParticles(wx, wy, radius, durationSec); return;
    case 'thunderFlash':     spawnThunderParticles(wx, wy, radius); return;
    case 'leafCutter':       spawnLeafCutterParticles(wx, wy, radius, durationSec); return;
    case 'fireball':         spawnFireParticles(wx, wy, radius, durationSec, color); return;
    case 'extremeHealing':   spawnHealParticles(wx, wy, radius); return;
    default:                 spawnGenericMagicBurst(wx, wy, radius, color); return;
  }
}
bus.on(Events.MAGIC_EFFECT_SPAWNED, onMagicEffectSpawned);
