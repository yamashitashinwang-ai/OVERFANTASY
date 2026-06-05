import '../test-support/phaser.test-fixtures.ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initialState, state } from '../runtime/state.ts';
import { clonePlain, replaceObject } from '../domain/math.ts';
import { awardProficiency, ensureProficiencyState } from '../domain/proficiency.ts';
import { renderCharacterPanel } from './character.ts';
import { htmlCache } from './cache.ts';

function resetCharacterPanelTestState() {
  document.body.innerHTML = '<div id="characterPanel" class="character-panel hidden"></div>';
  replaceObject(state, clonePlain(initialState));
  htmlCache.character = '';
  ensureProficiencyState();
  vi.restoreAllMocks();
  vi.spyOn(Math, 'random').mockReturnValue(0.99);
}

describe('character status panel', () => {
  beforeEach(resetCharacterPanelTestState);

  it('renders visible character status and proficiency progress', () => {
    awardProficiency('bow', 12);

    renderCharacterPanel();

    const html = document.getElementById('characterPanel')?.innerHTML || '';
    expect(html).toContain('角色状态');
    expect(html).toContain('种族');
    expect(html).toContain('职业倾向');
    expect(html).toContain('游侠');
    expect(html).toContain('第一职业');
    expect(html).toContain('细分职业');
    expect(html).toContain('未选择');
    expect(html).toContain('职业选择');
    expect(html).toContain('任意熟练度达到 5 级后可以选择职业。');
    expect(html).toContain('disabled');
    expect(html).toContain('弓术');
    expect(html).toContain('Lv0 12/150');
    expect(html).toContain('当前武器');
  });

  it('does not expose hidden corruption, monster-form, or death-fatigue state', () => {
    state.player.corruption = 77;
    state.player.monsterForm = true;
    state.player.deathFatigue = 2;

    renderCharacterPanel();

    const text = document.getElementById('characterPanel')?.textContent || '';
    expect(text).not.toContain('魔化值');
    expect(text).not.toContain('魔物化状态');
    expect(text).not.toContain('死亡疲劳');
    expect(text).not.toContain('77');
  });

  it('enables the career selection entry after a proficiency reaches level 5', () => {
    const proficiency = ensureProficiencyState();
    proficiency.records.sword.level = 5;
    proficiency.records.sword.exp = 0;
    proficiency.records.sword.totalExp = 50000;

    renderCharacterPanel();

    const button = document.querySelector<HTMLButtonElement>('[data-character-action="career"]');
    expect(button?.disabled).toBe(false);
    expect(button?.textContent).toContain('职业选择');
  });
});
