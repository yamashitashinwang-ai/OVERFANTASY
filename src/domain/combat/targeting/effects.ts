import { setAttackEffect } from '../../../runtime/state.ts';
import type { AttackEffect, GearCatalogItem } from '../../types.ts';

export function startAttackEffect(weapon: GearCatalogItem, spec: AttackEffect, hit = false, critical = false) {
  setAttackEffect({ ...spec, weaponType: weapon.type, weaponName: weapon.name, time: 0, hit, critical });
}
