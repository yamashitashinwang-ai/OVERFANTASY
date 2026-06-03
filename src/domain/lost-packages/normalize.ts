import { state } from '../../runtime/state.ts';
import { currentPlayerId, currentPartyId } from '../session.ts';
import { hasLostPackageContents } from './contents.ts';

export function normalizeLostPackages() {
  if (!Array.isArray(state.lostPackages)) state.lostPackages = [];
  state.lostPackages = state.lostPackages.filter(pkg => pkg && !pkg.taken && hasLostPackageContents(pkg.contents));
  for (const pkg of state.lostPackages) {
    if (!pkg.ownerId) pkg.ownerId = currentPlayerId();
    if (!pkg.partyId) pkg.partyId = currentPartyId();
    if (!pkg.name) pkg.name = '遗失的包裹';
    if (!pkg.color) pkg.color = '#f3c45b';
    if (!pkg.scene) pkg.scene = state.scene;
    if (typeof pkg.createdAt !== 'number') pkg.createdAt = state.time || 0;
  }
}
