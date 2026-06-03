import type { LostPackageContents } from '../types.ts';

export function hasLostPackageContents(contents: LostPackageContents | null | undefined): boolean {
  if (!contents) return false;
  if ((contents.gold || 0) > 0) return true;
  if ((contents.herbs || 0) > 0) return true;
  if ((contents.potions || 0) > 0) return true;
  if ((contents.arrows || 0) > 0) return true;
  if ((contents.gearBag || []).length > 0) return true;
  if (Object.values(contents.materials || {}).some(count => count > 0)) return true;
  if (Object.values(contents.resources || {}).some(count => count > 0)) return true;
  return false;
}
