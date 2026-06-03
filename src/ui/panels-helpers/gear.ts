import { equippedModList } from '../../domain/combat/weapon.ts';

export function playerRepelsMonsters() {
  return equippedModList().some(mod => mod.repelMonsters);
}
