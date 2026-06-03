import { state } from '../../runtime/state.ts';
import DATA from '../../data.ts';
import { log } from '../../runtime/services.ts';
import { autoSave } from '../game-flow.ts';
import { magicByInput, forbiddenMagicByInput, isNearMagicName, magicList } from '../magic-input.ts';
import type { ActorState } from '../types.ts';

const { magicCatalog } = DATA;

export function knowsMagic(spellId: string): boolean {
  return state.player.magicKnown.includes(spellId);
}

export function hasMagicClue(spellId: string): boolean {
  return !!state.player.magicClues[spellId];
}

export function addMagicClue(spellId: string, message?: string): boolean {
  const spell = magicCatalog[spellId];
  if (!spell || hasMagicClue(spellId)) return false;
  state.player.magicClues[spellId] = true;
  log(message || spell.clueLine || `你得到了一点关于${spell.name}的线索。`);
  autoSave();
  return true;
}

export function shareMagicRumor(npc: ActorState) {
  const unknown = magicList().filter(spell => !hasMagicClue(spell.id));
  if (!unknown.length) return;
  const spell = unknown[0];
  addMagicClue(spell.id, `${npc.name}提到「${spell.aliases[0]}」：${spell.clueLine}`);
}

export function learnMagicFromInput(input: string) {
  const forbidden = forbiddenMagicByInput(input);
  if (forbidden) {
    log(forbidden.message);
    return;
  }
  const spell = magicByInput(input);
  if (!spell) {
    log(isNearMagicName(input) ? "这个词语似乎接近某种魔法，但还不完整。" : "什么都没有发生。");
    return;
  }
  if (knowsMagic(spell.id)) {
    log("你已经掌握了这个魔法。");
    return;
  }
  if (!hasMagicClue(spell.id)) {
    log("文字发出微光，你似乎是个天才。但魔法无法成形，你还缺少某种理解。");
    return;
  }
  state.player.magicKnown.push(spell.id);
  log(`魔法回应了你。你学会了${spell.name}。`);
  autoSave();
}
