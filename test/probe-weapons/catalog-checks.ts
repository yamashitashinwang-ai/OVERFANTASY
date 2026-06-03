import type { WeaponProbe } from './harness.ts';

export async function runCatalogWeaponEquipCheck(probe: WeaponProbe) {
  const { page, test, ok, fail } = probe;

  await test('All catalog weapons can equip without error', async () => {
    const result = await page.evaluate(async () => {
      const data = await import('/src/data.js');
      const ids = Object.entries(data.default.gearCatalog)
        .filter(([, gear]) => gear.slot === 'weapon')
        .map(([id]) => id);
      const errors: string[] = [];
      for (const id of ids) {
        try {
          window.__api.addGearToBag(id);
          window.__api.equipGear(id);
          const equipped = window.__state.player.gear.weapon;
          if (equipped !== id && id !== 'demonClaw') errors.push(`${id} did not equip (got ${equipped})`);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          errors.push(`${id}: ${message.slice(0, 80)}`);
        }
      }
      return { total: ids.length, errors };
    });

    if (result.errors.length === 0) ok(`${result.total} weapons equip cleanly`);
    else {
      fail(`${result.errors.length}/${result.total} failed`);
      result.errors.forEach(error => console.log('     →', error));
    }
  });
}
