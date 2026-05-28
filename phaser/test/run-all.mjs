// Runs every E2E probe in sequence. Expects `npm run dev` to be running.
//
// Usage:
//   npm run dev -- --port 5174 &
//   npm test

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

const probes = [
  ['probe-comprehensive.mjs',     '21 panels/persistence/i18n checks'],
  ['probe-e2e.mjs',               '14 gameplay integration checks'],
  ['probe-deep.mjs',              '16 domain API checks'],
  ['probe-ui-flows.mjs',          '15 button-click UI flow checks'],
  ['probe-combat-checklist.mjs',  '24 combat/AI/damage/quest/magic checks'],
  ['probe-live-combat.mjs',       '4 live-play enemy-damage checks'],
  ['probe-weapons.mjs',           '5 weapon-coverage checks (every type)'],
  ['probe-invariants.mjs',        '~12s runtime invariant guard'],
  ['probe-dodge-invuln-bug.mjs',  'regression: dodge invuln must expire'],
  ['probe-playthrough.mjs',       '25s random play stress test']
];

let totalPass = 0;
let totalFail = 0;
const failedSuites = [];

for (const [file, desc] of probes) {
  process.stdout.write(`\n▸ ${file} — ${desc}\n`);
  const r = spawnSync('node', [join(here, file)], { stdio: 'pipe', encoding: 'utf-8' });
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
