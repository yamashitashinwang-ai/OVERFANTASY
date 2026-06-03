import type { WeaponProbe } from './harness.ts';
import type { WeaponProbeCase } from './weapon-cases.ts';

export async function runWeaponAttackChecks(probe: WeaponProbe, weapons: WeaponProbeCase[]) {
  const { page, test, ok, fail } = probe;

  for (const weapon of weapons) {
    await test(`Equip ${weapon.id} (${weapon.type}) and trigger attack`, async () => {
      const result = await page.evaluate(({ id, needsArrows }) => {
        const s = window.__state;
        window.__api.addGearToBag(id);
        window.__api.equipGear(id);
        if (needsArrows) s.player.arrows = 10;
        s.player.hp = 42;
        s.player.invuln = 0;
        s.player.stamina = 30;
        s.player.attackCooldown = 0;
        s.player.blockTimer = 0;
        s.player.monsterForm = false;
        s.entities = [];
        const target = window.__api.spawnCreature('wolf', s.player.x + 0.5, s.player.y);
        window.__runtime.aimVector = { x: 1, y: 0 };
        window.__runtime.aimWorld = { x: s.player.x + 1, y: s.player.y };
        try {
          const charged = window.__api.beginBowCharge();
          if (!charged) window.__api.playerAttack();
          else window.__api.releaseBowCharge();
          return { ok: true, weapon: window.__state.player.gear.weapon, target: target?.hp };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return { ok: false, error: message.slice(0, 150) };
        }
      }, { id: weapon.id, needsArrows: weapon.needsArrows });

      if (result.ok) ok(`weapon=${result.weapon} target hp=${result.target}`);
      else fail(`threw: ${result.error}`);
    });
  }
}
