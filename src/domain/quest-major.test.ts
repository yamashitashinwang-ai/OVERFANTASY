import { beforeEach, describe, expect, it } from 'vitest';
import { state } from '../runtime/state.ts';
import { acceptMajorQuest, majorQuestStatus, recordQuestDefeat, settleMajorQuest } from './quest.ts';
import { actor, resetQuestTestState } from './quest.test-fixtures.ts';

describe('major quest progression', () => {
  beforeEach(resetQuestTestState);

  it('accepts a major kill quest, records defeat progress, and settles rewards', () => {
    acceptMajorQuest('major_wolf_hunt');

    const quest = state.quests.major;
    expect(quest).toEqual(expect.objectContaining({
      id: 'major_wolf_hunt',
      type: 'kill',
      progress: 0,
      goalDone: false,
      settled: false
    }));
    expect(majorQuestStatus(quest)).toContain('森林魔狼讨伐');

    recordQuestDefeat(actor({ species: 'wolf' }));
    recordQuestDefeat(actor({ species: 'wolf' }));
    expect(state.quests.major?.goalDone).toBe(false);

    recordQuestDefeat(actor({ species: 'wolf' }));
    expect(state.quests.major?.goalDone).toBe(true);
    expect(state.quests.major?.autoSettleAt).toBeGreaterThan(state.time);

    const reward = state.quests.major?.reward || {};
    const expectedGold = reward.gold || 0;
    const expectedPotions = reward.potions || 0;
    const expectedWood = reward.wood || 0;
    const expectedStone = reward.stone || 0;

    expect(settleMajorQuest(false)).toBe(true);

    expect(state.quests.major).toBeNull();
    expect(state.player.gold).toBe(expectedGold);
    expect(state.player.potions).toBe(expectedPotions);
    expect(state.player.resources['木材'] || 0).toBe(expectedWood);
    expect(state.player.resources['反重力石'] || 0).toBe(expectedStone);
  });
});
