// Combat/AI/damage checklist probe — one named test per requirement from
// the original game.js. Each test sets up controlled state, invokes the
// specific domain function, and asserts the expected state mutation.
//
// Goal: every gameplay function must have a corresponding test that passes.

import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', e => errors.push(`PAGE: ${e.message.slice(0, 240)}`));
page.on('console', m => { if (m.type() === 'error') errors.push(`CON: ${m.text().slice(0, 240)}`); });

const failures = [];
const ok = (m) => console.log('  ✓', m);
const fail = (m) => { console.log('  ✗', m); failures.push(m); };

async function test(label, fn) {
  errors.length = 0;
  console.log('\n▶', label);
  try { await fn(); } catch (e) { fail(`${label} threw: ${e.message.slice(0, 200)}`); }
  if (errors.length) {
    fail(`${label}: ${errors.length} errors`);
    errors.slice(0, 2).forEach(e => console.log('     →', e));
  }
}

await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.evaluate(() => document.querySelector('[data-menu-action="new"]')?.click());
await page.waitForTimeout(300);
await page.evaluate(() => document.querySelector('[data-menu-action="startRace"][data-race="人类"]')?.click());
await page.waitForTimeout(2000);
for (let i = 0; i < 30; i++) {
  if (await page.evaluate(() => !!window.__api)) break;
  await page.waitForTimeout(100);
}

// Pause the GameScene so its update loop doesn't fire between probe setup and
// our forced updateEntities calls (otherwise invuln + cooldowns leak between
// test steps).
async function pauseGame() {
  await page.evaluate(() => window.__game.scene.pause('GameScene'));
}
async function resumeGame() {
  await page.evaluate(() => window.__game.scene.resume('GameScene'));
}

// Helper: reset world to a clean state with one enemy adjacent to player
async function setupSoloEnemy(overrides = {}) {
  return page.evaluate((overrides) => {
    const s = window.__state;
    // Remove other entities so AI only handles ours
    s.entities = [];
    s.player.hp = 42;
    s.player.maxHp = 42;
    s.player.invuln = 0;
    s.player.blockTimer = 0;
    s.player.dodgeTimer = 0;
    s.player.def = 0;
    s.player.monsterForm = false;
    s.player.gear.body = null;
    s.player.gear.head = null;
    s.player.gear.legs = null;
    s.player.gear.feet = null;
    s.player.gear.accessory = null;
    s.player.gearMods = {};
    // Place an enemy right on the player so it triggers melee (d < 0.9)
    const mob = Object.assign({
      kind: 'monster', species: 'wolf', name: '小魔狼',
      x: s.player.x + 0.4, y: s.player.y,
      hp: 10, maxHp: 10, atk: 5, def: 0, r: 12, speed: 1.5,
      alive: true, faction: 'monster', cooldown: 0, region: 'forest',
      ownerId: 'world', id: 'test-mob-' + Math.random()
    }, overrides);
    s.entities.push(mob);
    return mob.id;
  }, overrides);
}

// Pause GameScene so the in-game update loop doesn't mutate state between
// the probe's setup/eval steps.
await pauseGame();

// ─── Requirement 1: enemy melee damages player ────────────────────────────
await test('REQ-1 — Enemy adjacent to player deals damage in one AI tick', async () => {
  const result = await page.evaluate(() => {
    const s = window.__state;
    s.entities = [];
    s.player.hp = 42;
    s.player.invuln = 0;
    s.player.blockTimer = 0;
    s.player.def = 0;
    s.player.monsterForm = false;
    s.player.gear = { weapon: 'trainingSword', head: null, body: null, legs: null, feet: null, accessory: null };
    s.player.gearMods = {};
    s.entities.push({
      kind: 'monster', species: 'wolf', name: '小魔狼',
      x: s.player.x + 0.4, y: s.player.y,
      hp: 10, maxHp: 10, atk: 5, alive: true, faction: 'monster',
      cooldown: 0, region: 'forest', r: 12, speed: 1.5, ownerId: 'world', id: 'm1'
    });
    const hp0 = s.player.hp;
    window.__api.updateEntities(0.1);
    return { hp0, hp1: s.player.hp };
  });
  if (result.hp1 < result.hp0) ok(`HP ${result.hp0} → ${result.hp1}`);
  else fail(`HP unchanged: ${result.hp0} → ${result.hp1}`);
});

