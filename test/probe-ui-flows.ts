// UI-flow probe — drives the actual button clicks in each panel as a real
// user would, validating the click-handler → domain → render path end-to-end.
import { runBackpackFlows } from './probe-ui-flows/backpack.ts';
import { runForgePanelFlows } from './probe-ui-flows/forge.ts';
import { createUiFlowProbe } from './probe-ui-flows/harness.ts';
import { runMagicPanelFlows } from './probe-ui-flows/magic.ts';
import { runQuestPanelFlows } from './probe-ui-flows/quest.ts';
import { runShopPanelFlows } from './probe-ui-flows/shop.ts';

const probe = await createUiFlowProbe();

try {
  await probe.bootstrap();
  await probe.preparePanelFixtures();

  await runForgePanelFlows(probe);
  await runShopPanelFlows(probe);
  await runBackpackFlows(probe);
  await runMagicPanelFlows(probe);
  await runQuestPanelFlows(probe);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  probe.fail(`probe runner threw: ${message.slice(0, 200)}`);
}

const failures = await probe.finish();
process.exit(failures ? 1 : 0);
