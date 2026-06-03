import { state } from '../../runtime/state.ts';
import DATA from '../../data.ts';
import { toast } from '../../runtime/services.ts';

const { materialCatalog } = DATA;

export function sellMaterial(name: string, amount = 1): number {
  const material = materialCatalog[name];
  const owned = state.player.materials[name] || 0;
  if (!material || owned <= 0) return 0;
  if (material.unsellable || material.sell == null) {
    toast(`${name}不能出售。`);
    return 0;
  }
  const count = Math.min(amount, owned);
  state.player.materials[name] -= count;
  if (state.player.materials[name] <= 0) delete state.player.materials[name];
  const gold = material.sell * count;
  state.player.gold += gold;
  return gold;
}