// ─── Requirement 2: ranged enemy hits player ─────────────────────────────
await test('REQ-2 — Ranged enemy at d<4.6 fires and damages player', async () => {
  const result = await page.evaluate(() => {
    const s = window.__state;
    s.entities = [];
    s.player.hp = 42;
    s.player.invuln = 0;
    s.player.blockTimer = 0;
    s.player.def = 0;
    s.player.monsterForm = false;
    s.entities.push({
      kind: 'monster', species: 'wisp', name: '幽光', ranged: true,
      x: s.player.x + 3, y: s.player.y,
      hp: 10, maxHp: 10, atk: 5, alive: true, faction: 'monster',
      cooldown: 0, region: 'forest', r: 12, speed: 1.5, ownerId: 'world', id: 'm2'
    });
    const hp0 = s.player.hp;
    window.__api.updateEntities(0.1);
    return { hp0, hp1: s.player.hp };
  });
  if (result.hp1 < result.hp0) ok(`HP ${result.hp0} → ${result.hp1}`);
  else fail(`ranged miss: HP ${result.hp0} → ${result.hp1}`);
});

// ─── Requirement 3: enemy AI moves toward player ─────────────────────────
await test('REQ-3 — Hostile monster within 11.5 tiles moves toward player', async () => {
  const result = await page.evaluate(() => {
    const s = window.__state;
    s.entities = [];
    s.player.monsterForm = false;
    s.entities.push({
      kind: 'monster', species: 'wolf', name: '小魔狼',
      x: s.player.x + 5, y: s.player.y,
      hp: 10, maxHp: 10, atk: 5, alive: true, faction: 'monster',
      cooldown: 99, region: 'forest', r: 12, speed: 1.5, ownerId: 'world', id: 'm3'
    });
    const x0 = s.entities[0].x;
    window.__api.updateEntities(0.5);
    return { x0, x1: s.entities[0].x };
  });
  if (result.x1 < result.x0) ok(`enemy x ${result.x0.toFixed(2)} → ${result.x1.toFixed(2)}`);
  else fail(`enemy did not move closer: ${result.x0.toFixed(2)} → ${result.x1.toFixed(2)}`);
});

// ─── Requirement 4: invuln window blocks damage ──────────────────────────
await test('REQ-4 — Damage during invuln window is ignored', async () => {
  const hp = await page.evaluate(() => {
    window.__state.player.hp = 42;
    window.__state.player.invuln = 0.5;
    window.__api.damagePlayer(20, null);
    return window.__state.player.hp;
  });
  if (hp === 42) ok('invuln blocked damage'); else fail(`HP=${hp} (expected 42)`);
});

// ─── Requirement 5: blockTimer halves damage ─────────────────────────────
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

// ─── Requirement 6: defense reduces damage ───────────────────────────────
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
  // chainMail = def 5. raceDef * 0.55 ≈ 2.75. Damage = 20-2.75 ≈ 17. HP=83.
  if (s.hp > 80 && s.hp < 100 && s.def >= 5) ok(`HP 100 → ${s.hp} (def=${s.def})`);
  else fail(`HP=${s.hp} def=${s.def}`);
});

// ─── Requirement 7: monster kills player → monsterForm ────────────────────
await test('REQ-7 — Defeat by monster → monsterForm with HP=ceil(maxHp*0.65)', async () => {
  const s = await page.evaluate(() => {
    window.__state.player.hp = 1;
    window.__state.player.maxHp = 42;
    window.__state.player.invuln = 0;
    window.__state.player.blockTimer = 0;
    window.__state.player.def = 0;
    window.__state.player.gear = { weapon: 'trainingSword', head: null, body: null, legs: null, feet: null, accessory: null };
    window.__state.player.gearMods = {};
    window.__state.player.monsterForm = false;
    window.__api.damagePlayer(99, { name: '怪物', faction: 'monster', alive: true });
    return { hp: window.__state.player.hp, mf: window.__state.player.monsterForm };
  });
  if (s.mf === true && s.hp === 28) ok(`monsterForm=true hp=${s.hp}`);
  else fail(`monsterForm=${s.mf} hp=${s.hp}`);
});

