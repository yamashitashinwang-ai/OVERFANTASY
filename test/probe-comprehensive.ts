// Comprehensive functional probe. Verifies major user-facing systems end-to-end:
// boot, race choice, panel opening, combat inputs, movement, pause/resume,
// reactive stats, and persistence round-trip.
//
// Usage: run dev server, then `PROBE_BASE_URL=http://server:5175/ npx tsx test/probe-comprehensive.ts`

import { createComprehensiveProbe } from './probe-comprehensive/harness.ts';
import { runComprehensivePhases } from './probe-comprehensive/phases.ts';

const probe = await createComprehensiveProbe();

try {
  await runComprehensivePhases(probe);
  process.exit(await probe.finish());
} catch (error) {
  probe.tally(probe.expect(error instanceof Error ? error.message : String(error), false));
  process.exit(await probe.finish());
}
