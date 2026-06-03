import { chromium, type Browser, type Page } from 'playwright';
import { probeBaseUrl } from '../probe-url.ts';

export type UiFlowProbe = {
  page: Page;
  browser: Browser;
  errors: string[];
  failures: string[];
  ok(message: string): void;
  fail(message: string): void;
  step(label: string, fn: () => Promise<void>): Promise<void>;
  bootstrap(): Promise<void>;
  preparePanelFixtures(): Promise<void>;
  finish(): Promise<number>;
};

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function createUiFlowProbe(): Promise<UiFlowProbe> {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors: string[] = [];
  const failures: string[] = [];

  page.on('pageerror', e => errors.push(`PAGE: ${e.message.slice(0, 240)}`));
  page.on('console', m => {
    if (m.type() === 'error') errors.push(`CON: ${m.text().slice(0, 240)}`);
  });

  const fail = (message: string) => {
    console.log('  ✗', message);
    failures.push(message);
  };
  const ok = (message: string) => console.log('  ✓', message);

  const step = async (label: string, fn: () => Promise<void>) => {
    errors.length = 0;
    console.log('\n▶', label);
    try {
      await fn();
    } catch (error) {
      fail(`${label} threw: ${toMessage(error).slice(0, 200)}`);
    }
    if (errors.length) {
      fail(`${label}: ${errors.length} errors`);
      errors.slice(0, 2).forEach(e => console.log('     →', e));
    }
  };

  const bootstrap = async () => {
    await page.goto(probeBaseUrl(), { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.evaluate(() => document.querySelector('[data-menu-action="new"]')?.click());
    await page.waitForTimeout(300);
    await page.evaluate(() => document.querySelector('[data-menu-action="startRace"][data-race="人类"]')?.click());
    await page.waitForTimeout(2000);
    for (let i = 0; i < 30; i++) {
      if (await page.evaluate(() => !!window.__api)) break;
      await page.waitForTimeout(100);
    }
  };

  const preparePanelFixtures = async () => {
    await page.evaluate(() => {
      const p = window.__state.player;
      window.__api.addObject('shop', '测试商店', Math.floor(p.x), Math.floor(p.y), 2, 2, '#8fa0b2', 'shop');
      window.__api.addObject('forge', '测试锻造台', Math.floor(p.x) + 2, Math.floor(p.y), 2, 2, '#cc9966', 'forge');
      window.__state.player.gold = 200;
      window.__state.player.materials = { '魔狼牙': 5, '柔软毛皮': 3 };
      window.__api.addResource('木材', 10);
      window.__api.addResource('反重力石', 10);
    });
  };

  const finish = async () => {
    console.log(`\n=== ${failures.length === 0 ? 'PASS' : 'FAIL'}: ${failures.length} failures ===`);
    failures.forEach(f => console.log(' -', f));
    await browser.close();
    return failures.length;
  };

  return { page, browser, errors, failures, ok, fail, step, bootstrap, preparePanelFixtures, finish };
}
