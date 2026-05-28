// Entity + Pet + Pet-remain AI ticks. Each updateXxx(dt) advances the
// behaviour of its actor population for one game-logic frame. Reads state +
// game-logic helpers; writes velocities via moveActor (Arcade Physics).
//
// Pure of DOM. Imports `log` / `defeatEntity` / `damagePlayer` etc. from
// scenes/Game.js until those layers also migrate.

import { state } from '../scenes/Game.js';
import { rand, dist } from './math.js';
import { ownedByCurrentPlayer } from './session.js';
import { moveActor } from '../display/index.js';
import { raceDamageMultiplier } from './combat/race.js';
import {
  log,
  attackEntityFilter, strongestPetAggro
} from '../scenes/Game.js';
import { runtime } from '../runtime/state.js';
import { defeatEntity, damagePlayer, damagePet, petDiesIrreversibly } from './combat/damage.js';
import { addMagicClue } from './magic.js';
import { currentPetScene } from './world.js';
import { equippedModList } from './combat/weapon.js';
import { log as dlog, NS } from '../runtime/log.js';
import DATA from '../data.js';

const { graveDecayInterval, graveMaxDecay, bestiary, regions } = DATA;

function playerRepelsMonsters() {
  return equippedModList().some(mod => mod.repelMonsters);
}

export function updatePetRemains(dt) {
  for (const remain of state.petRemains) {
    if (remain.kind !== "grave") continue;
    remain.age += dt;
    remain.decayClock += dt;
    if (remain.decayClock >= graveDecayInterval) {
      remain.decayClock = 0;
      remain.decay += 1;
      if (remain.decay < graveMaxDecay && remain.scene === currentPetScene()) {
        log(`${remain.petName}的坟墓又腐败了一点。`);
      }
    }
  }
  const before = state.petRemains.length;
  state.petRemains = state.petRemains.filter(remain => remain.kind !== "grave" || remain.decay < graveMaxDecay);
  if (state.petRemains.length < before) log("一座宠物的坟墓彻底消失了。");
}

export function updatePets(dt) {
  for (const pet of state.pets) {
    if (!ownedByCurrentPlayer(pet)) continue;
    if (pet.lost) continue;
    if (pet.injured) {
      pet.rescueTimer = Math.max(0, pet.rescueTimer - dt);
      if (pet.carried) {
        pet.scene = currentPetScene();
        pet.x = state.player.x - 0.55;
        pet.y = state.player.y + 0.55;
      }
      if (pet.rescueTimer <= 0) {
        petDiesIrreversibly(pet);
      }
      continue;
    }
    if (!pet.alive) continue;
    pet.cooldownTimer = Math.max(0, pet.cooldownTimer - dt);
    pet.wanderTimer -= dt;
    if (pet.wanderTimer <= 0) {
      pet.wanderTimer = rand(0.8, 1.8);
      pet.wanderX = rand(-1, 1);
      pet.wanderY = rand(-1, 1);
    }

    const engaged = state.entities
      .filter(e => e.alive && e.faction === "monster" && (e.playerAggro || 0) > 0 && dist(e, state.player) <= pet.guardRange)
      .sort((a, b) => dist(a, pet) - dist(b, pet))[0];

    if (engaged) {
      const d = dist(pet, engaged);
      if (d > pet.attackRange) {
        moveActor(pet, (engaged.x - pet.x) / Math.max(0.001, d), (engaged.y - pet.y) / Math.max(0.001, d), pet.speed, dt);
      } else if (pet.cooldownTimer <= 0) {
        engaged.hp -= pet.atk;
        if (!engaged.petAggro) engaged.petAggro = {};
        engaged.petAggro[pet.id] = (engaged.petAggro[pet.id] || 0) + pet.atk + 3;
        pet.cooldownTimer = pet.cooldown;
        log(`${pet.name}护主攻击${engaged.name}，造成${pet.atk}点伤害。`);
        if (engaged.hp <= 0) defeatEntity(engaged, "pet");
      }
      continue;
    }

    const homeD = dist(pet, state.player);
    if (homeD > pet.roamRadius) {
      moveActor(pet, (state.player.x - pet.x) / Math.max(0.001, homeD), (state.player.y - pet.y) / Math.max(0.001, homeD), pet.speed * 1.15, dt);
    } else {
      const len = Math.hypot(pet.wanderX, pet.wanderY) || 1;
      moveActor(pet, pet.wanderX / len, pet.wanderY / len, pet.speed * 0.32, dt);
    }
  }
}

