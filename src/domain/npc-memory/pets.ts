import { state } from '../../runtime/state.ts';
import { ownedByCurrentPlayer } from '../session.ts';

export function petsForCurrentPlayer() {
  return state.pets.filter(pet => ownedByCurrentPlayer(pet));
}