// ─── Requirement 8: defeat in monsterForm → respawn at shrine ─────────────
await test('REQ-8 — Defeat in monsterForm → teleport to white shrine', async () => {
  const s = await page.evaluate(() => {
    window.__state.player.hp = 1;
    window.__state.player.maxHp = 42;
    window.__state.player.invuln = 0;
    window.__state.player.blockTimer = 0;
    window.__state.player.def = 0;
    window.__state.player.gear = { weapon: 'trainingSword', head: null, body: null, legs: null, feet: null, accessory: null };
    window.__state.player.gearMods = {};
    window.__state.player.monsterForm = true;
    window.__state.scene = 'forest';
    window.__api.damagePlayer(99, { name: '怪物', faction: 'monster', alive: true });
    return {
      hp: window.__state.player.hp,
      scene: window.__state.scene,
      invuln: window.__state.player.invuln
    };
  });
  if (s.hp === 21 && s.scene === 'field' && s.invuln === 1.2) ok(`hp=${s.hp} scene=${s.scene} invuln=${s.invuln}`);
  else fail(`hp=${s.hp} scene=${s.scene} invuln=${s.invuln}`);
});

// ─── Requirement 9: thorns counter-damage ────────────────────────────────
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

// Resume game for movement/sprint tests
await resumeGame();

// ─── Requirement 10: WASD updates player position ─────────────────────────
await test('REQ-10 — WASD held keys moves player position', async () => {
  // Ensure GameScene is active and focus the canvas first
  const gameActive = await page.evaluate(() => window.__game.scene.isActive('GameScene'));
  if (!gameActive) { fail('GameScene not active'); return; }
  const box = await (await page.$('#game-container canvas')).boundingBox();
  await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
  await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
  await page.waitForTimeout(100);

  const x0 = await page.evaluate(() => window.__state.player.x);
  await page.keyboard.down('d');
  await page.waitForTimeout(600);
  await page.keyboard.up('d');
  const x1 = await page.evaluate(() => window.__state.player.x);
  if (x1 > x0) ok(`x ${x0.toFixed(2)} → ${x1.toFixed(2)}`);
  else fail(`no movement: ${x0.toFixed(2)} → ${x1.toFixed(2)}`);
});

// ─── Requirement 11: sprint depletes stamina ─────────────────────────────
await test('REQ-11 — Shift+W sprint depletes stamina below 30', async () => {
  await page.evaluate(() => { window.__state.player.stamina = 30; });
  await page.keyboard.down('Shift');
  await page.keyboard.down('w');
  await page.waitForTimeout(1500);
  await page.keyboard.up('w');
  await page.keyboard.up('Shift');
  const s = await page.evaluate(() => window.__state.player.stamina);
  if (s < 30) ok(`stamina 30 → ${s.toFixed(1)}`);
  else fail(`stamina=${s}`);
});

// ─── Requirement 12: pickup items ─────────────────────────────────────────
await test('REQ-12 — Walking over gold pickup adds to inventory', async () => {
  await page.evaluate(() => {
    const p = window.__state.player;
    p.gold = 0;
    window.__state.pickups = [{
      id: 'pickup-coin', kind: 'gold', name: '金币', value: 5,
      x: p.x, y: p.y, ownerId: 'world', reservedFor: null, takenBy: null
    }];
  });
  await page.evaluate(() => window.__api.pickupItems());
  const gold = await page.evaluate(() => window.__state.player.gold);
  if (gold === 5) ok(`gold picked up = ${gold}`);
  else fail(`gold=${gold} (expected 5)`);
});

