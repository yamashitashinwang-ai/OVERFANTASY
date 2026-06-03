// Comprehensive end-to-end probe. Drives every gameplay system from the
// original game.js through the Phaser version and verifies state mutations.
import { runBackpackChecks } from './probe-e2e/backpack.ts';
import { runBootAndNewGameChecks } from './probe-e2e/boot.ts';
import { runGameplayChecks } from './probe-e2e/gameplay.ts';
import { createE2eProbe } from './probe-e2e/harness.ts';
import { runPanelChecks } from './probe-e2e/panels.ts';
import { runPersistenceAndI18nChecks } from './probe-e2e/persistence.ts';

const probe = await createE2eProbe();

try {
  await probe.bootstrap();
  await runBootAndNewGameChecks(probe);
  await probe.focusCanvas();
  await runGameplayChecks(probe);
  await runBackpackChecks(probe);
  await runPanelChecks(probe);
  await runPersistenceAndI18nChecks(probe);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  probe.fail(`probe runner threw: ${message.slice(0, 200)}`);
}

const failures = await probe.finish();
process.exit(failures ? 1 : 0);
