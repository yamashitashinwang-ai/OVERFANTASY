import { uiState, isPlaying } from '../../runtime/ui-state.ts';
import { blockWorldAction, releaseWorldPointerInput } from '../../runtime/input.ts';
import { playerAttack, playerDefend, playerDodge } from '../../domain/combat/actions.ts';
import { talkOrUse, helpWounded, handlePetRescue, gift, rest } from '../../domain/npc.ts';
import { hasCorruptionControlLock } from '../../domain/corruption.ts';
import { toggleBackpack } from '../../ui/backpack.ts';
import { openMagicPanel } from '../../ui/magic.ts';

export function installButtonHandlers() {
  const handlers: Record<string, (event: MouseEvent) => void> = {
    btnTalk: (event: MouseEvent) => { if (!blockWorldAction(event)) { if (!handlePetRescue() && !helpWounded()) talkOrUse(); } },
    btnAttack: (event: MouseEvent) => { if (!blockWorldAction(event)) playerAttack(); },
    btnDefend: (event: MouseEvent) => { if (!blockWorldAction(event)) playerDefend(); },
    btnDodge: (event: MouseEvent) => { if (!blockWorldAction(event)) playerDodge(); },
    btnGift: (event: MouseEvent) => { if (!blockWorldAction(event)) gift(); },
    btnRest: (event: MouseEvent) => { if (!blockWorldAction(event)) rest(); },
    btnBackpack: (event: MouseEvent) => {
      if (!isPlaying() || hasCorruptionControlLock() || uiState.questOpen || uiState.shopOpen || uiState.forgeOpen || uiState.magicOpen) { event.preventDefault(); return; }
      toggleBackpack();
    },
    btnMagic: (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      releaseWorldPointerInput();
      if (!isPlaying() || hasCorruptionControlLock() || uiState.backpackOpen || uiState.questOpen || uiState.shopOpen || uiState.forgeOpen) return;
      openMagicPanel('book');
    }
  };
  for (const [id, fn] of Object.entries(handlers)) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  }
}
