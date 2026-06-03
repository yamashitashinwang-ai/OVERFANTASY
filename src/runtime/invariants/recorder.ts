import { bus, Events } from '../events.ts';
import { log, NS } from '../log.ts';
import { pushViolation } from './memory.ts';
import type { InvariantSeverity, InvariantViolation } from './types.ts';

export function recordViolation(id: string, message: string, severity: InvariantSeverity = 'error') {
  const violation: InvariantViolation = { t: Date.now(), id, message, severity };
  pushViolation(violation);
  bus.emit(Events.INVARIANT_BROKEN, violation);
  // Two console prefixes:
  //   [invariant] — something is broken; CI probes should fail
  //   [game-info] — by-design behaviour with non-obvious cause.
  const prefix = severity === 'info' ? '[game-info]' : '[invariant]';
  console.warn(`${prefix} ${id}: ${message}`);
  log(severity === 'info' ? NS.INVARIANT_INFO : NS.INVARIANT_BROKEN, '%s: %s', id, message);
}
