import { state } from '../../../runtime/state.ts';
import { bus, Events } from '../../../runtime/events.ts';
import { log as dlog, NS } from '../../../runtime/log.ts';
import { log } from '../../../runtime/services.ts';
import { equippedModList, gearModList, refreshCombatStats } from '../weapon.ts';
import { raceDefenseMultiplier } from '../race.ts';
import { addCorruptionFromMonsterHit } from '../../corruption.ts';
import { processPlayerDeath } from '../../death.ts';
import { interruptPendingMagicCast } from '../../magic-casting.ts';
import { defeatEntity } from './defeat.ts';
import type { ActorState, GearMod } from '../../types.ts';

export function damagePlayer(amount: number, source: ActorState | null | undefined) {
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
  interruptPendingMagicCast('damage');
  bus.emit(Events.PLAYER_HURT, { amount: finalAmount, blocked, source });
  addCorruptionFromMonsterHit(source);
  if (blocked) log(`防御成功，受到${finalAmount}点伤害。`);
  if (source && source.alive) {
    const armorMods = Object.entries(state.player.gear)
      .filter(([slot]) => slot !== 'weapon')
      .flatMap(([, gearId]) => gearId ? gearModList(gearId) : []);
    const thorns = equippedModList().reduce((sum, mod) => sum + (mod.thorns || 0), 0);
    const slowMod = armorMods.reduce<GearMod>((best, mod) => (mod.slowOnBlock || 0) > (best.slowOnBlock || 0) ? mod : best, {});
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

export function playerDefeated(source: ActorState | null | undefined) {
  dlog(NS.COMBAT_DEFEAT, 'player defeated by %s (faction=%s) monsterForm=%s',
    source?.name || '?', source?.faction || '?', state.player.monsterForm);
  processPlayerDeath(source);
}
