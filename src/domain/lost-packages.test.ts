import { describe, expect, it } from 'vitest';
import * as lostPackages from './lost-packages.ts';
import { claimLostPackage } from './lost-packages/claim.ts';
import { hasLostPackageContents } from './lost-packages/contents.ts';
import { createLostPackage } from './lost-packages/create.ts';
import { normalizeLostPackages } from './lost-packages/normalize.ts';
import { syncLostPackagePickupsForScene } from './lost-packages/sync.ts';

describe('lost-package domain facade and content checks', () => {
  it('re-exports split lost-package modules through the legacy entry point', () => {
    expect(lostPackages.hasLostPackageContents).toBe(hasLostPackageContents);
    expect(lostPackages.normalizeLostPackages).toBe(normalizeLostPackages);
    expect(lostPackages.syncLostPackagePickupsForScene).toBe(syncLostPackagePickupsForScene);
    expect(lostPackages.createLostPackage).toBe(createLostPackage);
    expect(lostPackages.claimLostPackage).toBe(claimLostPackage);
  });

  it('detects whether lost-package contents contain recoverable items', () => {
    expect(hasLostPackageContents(null)).toBe(false);
    expect(hasLostPackageContents({})).toBe(false);
    expect(hasLostPackageContents({ gold: 0, materials: { wood: 0 }, resources: { stone: 0 }, gearBag: [] })).toBe(false);

    expect(hasLostPackageContents({ gold: 1 })).toBe(true);
    expect(hasLostPackageContents({ herbs: 1 })).toBe(true);
    expect(hasLostPackageContents({ potions: 1 })).toBe(true);
    expect(hasLostPackageContents({ arrows: 1 })).toBe(true);
    expect(hasLostPackageContents({ materials: { iron: 1 } })).toBe(true);
    expect(hasLostPackageContents({ resources: { wood: 1 } })).toBe(true);
    expect(hasLostPackageContents({ gearBag: ['trainingSword'] })).toBe(true);
  });
});
