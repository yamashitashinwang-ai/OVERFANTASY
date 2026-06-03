// HTML panel helper compatibility facade. Concrete helpers live under
// `ui/panels-helpers/` by UI surface and shared concern.

export { panelHeader, modSummary } from './panels-helpers/shared.ts';
export { backpackItems, backpackSelectedItem, backpackDetailHtml } from './panels-helpers/backpack.ts';
export {
  forgeEffectText,
  materialOptionList,
  selectedForgeMaterial,
  forgeSlotButton,
  armorForgeTarget,
  weaponForgeEntries,
  weaponForgeCategories,
  selectedWeaponForgeEntry,
  forgeRequirementHtml
} from './panels-helpers/forge.ts';
export { sellableMaterialEntries, sellAllMaterials } from './panels-helpers/commerce.ts';
export { knownMagicCards } from './panels-helpers/magic.ts';
export {
  questPanelHeader,
  questObjectiveText,
  questAutoSettlementText,
  questDetailCard
} from './panels-helpers/quest.ts';
export { playerRepelsMonsters } from './panels-helpers/gear.ts';
