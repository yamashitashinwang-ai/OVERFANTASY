import '../test-support/phaser.test-fixtures.ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initialState, state } from '../runtime/state.ts';
import { clonePlain, replaceObject } from '../domain/math.ts';
import { ensureProficiencyState, selectFirstClass, selectSubclass, subclassIdFor } from '../domain/proficiency.ts';
import type { ProficiencyId } from '../domain/types.ts';
import { renderCareerPanel } from './career/render.ts';
import { htmlCache } from './cache.ts';

function setLevel(id: ProficiencyId, level: number) {
  const proficiency = ensureProficiencyState();
  proficiency.records[id].level = level;
  proficiency.records[id].exp = 0;
  proficiency.records[id].totalExp = Math.max(proficiency.records[id].totalExp, level * 10000);
}

function resetCareerPanelTestState() {
  document.body.innerHTML = '<div id="careerPanel" class="career-panel hidden"></div>';
  replaceObject(state, clonePlain(initialState));
  htmlCache.career = '';
  ensureProficiencyState();
  vi.restoreAllMocks();
  vi.spyOn(Math, 'random').mockReturnValue(0.99);
}

describe('career selection panel', () => {
  beforeEach(resetCareerPanelTestState);

  it('renders first class candidates without auto-selecting a class', () => {
    setLevel('sword', 5);
    setLevel('magic', 5);

    renderCareerPanel();

    const html = document.getElementById('careerPanel')?.innerHTML || '';
    expect(html).toContain('职业选择');
    expect(html).toContain('第一职业');
    expect(html).toContain('剑士');
    expect(html).toContain('术士');
    expect(html).toContain('可选择');
    expect(html).toContain('未选择');
    expect(state.player.proficiency.career.firstClassConfirmed).toBe(false);
  });

  it('shows the first class locked state after selection instead of unrelated first-class cards', () => {
    setLevel('sword', 5);
    setLevel('magic', 5);
    selectFirstClass('sword');

    renderCareerPanel();

    const text = document.getElementById('careerPanel')?.textContent || '';
    expect(text).toContain('第一职业选择');
    expect(text).toContain('第一职业已确认');
    expect(text).toContain('剑士');
    expect(text).not.toContain('术士');
  });

  it('renders only the selected first class route for subclass candidates', () => {
    setLevel('sword', 30);
    setLevel('magic', 5);
    selectFirstClass('sword');

    renderCareerPanel();

    const text = (document.getElementById('careerPanel')?.textContent || '').replace(/\s+/g, '');
    expect(text).toContain('第一职业剑士');
    expect(text).toContain('魔剑士');
    expect(text).toContain('影武士');
    expect(text).not.toContain('自然之人');
  });

  it('shows confirmed subclass state after manual selection', () => {
    setLevel('sword', 30);
    setLevel('magic', 5);
    selectFirstClass('sword');
    selectSubclass(subclassIdFor('sword', 'magic'));

    renderCareerPanel();

    const text = (document.getElementById('careerPanel')?.textContent || '').replace(/\s+/g, '');
    expect(text).toContain('细分职业魔剑士');
    expect(text).toContain('已确认');
  });
});
