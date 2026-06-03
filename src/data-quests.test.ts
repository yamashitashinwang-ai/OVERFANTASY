import { describe, expect, it } from 'vitest';
import DATA from './data.ts';

describe('DATA quest integrity', () => {
  it('keeps quest templates internally resolvable', () => {
    const validRewardKeys = new Set(['gold', 'potions', 'wood', 'stone', 'herbs', 'affection', 'devotion']);
    const questIds = new Set<string>();
    const quests = [...DATA.questCatalog.major, ...DATA.questCatalog.small];

    for (const quest of quests) {
      expect(quest.id.trim()).not.toBe('');
      expect(questIds.has(quest.id)).toBe(false);
      questIds.add(quest.id);
      expect(quest.name.trim()).not.toBe('');

      if (quest.species) {
        const entry = DATA.bestiary[quest.species];
        expect(entry).toBeDefined();
        if (quest.targetName) expect(entry.name).toBe(quest.targetName);
      }
      if (quest.scene) expect(DATA.sceneNames[quest.scene]).toBeDefined();
      if (quest.count != null) expect(quest.count).toBeGreaterThan(0);
      if (quest.radius != null) expect(quest.radius).toBeGreaterThan(0);
      if (quest.autoSettleDelay != null) expect(quest.autoSettleDelay).toBeGreaterThan(0);

      for (const [key, value] of Object.entries(quest.reward || {})) {
        expect(validRewardKeys.has(key)).toBe(true);
        const values = Array.isArray(value) ? value : [value];
        expect(values.every(item => Number.isFinite(item))).toBe(true);
        expect(values[0]).toBeGreaterThanOrEqual(0);
        if (Array.isArray(value)) expect(value[1]).toBeGreaterThanOrEqual(value[0]);
      }
    }
  });

  it('keeps quest templates complete for their quest type', () => {
    const validQuestTypes = new Set(['kill', 'hunt', 'delivery', 'scout']);
    const majorQuestTypes = new Set(['kill', 'scout']);
    const smallQuestTypes = new Set(['hunt', 'delivery']);
    const checkDefeatQuest = (quest: { species?: string; targetName?: string; count?: number }) => {
      const species = quest.species || '';
      expect(DATA.bestiary[species]).toBeDefined();
      expect(quest.targetName).toBe(DATA.bestiary[species]?.name);
      expect(quest.count).toBeGreaterThan(0);
    };

    for (const quest of DATA.questCatalog.major) {
      expect(validQuestTypes.has(quest.type)).toBe(true);
      expect(majorQuestTypes.has(quest.type)).toBe(true);
      if (quest.type === 'kill') {
        checkDefeatQuest(quest);
        expect(quest.autoSettleDelay).toBeGreaterThan(0);
      } else if (quest.type === 'scout') {
        expect(DATA.sceneNames[quest.scene || '']).toBeDefined();
        expect(Number.isFinite(quest.x)).toBe(true);
        expect(Number.isFinite(quest.y)).toBe(true);
        expect(quest.radius).toBeGreaterThan(0);
      }
    }

    for (const quest of DATA.questCatalog.small) {
      expect(validQuestTypes.has(quest.type)).toBe(true);
      expect(smallQuestTypes.has(quest.type)).toBe(true);
      if (quest.type === 'hunt') {
        checkDefeatQuest(quest);
        expect(quest.autoSettleDelay).toBeUndefined();
      } else if (quest.type === 'delivery') {
        expect(quest.targetNpc).toBeUndefined();
        expect(quest.autoSettleDelay).toBeGreaterThan(0);
        expect(quest.species).toBeUndefined();
        expect(quest.count).toBeUndefined();
      }
    }
  });
});
