import { describe, expect, it } from 'vitest';
import { questRewardText, smallQuestStatus } from './quest.ts';
import type { QuestState } from './types.ts';

describe('quest facade helpers', () => {
  it('keeps reward and status helpers available from the facade', () => {
    const hunt: QuestState = {
      name: '捕猎野兔',
      type: 'hunt',
      targetName: '野兔',
      count: 2,
      progress: 2,
      goalDone: true,
      reward: { gold: 7, affection: 3 }
    };

    expect(questRewardText({ gold: [7, 13], potions: 1, affection: 5 })).toBe('7-13G / 药水1 / 好感+5');
    expect(smallQuestStatus(hunt)).toBe('捕猎野兔：2/2，回到委托人处交付');
  });
});
