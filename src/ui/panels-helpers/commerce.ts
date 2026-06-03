import DATA from '../../data.ts';
import { state } from '../../runtime/state.ts';
import { sellMaterial } from '../../domain/economy.ts';

const { materialCatalog } = DATA;

export function sellableMaterialEntries() {
  return Object.entries(state.player.materials)
    .filter(([name, count]) => count > 0 && !materialCatalog[name]?.unsellable && materialCatalog[name]?.sell != null);
}

export function sellAllMaterials() {
  let gold = 0;
  for (const [name, count] of Object.entries({ ...state.player.materials })) {
    if (materialCatalog[name]?.unsellable) continue;
    gold += sellMaterial(name, count);
  }
  return gold;
}
