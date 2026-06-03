import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DumpProbe } from './harness.ts';
import type { DumpReport, DumpScenario } from './scenarios.ts';

export function ensureDumpOutputDir(): string {
  const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'test-output');
  mkdirSync(outDir, { recursive: true });
  return outDir;
}

export async function writeDumpOutput(probe: DumpProbe, outDir: string, report: DumpReport, scenarios: DumpScenario[]): Promise<void> {
  const ingameLog = await probe.page.evaluate(() => window.__dumpLogs?.(400) || '');

  writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  writeFileSync(join(outDir, 'browser-console.log'), probe.consoleLog.map(c => `[${c.type}] ${c.text}`).join('\n'));
  writeFileSync(join(outDir, 'errors.log'), probe.errors.map(e => e.msg).join('\n\n'));
  writeFileSync(join(outDir, 'invariants.log'), probe.invariantBreaks.map(v => v.msg).join('\n'));
  writeFileSync(join(outDir, 'ingame-debug.log'), ingameLog);

  const summary = [
    '# Probe dump',
    '',
    `scenarios: ${scenarios.join(', ')}`,
    `console errors: ${probe.errors.length}`,
    `invariant violations: ${probe.invariantBreaks.length}`,
    '',
    '## Files',
    '- report.json - per-scenario state snapshots (HP, cooldowns, positions, etc.)',
    '- browser-console.log - every browser console message',
    '- errors.log - only the errors / pageerrors',
    '- invariants.log - only [invariant] warnings',
    '- ingame-debug.log - the structured-log timeline (Markdown-friendly)',
    '- *.png - per-scenario screenshots'
  ];
  writeFileSync(join(outDir, 'README.md'), summary.join('\n'));
}

export function printDumpSummary(probe: DumpProbe, outDir: string): void {
  console.log(`\nDump written to ${outDir}`);
  console.log(`Console errors: ${probe.errors.length} | Invariant breaks: ${probe.invariantBreaks.length}`);
}
