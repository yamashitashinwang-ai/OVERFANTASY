// AI compatibility facade. Entity, pet, pet-remain, and aggro logic lives
// under domain/ai/ by responsibility.

export { strongestPetAggro } from './ai/aggro.ts';
export { updatePetRemains } from './ai/pet-remains.ts';
export { updatePets } from './ai/pets.ts';
export { updateEntities } from './ai/entities.ts';
