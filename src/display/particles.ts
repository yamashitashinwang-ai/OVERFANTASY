// Particle-emitter-driven spell visual compatibility facade. Texture setup,
// emitter lifecycle, spell-specific spawners, and dispatching live under
// `display/particles/` by responsibility.

export { spawnColdParticles, spawnThunderParticles, spawnLeafCutterParticles, spawnFireParticles, spawnHealParticles, spawnGenericMagicBurst } from './particles/spell-spawners.ts';
export { spawnMagicEffect } from './particles/dispatcher.ts';
