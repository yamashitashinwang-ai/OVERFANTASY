import { chromium } from 'playwright';
import { probeBaseUrl } from '../probe-url.ts';
import { createCanvasHelpers } from './canvas.ts';
import { createE2eReporter } from './reporter.ts';
import { readE2eState } from './state-snapshot.ts';
import type { E2eProbe } from './types.ts';

export type { CanvasBox, E2eProbe, E2eProbeState } from './types.ts';

export async function createE2eProbe(): Promise<E2eProbe> {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors: string[] = [];
  const failures: string[] = [];

  page.on('pageerror', e => errors.push(`PAGE: ${e.message.slice(0, 240)}`));
  page.on('console', m => {
    if (m.type() === 'error') errors.push(`CON: ${m.text().slice(0, 240)}`);
  });

  const { log, ok, fail, step } = createE2eReporter(errors, failures);
  const { getCanvasBox, focusCanvas } = createCanvasHelpers(page);

  const bootstrap = async () => {
    await page.goto(probeBaseUrl(), { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
  };

  const finish = async () => {
    log(`\n=== ${failures.length === 0 ? 'PASS' : 'FAIL'}: ${failures.length} failures ===`);
    failures.forEach(f => log(' -', f));
    await browser.close();
    return failures.length;
  };

  return {
    page,
    browser,
    errors,
    failures,
    log,
    ok,
    fail,
    step,
    state: () => readE2eState(page),
    bootstrap,
    getCanvasBox,
    focusCanvas,
    finish
  };
}
