import type { DumpProbe } from './harness.ts';
import { takeDumpSnapshot, type DumpSnapshot } from './snapshot.ts';

export type DumpScenario = 'dodge' | 'wolves' | 'save-load' | string;

export type DumpReport = {
  scenarios: Record<string, unknown>;
};

export function resolveDumpScenarios(arg = 'all'): DumpScenario[] {
  return arg === 'all' ? ['dodge', 'wolves', 'save-load'] : [arg];
}

async function runDodgeScenario(probe: DumpProbe, outDir: string): Promise<Record<string, DumpSnapshot>> {
  console.log('▶ Scenario: dodge');
  const before = await takeDumpSnapshot(probe, outDir, 'dodge-before');
  await probe.page.keyboard.press('Space');
  await probe.page.waitForTimeout(50);
  const t50 = await takeDumpSnapshot(probe, outDir, 'dodge-50ms');
  await probe.page.waitForTimeout(500);
  const t500 = await takeDumpSnapshot(probe, outDir, 'dodge-500ms');
  await probe.page.waitForTimeout(1500);
  const t2000 = await takeDumpSnapshot(probe, outDir, 'dodge-2000ms');
  return { before, t50ms: t50, t500ms: t500, t2000ms: t2000 };
}

async function runWolvesScenario(probe: DumpProbe, outDir: string): Promise<Record<string, DumpSnapshot>> {
  console.log('▶ Scenario: wolves');
  await probe.page.evaluate(() => {
    const p = window.__state.player;
    const w = window.__state.entities
      .filter(e => e.alive && e.faction === 'monster')
      .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
    p.x = w.x;
    p.y = w.y;
    window.__api.teleportBody(p);
  });
  const before = await takeDumpSnapshot(probe, outDir, 'wolves-touched');
  await probe.page.waitForTimeout(4000);
  const after = await takeDumpSnapshot(probe, outDir, 'wolves-after-4s');
  return { before, after_4s: after };
}

async function runSaveLoadScenario(probe: DumpProbe, outDir: string): Promise<Record<string, DumpSnapshot>> {
  console.log('▶ Scenario: save-load');
  await probe.page.evaluate(() => {
    window.__state.player.hp = 11;
    window.__state.player.gold = 777;
  });
  await probe.page.keyboard.press('Escape');
  await probe.page.waitForTimeout(400);
  await probe.page.evaluate(() => document.querySelector('[data-pause-action="save"]')?.click());
  await probe.page.waitForTimeout(600);
  const before = await takeDumpSnapshot(probe, outDir, 'save-before');
  await probe.page.reload({ waitUntil: 'networkidle' });
  await probe.page.waitForTimeout(2000);
  await probe.page.evaluate(() => document.querySelector('[data-menu-action="continue"]')?.click());
  await probe.page.waitForTimeout(2000);
  const after = await takeDumpSnapshot(probe, outDir, 'save-after');
  return { before, after };
}

export async function runDumpScenarios(probe: DumpProbe, outDir: string, scenarios: DumpScenario[]): Promise<DumpReport> {
  const report: DumpReport = { scenarios: {} };

  if (scenarios.includes('dodge')) {
    report.scenarios.dodge = await runDodgeScenario(probe, outDir);
  }

  if (scenarios.includes('wolves')) {
    report.scenarios.wolves = await runWolvesScenario(probe, outDir);
  }

  if (scenarios.includes('save-load')) {
    report.scenarios.save_load = await runSaveLoadScenario(probe, outDir);
  }

  return report;
}
