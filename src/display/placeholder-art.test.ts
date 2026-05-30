import { describe, expect, it } from 'vitest';
import {
  playerTextureKey,
  reservedPlayerAttackAnimationNames
} from './placeholder-art.ts';

describe('placeholder player animation keys', () => {
  it('keeps idle, walk, and run states distinct', () => {
    expect(playerTextureKey('s', 'idle')).toBe('of:player:human:s:idle');
    expect(playerTextureKey('s', 'walk0')).toBe('of:player:human:s:walk0');
    expect(playerTextureKey('s', 'walk1')).toBe('of:player:human:s:walk1');
    expect(playerTextureKey('s', 'run0')).toBe('of:player:human:s:run0');
    expect(playerTextureKey('s', 'run1')).toBe('of:player:human:s:run1');
  });

  it('keeps interaction, hurt, and generic attack placeholder states available', () => {
    expect(playerTextureKey('e', 'interact')).toBe('of:player:human:e:interact');
    expect(playerTextureKey('w', 'hurt', true)).toBe('of:player:monster:w:hurt');
    expect(playerTextureKey('n', 'attack')).toBe('of:player:human:n:attack');
  });

  it('reserves named attack animation hooks for later weapon-specific art', () => {
    expect(reservedPlayerAttackAnimationNames).toEqual([
      'attack_sword',
      'attack_dagger',
      'attack_spear',
      'attack_hammer',
      'attack_bow',
      'cast_magic'
    ]);
  });
});
