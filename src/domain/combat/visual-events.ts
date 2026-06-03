import { bus, Events } from '../../runtime/events.ts';

export type PlayerAttackVisualName =
  | 'attack'
  | 'attack_sword'
  | 'attack_dagger'
  | 'attack_spear'
  | 'attack_hammer'
  | 'attack_bow'
  | 'cast_magic';

export function publishPlayerAttackStarted(attackName: PlayerAttackVisualName = 'attack') {
  bus.emit(Events.PLAYER_ATTACK_STARTED, { attackName });
}
