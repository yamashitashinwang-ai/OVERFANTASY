import { state } from '../../runtime/state.ts';
import { addPickup } from '../world.ts';
import { currentPlayerId, worldOwnerId } from '../session.ts';
import type { SceneKey } from '../types.ts';
import { normalizeLostPackages } from './normalize.ts';

export function syncLostPackagePickupsForScene(scene: SceneKey = state.scene) {
  normalizeLostPackages();
  state.pickups = state.pickups.filter(pickup => pickup.kind !== 'lostPackage');
  for (const pkg of state.lostPackages) {
    if (pkg.taken || pkg.scene !== scene) continue;
    const pickup = addPickup('lostPackage', pkg.name || '遗失的包裹', pkg.x, pkg.y, pkg.color || '#f3c45b', 1, {
      id: `pickup-${pkg.id}`,
      ownerId: worldOwnerId,
      reservedFor: pkg.ownerId || currentPlayerId(),
      sourceId: pkg.id
    });
    pickup.scene = pkg.scene;
    pickup.contents = pkg.contents;
  }
}
