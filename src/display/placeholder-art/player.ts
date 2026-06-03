// Player placeholder-art compatibility facade. Full-frame humanoid drawing,
// shared geometry helpers, and segmented rig part textures live under
// `placeholder-art/player/` by responsibility.

export { playerTextureW, playerTextureH } from './player/geometry.ts';
export { drawHumanoid } from './player/humanoid.ts';
export { drawRigPartTexture, playerRigTextureSize } from './player/rig-parts.ts';
