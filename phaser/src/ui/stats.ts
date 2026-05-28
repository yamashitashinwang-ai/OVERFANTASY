// Stats sidebar panel — renders the right-hand status block (HP/MP/stamina/
// supplies/area/quest etc.) from current state. Lives in `ui/` because it
// writes to the DOM via innerHTML; no Phaser GameObjects.
//
// Decoupling: This module imports from domain/runtime services directly.
// It does NOT mutate state — purely a render function.

import DATA from '../data.ts';
import { state } from '../runtime/state.ts';
import { formatNumber } from '../domain/math.ts';
import { t, raceLabel } from '../domain/i18n.ts';
import {
  currentWeapon, refreshCombatStats, hasPathosEffect
} from '../domain/combat/weapon.ts';
import { regionAt } from '../domain/world.ts';
import { materialSummary } from '../domain/inventory.ts';
import { questBelongsToCurrentPlayer, ownedByCurrentPlayer } from '../domain/session.ts';
import { bus, Events } from '../runtime/events.ts';

const { regions } = DATA;

import { get } from './dom.ts';

function petsForCurrentPlayer() {
  return state.pets.filter(pet => ownedByCurrentPlayer(pet));
}

function ensureQuestState() {
  if (!state.quests) state.quests = { major: null, small: [] };
  if (!Array.isArray(state.quests.small)) state.quests.small = [];
}

export function bindStatsEl(_el: HTMLElement | null) { /* deprecated; get.statsEl resolves lazily */ }

let attached = false;
export function attachStatsPanel() {
  if (attached) return;
  attached = true;
  bus.on(Events.PLAYER_STATS, renderStats);
  bus.on(Events.INVENTORY_CHANGED, renderStats);
  bus.on(Events.GEAR_EQUIPPED, renderStats);
  bus.on(Events.LANGUAGE_CHANGED, renderStats);
  bus.on(Events.QUEST_ACCEPTED, renderStats);
  bus.on(Events.QUEST_PROGRESS, renderStats);
  bus.on(Events.QUEST_SETTLED, renderStats);
  bus.on(Events.SCENE_LOADED, renderStats);
  bus.on(Events.GAME_NEW, renderStats);
  bus.on(Events.GAME_LOADED, renderStats);
  bus.on(Events.PET_INJURED, renderStats);
  bus.on(Events.PET_RESCUED, renderStats);
  bus.on(Events.PET_DIED, renderStats);
  renderStats();
}

export function renderStats() {
  if (!get.statsEl) return;
  refreshCombatStats();
  const area = state.mode === 'world' ? regionAt(state.player.x, state.player.y) : regions.ruins;
  const weapon = currentWeapon();
  const pathos = hasPathosEffect();
  const activePets = petsForCurrentPlayer().filter(pet => !pet.lost);
  const livingPets = activePets.filter(pet => pet.alive && !pet.injured);
  const injuredPets = activePets.filter(pet => pet.injured);
  ensureQuestState();
  const currentMajorQuest = questBelongsToCurrentPlayer(state.quests.major) ? state.quests.major : null;
  const currentSmallQuests = state.quests.small.filter(q => questBelongsToCurrentPlayer(q) && !q.settled);
  const questText = currentMajorQuest ? currentMajorQuest.name : (currentSmallQuests[0]?.name || t('status.none'));
  const pathosText = pathos ? ` ${t('status.pathos')}` : '';
  const statusText = state.player.monsterForm
    ? `${t('status.monster')}${pathosText}`
    : `${raceLabel(state.player.race)}/${state.player.job}${pathosText}`;
  const actionText = state.player.running
    ? t('status.running')
    : (state.player.blockTimer > 0 ? t('status.blocking')
      : (state.player.dodgeCooldown > 0 ? `${t('status.dodge')}${state.player.dodgeCooldown.toFixed(1)}s` : t('status.ready')));

  get.statsEl.innerHTML = [
    [t('stat.status'), statusText],
    [t('stat.hp'), `${Math.max(0, Math.floor(state.player.hp))}/${state.player.maxHp}`],
    [t('stat.mp'), `${formatNumber(state.player.mp)}/${state.player.maxMp}`],
    [t('stat.stamina'), `${state.player.stamina.toFixed(1)}/30${state.player.running ? ` ${t('status.running')}` : ''}`],
    [t('stat.attackDefense'), `${t('unit.attack')}${state.player.atk} ${t('unit.defense')}${state.player.def}`],
    [t('stat.supplies'), `药草${state.player.herbs} 药水${state.player.potions} 箭${state.player.arrows || 0}`],
    [t('stat.resources'), `木${state.player.wood} 石${state.player.stone} ${state.player.gold}G`],
    [t('stat.materials'), materialSummary(2)],
    [t('stat.weapon'), `${weapon.name}/${weapon.type}`],
    [t('stat.performance'), `${t('unit.range')}${weapon.range} ${t('unit.attackCooldown')}${weapon.cooldown.toFixed(2)}s`],
    [t('stat.cooldown'), `${t('unit.attackShort')}${state.player.attackCooldown.toFixed(2)}s ${t('unit.dodgeShort')}${state.player.dodgeCooldown.toFixed(2)}s`],
    [t('stat.area'), `${t('unit.trust')}${area.trust} ${t('unit.hate')}${area.hate}`],
    [t('stat.action'), actionText],
    [t('stat.pet'), injuredPets.length ? `${livingPets.length}/${activePets.length} ${t('unit.injured')}${injuredPets.length}` : `${livingPets.length}/${activePets.length}`],
    [t('stat.quest'), questText],
    [t('stat.relation'), `${state.player.spouse || t('status.none')} 戒${state.player.rings}`]
  ].map(([k, v]) => `<div class="stat"><b>${k}</b><span>${v}</span></div>`).join('');
}
