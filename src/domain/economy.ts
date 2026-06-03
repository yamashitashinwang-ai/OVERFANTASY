// Economy compatibility facade. Shop transactions, material commerce,
// forge formulae, and crafting execution live under domain/economy/.

export {
  materialMod,
  weaponForgeRecipe,
  forgeIngredientCount,
  hasForgeIngredients,
  consumeForgeIngredients
} from './economy/formulae.ts';
export { sellMaterial } from './economy/commerce.ts';
export { buyPotion, buyArrows } from './economy/shop.ts';
export { forgeRing, forgeMaterial, forgeWeapon } from './economy/forge.ts';
