// Combat — damage application + defeat resolution. Centralises the maths and
// side-effects of "taking damage" so combat formulas, race shields, pet pathos
// state, and loot drops live in one place.
//
// Side-effects this module triggers (via game-logic helpers re-exported by
// scenes/Game.js until the rest of the migration lands):
//   * log()                 — flavour text
//   * refreshCombatStats()  — atk/def recompute after pathos toggles
//   * loadScene()           — player respawn after defeat
//   * recordQuestDefeat()   — kill-quest progress

import { state } from '../../scenes/Game.js';
import { clamp, rand } from '../math.js';
import { addPickup, spawnCreature, regionAt, currentPetScene } from '../world.js';
import { equippedModList, gearModList, refreshCombatStats } from './weapon.js';
import { raceDefenseMultiplier } from './race.js';
import { currentPartyId, currentPlayerId } from '../session.js';
import { triggerHitTween } from '../../display/animations.js';
import { bus, Events } from '../../runtime/events.js';
import { log as dlog, NS } from '../../runtime/log.js';
import {
  // facades still hosted in Game.js
  log, loadScene, dropEmbeddedArrows
} from '../../scenes/Game.js';
import { recordQuestDefeat } from '../quest.js';
import DATA from '../../data.js';

const { regions, bestiary } = DATA;

// Hit reaction (display) is now a tween; the wrapper stays here so combat
// code keeps the familiar `markHitReaction` call signature.
export function markHitReaction(target, critical = false) {
  triggerHitTween(target, critical);
}

export function damagePlayer(amount, source) {
  if (state.player.invuln > 0) {
    dlog(NS.COMBAT_PLAYER_HURT, 'BLOCKED by invuln=%s  src=%s amount=%d',
      state.player.invuln.toFixed(2), source?.name || '?', amount);
    return;
  }
  refreshCombatStats();
  const blocked = state.player.blockTimer > 0;
  let finalAmount = blocked ? Math.ceil(amount * 0.35) : amount;
  finalAmount = Math.max(1, Math.ceil(finalAmount - (state.player.def * raceDefenseMultiplier()) * 0.55));
  const hpBefore = state.player.hp;
  state.player.hp -= finalAmount;
  state.player.lastHitBy = source;
  state.player.invuln = 0.65;
  dlog(NS.COMBAT_PLAYER_HURT, 'hp %d->%d  raw=%d final=%d blocked=%s src=%s',
    hpBefore, state.player.hp, amount, finalAmount, blocked, source?.name || '?');
  bus.emit(Events.PLAYER_HURT, { amount: finalAmount, blocked, source });
  if (blocked) log(`防御成功，受到${finalAmount}点伤害。`);
  if (source && source.alive) {
    const armorMods = Object.entries(state.player.gear)
      .filter(([slot]) => slot !== "weapon")
      .flatMap(([, gearId]) => gearId ? gearModList(gearId) : []);
    const thorns = equippedModList().reduce((sum, mod) => sum + (mod.thorns || 0), 0);
    const slowMod = armorMods.reduce((best, mod) => (mod.slowOnBlock || 0) > (best.slowOnBlock || 0) ? mod : best, {});
    if (slowMod.slowOnBlock) {
      source.slowTimer = Math.max(source.slowTimer || 0, slowMod.duration || 2.6);
      source.slowPower = Math.max(source.slowPower || 0, slowMod.slowOnBlock);
    }
    if (thorns > 0) {
      source.hp -= thorns;
      log(`${source.name}被装备上的狼牙反伤${thorns}点。`);
      if (source.hp <= 0) defeatEntity(source);
    }
  }
  if (state.player.hp <= 0) playerDefeated(source);
}

export function damagePet(pet, amount, source) {
  if (!pet || !pet.alive) return;
  pet.hp -= Math.max(1, Math.ceil(amount));
  if (source) {
    if (!source.petAggro) source.petAggro = {};
    source.petAggro[pet.id] = (source.petAggro[pet.id] || 0) + amount;
  }
  if (pet.hp <= 0) {
    pet.alive = false;
    pet.injured = true;
    pet.carried = false;
    pet.rescueTimer = 900;
    pet.scene = currentPetScene();
    pet.hp = 0;
    log(`${pet.name}重伤倒下了。悲怆涌上来：移速和防御提升，攻击几乎消失。15分钟内靠近按E抱起，并带到白石祠恢复。`);
  }
}

