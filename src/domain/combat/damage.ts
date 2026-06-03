// Combat damage compatibility facade. Player damage, pet damage, loot, defeat,
// and hit feedback live under `combat/damage/` by responsibility.

export { markHitReaction } from './damage/feedback.ts';
export { damagePlayer, playerDefeated } from './damage/player.ts';
export { damagePet, petDiesIrreversibly, petById } from './damage/pets.ts';
export { rollDrop, dropLoot } from './damage/loot.ts';
export { defeatEntity } from './damage/defeat.ts';
