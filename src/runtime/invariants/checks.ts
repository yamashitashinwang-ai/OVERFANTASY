import {
  adjacentMonsterMustDamageInvariant,
  monsterFormSuppressesMonsterDamageInvariant
} from './checks/combat.ts';
import { sceneRuntimePSceneRefSetInvariant } from './checks/scene.ts';
import { entityPositionNeverNanInvariant } from './checks/world.ts';
import {
  cooldownMustTickDownInvariant,
  playerHpNeverNegativeInvariant,
  playerPositionNeverNanInvariant
} from './checks/player.ts';
import type { RuntimeInvariant } from './types.ts';

export const INVARIANTS: RuntimeInvariant[] = [
  adjacentMonsterMustDamageInvariant,
  playerHpNeverNegativeInvariant,
  playerPositionNeverNanInvariant,
  entityPositionNeverNanInvariant,
  sceneRuntimePSceneRefSetInvariant,
  cooldownMustTickDownInvariant,
  monsterFormSuppressesMonsterDamageInvariant
];
