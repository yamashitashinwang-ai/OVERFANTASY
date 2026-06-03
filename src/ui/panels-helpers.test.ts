import '../test-support/phaser.test-fixtures.ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../display/animations.ts', () => ({
  triggerNpcInteract: vi.fn(),
  triggerPlayerInteract: vi.fn()
}));
import DATA from '../data.ts';
import { clonePlain, replaceObject } from '../domain/math.ts';
import type { QuestState } from '../domain/types.ts';
import { initialState, state } from '../runtime/state.ts';
import { uiState } from '../runtime/ui-state.ts';
import {
  backpackDetailHtml,
  backpackItems,
  forgeRequirementHtml,
  knownMagicCards,
  panelHeader,
  questDetailCard,
  selectedWeaponForgeEntry,
  weaponForgeCategories
} from './panels-helpers.ts';

function resetUiHelperState() {
  replaceObject(state, clonePlain(initialState));
  uiState.backpackCategory = 'consumables';
  uiState.backpackSelected = null;
  uiState.forgeWeaponCategory = '剑';
  uiState.forgeSelectedWeapon = null;
  uiState.magicOpen = false;
}

describe('panel helper facade', () => {
  beforeEach(() => resetUiHelperState());

  it('keeps shared panel header escaping and close action markup', () => {
    const html = panelHeader('背包 <测试>', 'bag');
    expect(html).toContain('背包 &lt;测试&gt;');
    expect(html).toContain('data-bag-action="close"');
  });

  it('builds backpack item lists and details through the facade', () => {
    state.player.herbs = 2;
    state.player.potions = 1;
    const items = backpackItems('consumables');

    expect(items.map(item => item.id)).toEqual(['herb', 'potion']);
    expect(backpackDetailHtml(items[0])).toContain('data-bag-action="use"');
  });

  it('keeps forge category selection and requirement rendering stable', () => {
    state.player.resources = { '木材': 2, '反重力石': 1 };
    const categories = weaponForgeCategories();
    const selected = selectedWeaponForgeEntry();

    expect(categories).toContain('剑');
    expect(selected?.gearId).toBe(DATA.weaponForgeCatalog['剑'][0].gearId);
    expect(forgeRequirementHtml({ '木材': 1, '反重力石': 2 })).toContain('不足');
  });

  it('renders known magic cards without enabling casts during a pending cast', () => {
    state.player.magicKnown = ['fireball'];
    state.player.mp = 50;
    const readyHtml = knownMagicCards();
    expect(readyHtml).toContain('火球术');
    expect(readyHtml).toContain('data-magic-action="cast"');

    state.player.mp = 0;
    expect(knownMagicCards()).toContain('disabled');
  });

  it('renders quest details from quest helper exports', () => {
    const quest = clonePlain(DATA.questCatalog.major[0]) as QuestState;
    quest.progress = 1;
    const html = questDetailCard(quest, '大型任务');

    expect(html).toContain('大型任务');
    expect(html).toContain('森林魔狼讨伐');
    expect(html).toContain('1/3');
  });
});
