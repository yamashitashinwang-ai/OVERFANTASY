import { createDeepProbe } from './probe-deep/harness.ts';
import { runEconomyChecks } from './probe-deep/economy.ts';
import { runProgressionChecks } from './probe-deep/progression.ts';
import { runWorldAndCombatChecks } from './probe-deep/world-and-combat.ts';

const probe = await createDeepProbe();
await probe.bootstrap();
await probe.seedCommerceFixtures();
await runEconomyChecks(probe);
await runProgressionChecks(probe);
await runWorldAndCombatChecks(probe);

const failureCount = await probe.finish();
process.exit(failureCount ? 1 : 0);
