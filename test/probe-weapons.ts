// Weapon-coverage probe — exercises EVERY weapon type by equipping it and
// running the actual playerAttack/beginBowCharge code paths. This test would
// have caught the `clearCd is not defined` bug in bow.js immediately.

import { runWeaponAttackChecks } from './probe-weapons/attack-checks.ts';
import { runBowChargeCycleCheck } from './probe-weapons/bow-checks.ts';
import { runCatalogWeaponEquipCheck } from './probe-weapons/catalog-checks.ts';
import { createWeaponProbe } from './probe-weapons/harness.ts';
import { WEAPONS } from './probe-weapons/weapon-cases.ts';

const probe = await createWeaponProbe();
await probe.bootstrap();
await runWeaponAttackChecks(probe, WEAPONS);
await runCatalogWeaponEquipCheck(probe);
await runBowChargeCycleCheck(probe);
process.exit(await probe.finish(WEAPONS.length + 2));
