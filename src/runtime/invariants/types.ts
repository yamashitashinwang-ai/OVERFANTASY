import type { PlayerCooldownField } from '../player-cooldowns.ts';

export type InvariantSeverity = 'error' | 'info';

export interface InvariantViolation {
  t: number;
  id: string;
  message: string;
  severity: InvariantSeverity;
}

export interface RuntimeInvariant {
  id: string;
  severity?: InvariantSeverity;
  _lastValues?: Partial<Record<PlayerCooldownField, number>>;
  _stuckFor?: Partial<Record<PlayerCooldownField, number>>;
  check(this: RuntimeInvariant, dt: number): string | null;
}
