import type { CombatProbe } from './harness.ts';

export async function runPlayerDamageChecks(probe: CombatProbe) {
  const { page, check: test, ok, fail } = probe;

  // Requirement 4: invuln window blocks damage.
  await test('REQ-4 — Damage during invuln window is ignored', async () => {
    const hp = await page.evaluate(() => {
      window.__state.player.hp = 42;
      window.__state.player.invuln = 0.5;
      window.__api.damagePlayer(20, null);
      return window.__state.player.hp;
    });
    if (hp === 42) ok('invuln blocked damage'); else fail(`HP=${hp} (expected 42)`);
  });

  // Requirement 5: blockTimer reduces damage.
  await test('REQ-5 — Block reduces damage to ~35%', async () => {
    const hp = await page.evaluate(() => {
      window.__state.player.hp = 100;
      window.__state.player.maxHp = 100;
      window.__state.player.invuln = 0;
      window.__state.player.blockTimer = 1.0;
      window.__state.player.def = 0;
      window.__state.player.gear = { weapon: 'trainingSword', head: null, body: null, legs: null, feet: null, accessory: null };
      window.__state.player.gearMods = {};
      window.__api.damagePlayer(20, { alive: false });
      return window.__state.player.hp;
    });
    if (hp === 93) ok(`HP 100 → ${hp} (block reduced 20→7)`);
    else fail(`HP=${hp} (expected 93)`);
  });

  // Requirement 6: defense reduces damage.
  await test('REQ-6 — Defense reduces incoming damage (with armor)', async () => {
    const s = await page.evaluate(() => {
      window.__api.addGearToBag('chainMail');
      window.__api.equipGear('chainMail');
      window.__state.player.hp = 100;
      window.__state.player.invuln = 0;
      window.__state.player.blockTimer = 0;
      window.__api.damagePlayer(20, { alive: false });
      return { hp: window.__state.player.hp, def: window.__state.player.def };
    });
    // chainMail = def 5. raceDef * 0.55 approx 2.75. Damage = 20-2.75 approx 17. HP=83.
    if (s.hp > 80 && s.hp < 100 && s.def >= 5) ok(`HP 100 → ${s.hp} (def=${s.def})`);
    else fail(`HP=${s.hp} def=${s.def}`);
  });
}

export async function runPlayerThornsChecks(probe: CombatProbe) {
  const { page, check: test, ok, fail } = probe;

  // Requirement 9: thorns counter-damage.
  await test('REQ-9 — Thorns reflects damage to attacker', async () => {
    const result = await page.evaluate(() => {
      window.__state.player.hp = 42;
      window.__state.player.invuln = 0;
      window.__state.player.blockTimer = 0;
      window.__state.player.gear = { weapon: 'trainingSword', head: null, body: 'clothTunic', legs: null, feet: null, accessory: null };
      window.__state.player.gearMods = { clothTunic: [{ thorns: 5 }] };
      window.__state.entities = [{
        kind: 'monster', name: '攻击者', species: 'wolf',
        x: 0, y: 0, hp: 20, maxHp: 20, atk: 3, alive: true, faction: 'monster',
        id: 'attacker', ownerId: 'world', r: 12, cooldown: 0
      }];
      const attacker = window.__state.entities[0];
      window.__api.damagePlayer(5, attacker);
      return attacker.hp;
    });
    if (result === 15) ok(`attacker hp 20 → ${result} (thorns reflected 5)`);
    else fail(`attacker hp=${result} (expected 15)`);
  });
}
