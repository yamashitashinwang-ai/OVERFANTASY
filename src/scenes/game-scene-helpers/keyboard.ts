import type Phaser from 'phaser';
import { runtime } from '../../runtime/state.ts';
import { uiState, isPlaying, isMenuOpen } from '../../runtime/ui-state.ts';
import { bindMovementKeys, bindActions, modalKey, routeEscape } from '../../runtime/input.ts';
import { talkOrUse, helpWounded, handlePetRescue, gift, rest } from '../../domain/npc.ts';
import { learnMagicFromInput } from '../../domain/magic.ts';
import { hasCorruptionControlLock } from '../../domain/corruption.ts';
import { toggleBackpack } from '../../ui/backpack.ts';
import { closeShopPanel } from '../../ui/shop.ts';
import { closeForgePanel } from '../../ui/forge.ts';
import { openMagicPanel, closeMagicPanel, refreshMagicPanel } from '../../ui/magic.ts';
import { openCurrentQuestPanel, closeQuestPanel } from '../../ui/quest.ts';
import { openCharacterPanel, closeCharacterPanel } from '../../ui/character.ts';
import { closeCareerPanel } from '../../ui/career.ts';
import { renderMainMenu } from '../../ui/menus.ts';
import { htmlCache } from '../../ui/cache.ts';
import { get } from '../../ui/dom.ts';
import { openPauseMenu, closePauseMenu } from './pause.ts';

export function installKeyBindings(scene: Phaser.Scene) {
  runtime.mvKeys = bindMovementKeys(scene);

  const modalClosers = {
    backpack: () => toggleBackpack(false),
    quest:    () => closeQuestPanel(),
    shop:     () => closeShopPanel(),
    forge:    () => closeForgePanel(),
    magic:    () => closeMagicPanel(),
    character: () => closeCharacterPanel(),
    career:   () => closeCareerPanel(),
    pause:    () => closePauseMenu()
  };

  bindActions(scene, {
    'B':   () => { if (isPlaying() && !hasCorruptionControlLock() && !uiState.questOpen && !uiState.shopOpen && !uiState.forgeOpen && !uiState.magicOpen && !uiState.characterOpen && !uiState.careerOpen) toggleBackpack(); },
    'J':   () => { if (isPlaying() && !hasCorruptionControlLock() && !uiState.backpackOpen && !uiState.shopOpen && !uiState.forgeOpen && !uiState.magicOpen && !uiState.characterOpen && !uiState.careerOpen) openCurrentQuestPanel(); },
    'F':   () => { if (isPlaying() && !hasCorruptionControlLock() && !uiState.backpackOpen && !uiState.questOpen && !uiState.shopOpen && !uiState.forgeOpen && !uiState.magicOpen && !uiState.characterOpen && !uiState.careerOpen) openMagicPanel('book'); },
    'P':   () => { if (isPlaying() && !hasCorruptionControlLock() && !modalKey()) openCharacterPanel(); },
    'E':   () => { if (isPlaying() && !hasCorruptionControlLock() && !modalKey()) { if (!handlePetRescue() && !helpWounded()) talkOrUse(); } },
    'G':   () => { if (isPlaying() && !hasCorruptionControlLock() && !modalKey()) gift(); },
    'R':   () => { if (isPlaying() && !hasCorruptionControlLock() && !modalKey()) rest(); },
    'ESC': () => {
      if (isMenuOpen()) {
        if (uiState.menuView !== 'main') {
          uiState.menuView = 'main';
          uiState.selectedSaveId = null;
          uiState.pendingDeleteSaveId = null;
          htmlCache.menu = '';
          renderMainMenu();
        }
        return;
      }
      routeEscape(modalKey, modalClosers, () => { if (isPlaying() && !hasCorruptionControlLock()) openPauseMenu(); });
    }
  });

  // Magic panel's <input> captures focus; bind Enter/Esc on that element.
  get.magicPanelEl?.addEventListener('keydown', (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    const target = e.target as HTMLInputElement | null;
    if (!target?.matches?.('[data-magic-input]')) return;
    if (k === 'escape') { closeMagicPanel(); e.preventDefault(); }
    else if (k === 'enter') {
      uiState.magicInput = target.value;
      learnMagicFromInput(uiState.magicInput);
      uiState.magicInput = '';
      refreshMagicPanel();
      e.preventDefault();
    }
  });
}
