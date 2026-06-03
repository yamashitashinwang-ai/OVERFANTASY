import { beforeEach, describe, expect, it } from 'vitest';
import { state } from '../runtime/state.ts';
import { formatGameTime } from './persistence.ts';
import { resetPersistenceTestState } from './persistence.test-fixtures.ts';

describe('persistence time formatting', () => {
  beforeEach(resetPersistenceTestState);

  it('formats game time according to the current language', () => {
    expect(formatGameTime(125)).toBe('2分05秒');

    state.settings.language = 'en';
    expect(formatGameTime(125)).toBe('2m 05s');

    state.settings.language = 'ja';
    expect(formatGameTime(125)).toBe('2分05秒');
  });
});
