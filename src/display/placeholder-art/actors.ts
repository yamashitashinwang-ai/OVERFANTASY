// Actor placeholder-art compatibility facade. NPC, creature, monster, and pet
// generated texture drawing lives under `placeholder-art/actors/` by family.

export { drawNpc } from './actors/npc.ts';
export { drawTreant, drawRabbit } from './actors/creatures.ts';
export { drawSlime, drawWolf, drawSkeleton, drawWisp, drawGargoyle, drawDemonKnight } from './actors/monsters.ts';
export { drawPet } from './actors/pets.ts';