// ─── Requirement 13: damagePet downs pet at 0 HP ──────────────────────────
await test('REQ-13 — damagePet at 0 HP sets injured + rescueTimer', async () => {
  await page.evaluate(() => {
    window.__state.pets = [{
      id: 'p1', name: 'Pup', hp: 5, maxHp: 10, alive: true, injured: false,
      x: 10, y: 10, scene: 'field', ownerId: 'player:local', partyId: 'party:local'
    }];
  });
  await page.evaluate(() => {
    const pet = window.__state.pets[0];
    window.__api.damagePet(pet, 99, null);
  });
  const s = await page.evaluate(() => ({
    hp: window.__state.pets[0].hp,
    alive: window.__state.pets[0].alive,
    injured: window.__state.pets[0].injured,
    rescue: window.__state.pets[0].rescueTimer
  }));
  if (s.alive === false && s.injured === true && s.rescue > 0) ok(`alive=false injured=true rescue=${s.rescue}`);
  else fail(JSON.stringify(s));
});

// ─── Requirement 14: slime split on defeat ─────────────────────────────────
await test('REQ-14 — Defeated slime (gen<3) spawns 2 children', async () => {
  await page.evaluate(() => {
    const p = window.__state.player;
    window.__state.entities = [{
      kind: 'monster', species: 'slime', name: '史莱姆',
      x: p.x, y: p.y, hp: 1, maxHp: 8, atk: 2, alive: true,
      faction: 'monster', split: true, slimeGen: 1, region: 'ruins',
      id: 'slime-parent', ownerId: 'world', r: 12, cooldown: 0
    }];
  });
  const before = await page.evaluate(() => window.__state.entities.length);
  await page.evaluate(() => {
    const slime = window.__state.entities.find(e => e.id === 'slime-parent');
    window.__api.defeatEntity(slime);
  });
  const after = await page.evaluate(() => window.__state.entities.length);
  if (after === before + 2) ok(`entities ${before} → ${after} (2 children spawned)`);
  else fail(`entities ${before} → ${after}`);
});

// ─── Requirement 15: hit-stop on critical ─────────────────────────────────
await test('REQ-15 — setHitStopTimer sets runtime.hitStopTimer', async () => {
  // Single evaluate so game tick can't decrement value between set + read.
  const v = await page.evaluate(() => {
    window.__api.setHitStopTimer(0.1);
    return window.__runtime.hitStopTimer;
  });
  if (v === 0.1) ok(`hitStopTimer=${v}`); else fail(`hitStopTimer=${v}`);
});

await pauseGame();

// ─── Requirement 16: pet aggro routing ────────────────────────────────────
await test('REQ-16 — Enemy with high pet aggro routes to pet (not player)', async () => {
  const r = await page.evaluate(() => {
    const s = window.__state;
    s.pets = [{
      id: 'pet1', name: 'Pup', hp: 20, maxHp: 20, alive: true, injured: false,
      x: s.player.x + 2, y: s.player.y, scene: s.scene, ownerId: 'player:local', partyId: 'party:local',
      atk: 4
    }];
    const enemy = {
      kind: 'monster', species: 'wolf', name: '狼',
      x: s.player.x + 2, y: s.player.y + 0.5,  // near pet
      hp: 10, atk: 3, alive: true, faction: 'monster',
      cooldown: 99, region: 'forest', r: 12, speed: 1.5,
      petAggro: { pet1: 100 },  // strong aggro on pet
      ownerId: 'world', id: 'aggro-test'
    };
    s.entities = [enemy];
    // strongestPetAggro is in api/scene exports
    const result = window.__api.strongestPetAggro?.(enemy);
    return { hasFn: typeof window.__api.strongestPetAggro === 'function', pet: result?.pet?.id, value: result?.value };
  });
  if (r.pet === 'pet1' && r.value === 100) ok(`pet routed: ${r.pet} (aggro=${r.value})`);
  else fail(`strongestPetAggro result: ${JSON.stringify(r)}`);
});

