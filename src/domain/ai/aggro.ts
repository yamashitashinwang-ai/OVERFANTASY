import { petById } from '../combat/damage.ts';
import type { PetState } from '../types.ts';

export function strongestPetAggro(e: { petAggro?: Record<string, number> }): { pet: PetState | null; value: number } {
  let best: PetState | null = null;
  let bestValue = 0;
  for (const [petId, value] of Object.entries(e.petAggro || {})) {
    const pet = petById(petId);
    if (pet && value > bestValue) {
      best = pet;
      bestValue = value;
    }
  }
  return { pet: best, value: bestValue };
}
