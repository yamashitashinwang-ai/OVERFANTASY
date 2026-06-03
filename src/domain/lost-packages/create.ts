import { state } from '../../runtime/state.ts';
import { currentPlayerId, currentPartyId } from '../session.ts';
import type { LostPackageContents, LostPackageState, SceneKey } from '../types.ts';
import { hasLostPackageContents } from './contents.ts';
import { syncLostPackagePickupsForScene } from './sync.ts';

export function createLostPackage(scene: SceneKey, x: number, y: number, contents: LostPackageContents, deathScene = scene, deathX = x, deathY = y): LostPackageState | null {
  if (!hasLostPackageContents(contents)) return null;
  const pkg: LostPackageState = {
    id: `lost-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    ownerId: currentPlayerId(),
    partyId: currentPartyId(),
    scene,
    name: '遗失的包裹',
    color: '#f3c45b',
    x,
    y,
    contents,
    taken: false,
    createdAt: state.time || 0,
    deathScene,
    deathX,
    deathY
  };
  state.lostPackages.push(pkg);
  if (scene === state.scene && state.mode === 'world') syncLostPackagePickupsForScene(scene);
  return pkg;
}