// ─── Requirement 17: dropLoot drops pickup on monster defeat ──────────────
await test('REQ-17 — Defeated wolf spawns a pickup + grants gold', async () => {
  const r = await page.evaluate(() => {
    const s = window.__state;
    s.player.gold = 0;
    s.pickups = [];
    s.entities = [];
    // Try many times to get a drop (probabilistic)
    let success = false;
    for (let i = 0; i < 50; i++) {
      const w = {
        kind: 'monster', species: 'wolf', name: '小魔狼',
        x: s.player.x, y: s.player.y,
        hp: 1, atk: 3, alive: true, faction: 'monster',
        region: 'forest', r: 12, speed: 1.5,
        ownerId: 'world', id: 'drop-test-' + i
      };
      s.entities.push(w);
      window.__api.defeatEntity(w);
      if (s.pickups.length > 0) { success = true; break; }
    }
    return { pickupCount: s.pickups.length, gold: s.player.gold, success };
  });
  if (r.success && r.gold > 0) ok(`pickups=${r.pickupCount}, gold=${r.gold}`);
  else fail(`no pickup after 50 tries: ${JSON.stringify(r)}`);
});

// ─── Requirement 18: Magic cast resolves ──────────────────────────────────
await test('REQ-18 — beginMagicCast + resolveMagicCast applies damage', async () => {
  const r = await page.evaluate(() => {
    const s = window.__state;
    s.player.mp = 50;
    s.player.maxMp = 50;
    s.player.magicKnown = ['fireball'];
    s.player.monsterForm = false;
    s.entities = [{
      kind: 'monster', species: 'wolf', name: '靶',
      x: s.player.x + 2, y: s.player.y,
      hp: 100, atk: 0, alive: true, faction: 'monster',
      region: 'forest', r: 12, speed: 0, cooldown: 99,
      ownerId: 'world', id: 'spell-target'
    }];
    window.__runtime.aimVector = { x: 1, y: 0 };
    window.__runtime.aimWorld = { x: s.player.x + 2, y: s.player.y };
    window.__api.beginMagicCast('fireball');
    const cast = window.__runtime.pendingMagicCast;
    if (!cast) return { error: 'no pending cast' };
    const hp0 = s.entities[0].hp;
    window.__api.resolveMagicCast(cast);
    return { hp0, hp1: s.entities[0].hp, pending: !!window.__runtime.pendingMagicCast };
  });
  if (r.error) fail(r.error);
  else if (r.hp1 < r.hp0) ok(`target HP ${r.hp0} → ${r.hp1}`);
  else fail(`spell didn't damage: ${JSON.stringify(r)}`);
});

// ─── Requirement 19: monsterForm blocks casting ──────────────────────────
await test('REQ-19 — monsterForm prevents beginMagicCast', async () => {
  const r = await page.evaluate(() => {
    window.__state.player.monsterForm = true;
    window.__state.player.mp = 50;
    window.__state.player.magicKnown = ['fireball'];
    window.__runtime.pendingMagicCast = null;
    window.__api.beginMagicCast('fireball');
    return { pending: !!window.__runtime.pendingMagicCast };
  });
  if (!r.pending) ok('monsterForm blocked cast');
  else fail('cast went through in monsterForm');
});

// ─── Requirement 20: Quest kill progress ──────────────────────────────────
await test('REQ-20 — Defeating quest target increments quest progress', async () => {
  const r = await page.evaluate(() => {
    const s = window.__state;
    s.player.monsterForm = false;
    s.quests = { major: null, small: [] };
    window.__api.acceptMajorQuest('major_wolf_hunt');
    const q0 = s.quests.major;
    if (!q0) return { error: 'quest not accepted' };
    const wolf = {
      kind: 'monster', species: 'wolf', name: '小魔狼',
      x: s.player.x, y: s.player.y,
      hp: 1, atk: 3, alive: true, faction: 'monster',
      region: 'forest', r: 12, speed: 1.5,
      ownerId: 'world', id: 'quest-wolf'
    };
    s.entities = [wolf];
    window.__api.defeatEntity(wolf);
    return { progress: s.quests.major?.progress, count: q0.count };
  });
  if (r.error) fail(r.error);
  else if (r.progress >= 1) ok(`progress ${r.progress}/${r.count}`);
  else fail(`progress=${r.progress}`);
});

