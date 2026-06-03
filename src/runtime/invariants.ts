// Runtime invariant checker compatibility facade. Types, memory, violation
// recording, and concrete invariant checks live under `runtime/invariants/`.

import { INVARIANTS } from './invariants/checks.ts';
import { recordViolation } from './invariants/recorder.ts';
export { getViolations, clearViolations } from './invariants/memory.ts';
export type { InvariantSeverity, InvariantViolation, RuntimeInvariant } from './invariants/types.ts';

export function tickInvariants(dt: number) {
  for (const inv of INVARIANTS) {
    try {
      const message = inv.check(dt);
      if (message) recordViolation(inv.id, message, inv.severity);
    } catch (e) {
      recordViolation(`${inv.id}-threw`, e instanceof Error ? e.message : String(e));
    }
  }
}
