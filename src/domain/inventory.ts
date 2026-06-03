// Inventory compatibility facade. Materials/resources, pets, and gear bag
// behavior live under domain/inventory/ by responsibility.

export {
  addMaterial,
  resourceGroup,
  syncResourceTotals,
  addResource,
  resourceCount,
  consumeResource,
  consumeAnyResource,
  materialCount,
  sellableMaterialCount,
  materialSummary
} from './inventory/materials.ts';
export {
  makePet,
  adoptPetFromMaterial,
  recallPets
} from './inventory/pets.ts';
export {
  addGearToBag,
  gearIdForPickup,
  equipGear
} from './inventory/gear.ts';
