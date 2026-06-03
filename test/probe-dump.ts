// One-shot diagnostic dump. Plays the game through specific scenarios and
// writes logs, invariant violations, errors, state snapshots, and screenshots to
// ./test-output/ so the user can read one folder instead of re-running probes.
//
// Usage:
//   PROBE_BASE_URL=http://server:5175/ npx tsx test/probe-dump.ts [scenario...]
//
// Scenarios: dodge | wolves | save-load | all   (default: all)

import { createDumpProbe } from './probe-dump/harness.ts';
import { ensureDumpOutputDir, printDumpSummary, writeDumpOutput } from './probe-dump/output.ts';
import { resolveDumpScenarios, runDumpScenarios } from './probe-dump/scenarios.ts';

const outDir = ensureDumpOutputDir();
const scenarios = resolveDumpScenarios(process.argv[2] || 'all');
const probe = await createDumpProbe();

try {
  await probe.bootstrap();
  await probe.focusCanvas();
  const report = await runDumpScenarios(probe, outDir, scenarios);
  await writeDumpOutput(probe, outDir, report, scenarios);
  printDumpSummary(probe, outDir);
} finally {
  await probe.close();
}
