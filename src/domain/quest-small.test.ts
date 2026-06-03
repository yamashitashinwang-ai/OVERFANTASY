import { beforeEach, describe, expect, it } from 'vitest';
import { state } from '../runtime/state.ts';
import {
  acceptSmallQuest,
  activeSmallQuestFor,
  chooseDeliveryTarget,
  handleDeliveryTalk,
  smallQuestStatus,
  updateQuestProgress
} from './quest.ts';
import { actor, resetQuestTestState } from './quest.test-fixtures.ts';

describe('small delivery quests', () => {
  beforeEach(resetQuestTestState);

  it('handles small delivery quests and auto settlement', () => {
    state.entities = [
      actor({ name: '莉娜' }),
      actor({ name: '艾梅' })
    ];

    expect(chooseDeliveryTarget('莉娜')).toBe('艾梅');
    acceptSmallQuest('莉娜', 'delivery');

    const quest = activeSmallQuestFor('莉娜');
    expect(quest).toEqual(expect.objectContaining({
      type: 'delivery',
      targetNpc: '艾梅',
      delivered: false,
      goalDone: false
    }));
    expect(smallQuestStatus(quest)).toContain('送给艾梅');

    expect(handleDeliveryTalk(actor({ name: '艾梅' }))).toBe(true);
    expect(quest?.delivered).toBe(true);
    expect(quest?.goalDone).toBe(true);

    const expectedGold = Number(quest?.reward?.gold || 0);
    state.time = Number(quest?.autoSettleAt || 0);
    updateQuestProgress(0);

    expect(state.quests.small).toHaveLength(0);
    expect(state.player.gold).toBe(expectedGold);
  });
});
