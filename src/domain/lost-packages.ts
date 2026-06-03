// Lost-package compatibility facade. Death package content checks, state
// normalization, scene pickup sync, creation, and claim logic live under
// `domain/lost-packages/` by responsibility.

export { hasLostPackageContents } from './lost-packages/contents.ts';
export { normalizeLostPackages } from './lost-packages/normalize.ts';
export { syncLostPackagePickupsForScene } from './lost-packages/sync.ts';
export { createLostPackage } from './lost-packages/create.ts';
export { claimLostPackage } from './lost-packages/claim.ts';
