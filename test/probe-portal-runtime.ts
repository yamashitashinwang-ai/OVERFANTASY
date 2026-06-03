import { createPortalRuntimeProbe } from './probe-portal-runtime/harness.ts';
import { runPortalRuntimeChecks } from './probe-portal-runtime/scenarios.ts';

const probe = await createPortalRuntimeProbe();

try {
  await runPortalRuntimeChecks(probe);
} finally {
  await probe.close();
}
