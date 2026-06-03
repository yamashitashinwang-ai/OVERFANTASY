import type { DataCatalog } from '../domain/types.ts';
import { commonMonsterBestiary } from './bestiary/common-monsters.ts';
import { eliteMonsterBestiary } from './bestiary/elites.ts';
import { wildlifeBestiary } from './bestiary/wildlife.ts';

export const bestiary: DataCatalog['bestiary'] = {
  ...wildlifeBestiary,
  ...commonMonsterBestiary,
  ...eliteMonsterBestiary
};