export function petDiesIrreversibly(pet) {
  if (!pet || pet.dead) return;
  pet.dead = true;
  pet.lost = true;
  pet.injured = false;
  pet.carried = false;
  pet.alive = false;
  pet.rescueTimer = 0;
  state.petRemains.push({
    id: `remain-${pet.id}`,
    ownerId: pet.ownerId || currentPlayerId(),
    partyId: pet.partyId || currentPartyId(),
    kind: "corpse",
    petName: pet.name,
    x: pet.x,
    y: pet.y,
    scene: pet.scene || currentPetScene(),
    color: pet.color,
    age: 0,
    decay: 0,
    decayClock: 0
  });
  refreshCombatStats();
  log(`${pet.name}没能及时送回神龛，已经不可复活地死亡。`);
  log('"AM I A GOOD BOY?"');
}

export function petById(id) {
  return state.pets.find(pet => pet.id === id && pet.alive && !pet.injured && !pet.lost) || null;
}

export function rollDrop(drop, x, y) {
  if (!drop || Math.random() > drop.chance) return false;
  addPickup(drop.kind, drop.name, x + rand(-0.35, 0.35), y + rand(-0.35, 0.35), drop.color, drop.value || 1);
  return true;
}

export function dropLoot(e) {
  const template = bestiary[e.species];
  if (!template) return;
  const common = rollDrop(template.commonDrop, e.x, e.y);
  const rare = rollDrop(template.rareDrop, e.x, e.y);
  const extraDrops = (template.extraDrops || []).filter(drop => rollDrop(drop, e.x, e.y));
  if (rare) log(`${e.name}掉落了稀有物：${template.rareDrop.name}。`);
  if (extraDrops.length) log(`${e.name}掉落了超稀有物：${extraDrops.map(drop => drop.name).join("、")}。`);
  else if (common) log(`${e.name}留下了${template.commonDrop.name}。`);
}

export function playerDefeated(source) {
  dlog(NS.COMBAT_DEFEAT, 'player defeated by %s (faction=%s) monsterForm=%s',
    source?.name || '?', source?.faction || '?', state.player.monsterForm);
  if (source && source.faction === "monster" && !state.player.monsterForm) {
    state.player.monsterForm = true;
    state.player.hp = Math.ceil(state.player.maxHp * 0.65);
    refreshCombatStats();
    log(`被${source.name}击倒后，角色被魔素污染，暂时转入魔物势力。`);
    dlog(NS.COMBAT_DEFEAT, 'transitioned to monsterForm  hp=%d', state.player.hp);
    return;
  }
  state.player.hp = Math.ceil(state.player.maxHp * 0.5);
  dlog(NS.COMBAT_DEFEAT, 'respawn at white shrine  hp=%d', state.player.hp);
  loadScene("field", 18.5, 13.5, "濒死后被搬回白石祠旁边，损失了一些时间。");
  state.player.blockTimer = 0;
  state.player.dodgeTimer = 0;
  state.player.invuln = 1.2;
}

export function defeatEntity(e, attacker = "player") {
  dlog(NS.COMBAT_DEFEAT, 'defeated entity name=%s kind=%s species=%s by=%s',
    e?.name, e?.kind, e?.species, attacker);
  e.alive = false;
  dropEmbeddedArrows(e);
  if (e.kind === "monster") {
    recordQuestDefeat(e);
    state.player.gold += 2 + Math.floor(Math.random() * 5);
    dropLoot(e);
    if (e.species === "slime" && e.split && (e.slimeGen || 1) < 3) {
      const childGen = (e.slimeGen || 1) + 1;
      spawnCreature("slime", e.x + 0.7, e.y + 0.4, { slimeGen: childGen, region: e.region });
      spawnCreature("slime", e.x - 0.7, e.y - 0.4, { slimeGen: childGen, region: e.region });
      log(`${e.name}分裂成第${childGen}代小史莱姆。第三代不会继续分裂。`);
    }
    log(`击败了${e.name}。`);
    return;
  }
  if (e.kind === "animal") {
    recordQuestDefeat(e);
    dropLoot(e);
    const r = regions[e.region] || regionAt(e.x, e.y);
    r.trust = clamp(r.trust - 3, 0, 100);
    r.hate = clamp(r.hate + 4, 0, 100);
    log(`猎获${e.name}，${r.name}的信任略降。`);
    return;
  }
  if (e.kind === "friendly" || e.kind === "npc") {
    dropLoot(e);
    const r = regions[e.region] || regionAt(e.x, e.y);
    r.trust = clamp(r.trust - 22, 0, 100);
    r.hate = clamp(r.hate + 26, 0, 100);
    log(`${e.name}倒下了。${r.name}信任下降，仇恨上升。`);
    return;
  }
  if (attacker === "monster") log(`${e.name}被卷入冲突。`);
}
