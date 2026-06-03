import { state } from '../../runtime/state.ts';
import type { ActorState } from '../types.ts';
import { STRONG_MONSTER_SPECIES } from './constants.ts';

export function isMonsterSource(source: ActorState | null | undefined): boolean {
  return !!source && (source.faction === 'monster' || source.kind === 'monster');
}

export function isDemonCastleSource(source: ActorState | null | undefined): boolean {
  return isMonsterSource(source) && (source.region === 'demon' || source.species === 'demonKnight' || state.scene === 'demon');
}

export function isStrongMonsterSource(source: ActorState | null | undefined): boolean {
  return isDemonCastleSource(source) || (isMonsterSource(source) && STRONG_MONSTER_SPECIES.has(String(source.species || '')));
}
