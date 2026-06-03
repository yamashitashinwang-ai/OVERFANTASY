import { afterEach, describe, expect, it } from 'vitest';
import {
  clearLogs,
  dumpLogs,
  enableDefaultPattern,
  log,
  NAMESPACES,
  NS,
  setLogPattern
} from './log.ts';

describe('runtime log facade', () => {
  afterEach(() => {
    clearLogs();
    localStorage.clear();
    setLogPattern(null);
  });

  it('keeps NS as a terse alias for the canonical namespace tree', () => {
    expect(NS).toBe(NAMESPACES);
    expect(NS.COMBAT_PLAYER_ATTACK).toBe('overfantasy:combat:player-attack:event');
    expect(NS.INVARIANT_BROKEN).toBe('overfantasy:invariant:broken:warn');
  });

  it('buffers log calls even when debug namespaces are disabled', () => {
    log(NS.COMBAT_PLAYER_ATTACK, 'attack %s', 'trainingSword', { stamina: 12 });

    const dump = dumpLogs();

    expect(dump).toContain('[overfantasy:combat:player-attack:event] attack %s trainingSword {"stamina":12}');
  });

  it('limits dumps to the most recent entries', () => {
    log(NS.INPUT_KEY, 'first');
    log(NS.INPUT_KEY, 'second');

    const dump = dumpLogs(1);

    expect(dump).toContain('second');
    expect(dump).not.toContain('first');
  });

  it('clears the in-memory ring buffer through the facade', () => {
    log(NS.GAME_LIFECYCLE, 'new game');

    clearLogs();

    expect(dumpLogs()).toBe('');
  });

  it('sets, clears, and preserves debug patterns through localStorage', () => {
    setLogPattern('overfantasy:combat:*');
    expect(localStorage.getItem('debug')).toBe('overfantasy:combat:*');

    setLogPattern(null);
    expect(localStorage.getItem('debug')).toBeNull();

    enableDefaultPattern();
    expect(localStorage.getItem('debug')).toBe('overfantasy:*:event,overfantasy:*:warn,overfantasy:*:error');

    setLogPattern('custom:*');
    enableDefaultPattern();
    expect(localStorage.getItem('debug')).toBe('custom:*');
  });
});