// ─── Requirement 21: Settle quest pays reward ─────────────────────────────
await test('REQ-21 — settleMajorQuest pays gold/potions reward', async () => {
  const r = await page.evaluate(() => {
    const s = window.__state;
    s.player.gold = 0;
    s.player.potions = 0;
    s.quests = { major: null, small: [] };
    // Use the proper API so rollQuestReward converts tuples to single ints.
    window.__api.acceptMajorQuest('major_wolf_hunt');
    const q = s.quests.major;
    if (!q) return { error: 'quest not accepted' };
    q.progress = q.count;
    q.goalDone = true;
    window.__api.settleMajorQuest(false);
    return { gold: s.player.gold, potions: s.player.potions, hadQuest: !!s.quests.major };
  });
  if (r.error) fail(r.error);
  else if (r.gold > 0 && !r.hadQuest) ok(`reward paid: gold=${r.gold} potions=${r.potions}`);
  else fail(JSON.stringify(r));
});

// ─── Requirement 22: Pet AI ────────────────────────────────────────────────
await test('REQ-22 — updatePets moves pet toward player when far', async () => {
  const r = await page.evaluate(() => {
    const s = window.__state;
    // Build a complete pet with all required fields (mirror makePet shape)
    s.pets = [{
      id: 'pet1', name: 'Pup', hp: 20, maxHp: 20, atk: 5, alive: true,
      injured: false, lost: false, dead: false, carried: false,
      x: s.player.x + 5, y: s.player.y, scene: s.scene,
      ownerId: 'player:local', partyId: 'party:local',
      speed: 2, cooldown: 1.0, cooldownTimer: 0,
      wanderTimer: 0, wanderX: 0, wanderY: 0,
      guardRange: 6, attackRange: 0.9, roamRadius: 4,
      rescueTimer: 0
    }];
    s.entities = [];
    const x0 = s.pets[0].x;
    window.__api.updatePets(1.0);
    return { x0, x1: s.pets[0].x };
  });
  if (r.x1 < r.x0) ok(`pet x ${r.x0.toFixed(2)} → ${r.x1.toFixed(2)} (closer)`);
  else fail(`pet did not follow: ${r.x0.toFixed(2)} → ${r.x1.toFixed(2)}`);
});

// ─── Requirement 23: MP regen ─────────────────────────────────────────────
await test('REQ-23 — MP regen ticks up over time', async () => {
  const r = await page.evaluate(() => {
    window.__state.player.mp = 5;
    window.__state.player.maxMp = 20;
    window.__state.player.mpRegenLock = 0;
    const mp0 = window.__state.player.mp;
    window.__api.updateMpRegen(2.0);
    return { mp0, mp1: window.__state.player.mp };
  });
  if (r.mp1 > r.mp0) ok(`MP ${r.mp0} → ${r.mp1.toFixed(2)}`);
  else fail(`no regen: ${r.mp0} → ${r.mp1}`);
});

// ─── Requirement 24: Portal loads new scene ───────────────────────────────
await test('REQ-24 — loadScene("forest") changes state.scene', async () => {
  const r = await page.evaluate(() => {
    window.__state.scene = 'field';
    window.__api.loadScene('forest', 5, 5, '探索森林');
    return { scene: window.__state.scene, x: window.__state.player.x, y: window.__state.player.y };
  });
  if (r.scene === 'forest' && r.x === 5 && r.y === 5) ok(`scene=${r.scene} pos=(${r.x},${r.y})`);
  else fail(`scene=${r.scene} pos=(${r.x},${r.y})`);
});

const TOTAL = 24;
console.log(`\n${'═'.repeat(50)}`);
console.log(`${failures.length === 0 ? 'PASS' : 'FAIL'}: ${TOTAL - failures.length}/${TOTAL} checks pass`);
failures.forEach(f => console.log(' ✗', f));

await browser.close();
process.exit(failures.length ? 1 : 0);
