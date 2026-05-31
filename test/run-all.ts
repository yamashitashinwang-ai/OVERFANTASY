// Runs every E2E probe in sequence. Expects `npm run dev` to be running.
//
// Usage:
//   npm run dev -- --port 5175 --host 0.0.0.0 &
//   PROBE_BASE_URL=http://server:5175/ npm test

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

const probes = [
  ['probe-comprehensive.ts',     '21 panels/persistence/i18n checks'],
  ['probe-e2e.ts',               '14 gameplay integration checks'],
  ['probe-deep.ts',              '16 domain API checks'],
  ['probe-ui-flows.ts',          '15 button-click UI flow checks'],
  ['probe-combat-checklist.ts',  '24 combat/AI/damage/quest/magic checks'],
  ['probe-portal-runtime.ts',    'runtime portal interaction path checks'],
  ['probe-live-combat.ts',       '4 live-play enemy-damage checks'],
  ['probe-weapons.ts',           '5 weapon-coverage checks (every type)'],
  ['probe-invariants.ts',        '~12s runtime invariant guard'],
  ['probe-dodge-invuln-bug.ts',  'regression: dodge invuln must expire'],
  ['probe-playthrough.ts',       '25s random play stress test']
];

let totalPass = 0;
let totalFail = 0;
const failedSuites = [];

for (const [file, desc] of probes) {
  process.stdout.write(`\n▸ ${file} — ${desc}\n`);
  const r = spawnSync('tsx', [join(here, file)], { stdio: 'pipe', encoding: 'utf-8' });
  const out = r.stdout || '';
  const last = out.split('\n').slice(-6).join('\n');
  process.stdout.write(last + '\n');
  // Count from output
  const passMatch = out.match(/(\d+) pass(?:, (\d+) fail)?/);
  const failsMatch = out.match(/FAIL: (\d+) failures/);
  if (passMatch) { totalPass += +passMatch[1]; if (passMatch[2]) totalFail += +passMatch[2]; }
  if (failsMatch) totalFail += +failsMatch[1];
  if (r.status !== 0) failedSuites.push(file);
}

console.log(`\n${'═'.repeat(50)}`);
console.log(`Total: ${totalPass} pass, ${totalFail} fail across ${probes.length} suites`);
if (failedSuites.length) {
  console.log(`Failed suites: ${failedSuites.join(', ')}`);
  process.exit(1);
}
console.log('All probes pass.');
