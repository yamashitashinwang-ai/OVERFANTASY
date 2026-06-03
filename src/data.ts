import type { DataCatalog } from './domain/types.ts';
import { regions, colors, sceneNames } from './data/world.ts';
import { bestiary } from './data/bestiary.ts';
import { gearCatalog } from './data/gear.ts';
import { materialCatalog } from './data/materials.ts';
import { resourceCatalog } from './data/resources.ts';
import { weaponForgeCatalog } from './data/forge.ts';
import { petCatalog } from './data/pets.ts';
import { magicCatalog } from './data/magic.ts';
import { questCatalog } from './data/quests.ts';
import { graveDecayInterval, graveMaxDecay } from './data/graves.ts';

const DATA: DataCatalog = {
  regions,
  colors,
  sceneNames,
  bestiary,
  gearCatalog,
  materialCatalog,
  resourceCatalog,
  weaponForgeCatalog,
  petCatalog,
  magicCatalog,
  questCatalog,
  graveDecayInterval,
  graveMaxDecay
};

export {
  regions,
  colors,
  sceneNames,
  bestiary,
  gearCatalog,
  materialCatalog,
  resourceCatalog,
  weaponForgeCatalog,
  petCatalog,
  magicCatalog,
  questCatalog,
  graveDecayInterval,
  graveMaxDecay
};

export default DATA;