export function updateEntities(dt) {
  const p = state.player;
  for (const e of state.entities) {
    if (!e.alive) continue;
    e.cooldown = Math.max(0, e.cooldown - dt);
    e.slowTimer = Math.max(0, (e.slowTimer || 0) - dt);
    e.playerAggro = Math.max(0, (e.playerAggro || 0) - dt * 0.18);
    for (const petId of Object.keys(e.petAggro || {})) {
      e.petAggro[petId] = Math.max(0, e.petAggro[petId] - dt * 0.22);
      if (e.petAggro[petId] <= 0.01) delete e.petAggro[petId];
    }
    const playerD = dist(e, p);
    const petThreat = strongestPetAggro(e);
    const canTargetPlayer = (e.faction === "monster" && !p.monsterForm) || (p.monsterForm && e.faction !== "monster" && e.kind !== "animal");
    if (canTargetPlayer && playerD < 11.5) e.playerAggro = Math.max(e.playerAggro || 0, 3);
    const target = petThreat.pet && petThreat.value > (e.playerAggro || 0) ? petThreat.pet : p;
    const d = dist(e, target);
    const shouldAttack = (canTargetPlayer && playerD < 11.5) || !!petThreat.pet;
    if (shouldAttack) {
      const dx = (target.x - e.x) / Math.max(0.001, d);
      const dy = (target.y - e.y) / Math.max(0.001, d);
      if (target === p && playerRepelsMonsters() && e.faction === "monster" && e.species !== "demonKing" && d < 6.5) {
        moveActor(e, -dx, -dy, (e.speed || 1.5) + 1.4, dt);
        continue;
      }
      e.specialClock = Math.max(0, (e.specialClock || 0) - dt);
      const hateBoost = Math.min(1.6, (regions[e.region]?.hate || 20) / 65);
      let speed = (e.speed || 1.5) + hateBoost;
      if (e.pounce && e.specialClock <= 0 && d < 4.8) {
        speed += 3.2;
        e.specialClock = rand(2.4, 4.1);
      }
      if (e.slowTimer > 0) speed *= Math.max(0.3, 1 - (e.slowPower || 0.35));
      moveActor(e, dx, dy, speed, dt);
      if (e.ranged && d < 4.6 && e.cooldown <= 0) {
        dlog(NS.COMBAT_ENEMY_ATTACK, 'ranged %s -> %s d=%s atk=%d',
          e.name, target === p ? 'player' : target?.name || 'pet', d.toFixed(2), Math.ceil((e.atk || 3) * 0.72));
        if (target === p) damagePlayer(Math.ceil((e.atk || 3) * 0.72), e);
        else damagePet(target, Math.ceil((e.atk || 3) * 0.72), e);
        e.cooldown = rand(1.6, 2.3);
        if (e.species === "wisp") {
          log(`${e.name}从远处释放了像火球术一样的魔弹。`);
          addMagicClue("fireball", "你亲眼见到魔弹凝成火球，终于理解了火球术的一部分。");
        } else {
          log(`${e.name}从远处释放了魔弹。`);
        }
      }
      if (d < 0.9 && e.cooldown <= 0) {
        dlog(NS.COMBAT_ENEMY_ATTACK, 'melee %s -> %s d=%s atk=%d cdAfter=%s',
          e.name, target === p ? 'player' : target?.name || 'pet', d.toFixed(2), e.atk || 2, e.guard ? '0.95' : '1.08');
        if (target === p) damagePlayer(e.atk || 2, e);
        else damagePet(target, e.atk || 2, e);
        e.cooldown = e.guard ? 0.95 : 1.08;
      }
    } else if (e.flee && d < 3.5) {
      const dx = (e.x - p.x) / Math.max(0.001, d);
      const dy = (e.y - p.y) / Math.max(0.001, d);
      moveActor(e, dx, dy, 1.8, dt);
    } else if (e.kind === "npc" && e.affection >= 60 && !e.wounded && !p.monsterForm) {
      if (d > 3.5 && Math.random() < dt * 0.18) {
        const dx = (p.x - e.x) / Math.max(0.001, d);
        const dy = (p.y - e.y) / Math.max(0.001, d);
        moveActor(e, dx, dy, 1.3, dt);
        e.wantsTalk = true;
      }
    } else if (Math.random() < dt * 0.18) {
      moveActor(e, rand(-1, 1), rand(-1, 1), 0.45, dt);
    }
  }

  const savior = state.entities.find(e => e.alive && e.kind === "npc" && e.devotion >= 60 && dist(e, p) < 2.0);
  if (savior && p.hp <= 8 && Math.random() < dt * 0.8) {
    p.hp = 18;
    savior.alive = false;
    log(`${savior.name}冲到你身前挡下致命一击。献身值系统触发。`);
  }
}
