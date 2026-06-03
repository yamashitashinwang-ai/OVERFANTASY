import type { UiFlowProbe } from './harness.ts';

export async function runQuestPanelFlows(probe: UiFlowProbe) {
  const { page, step, ok, fail } = probe;

  // ─── Quest panel: accept + settle via UI ──────────────────────────────────
  await step('Quest panel: accept major quest via UI', async () => {
    // Open guild quest panel (need to call openGuildPanel manually since no NPC available)
    await page.evaluate(() => window.__state.quests = { major: null, small: [] });
    await page.evaluate(() => window.__api.openGuildPanel?.());
    await page.waitForTimeout(400);
    const visible = await page.evaluate(() => !document.getElementById('questPanel').classList.contains('hidden'));
    if (!visible) { fail('quest panel not visible'); return; }
    const acceptBtns = await page.evaluate(() => Array.from(document.querySelectorAll('[data-quest-action="acceptMajor"]')).map(b => b.dataset.questId));
    if (acceptBtns.length === 0) { fail('no accept major buttons'); return; }
    await page.evaluate((id) => document.querySelector(`[data-quest-action="acceptMajor"][data-quest-id="${id}"]`)?.click(), acceptBtns[0]);
    await page.waitForTimeout(300);
    const major = await page.evaluate(() => window.__state.quests.major);
    if (major && major.id === acceptBtns[0]) ok(`accepted: ${major.name}`);
    else fail(`expected ${acceptBtns[0]}, got ${JSON.stringify(major)?.slice(0, 100)}`);
  });

  await step('Close quest panel via UI', async () => {
    await page.evaluate(() => document.querySelector('[data-quest-action="close"]')?.click());
    await page.waitForTimeout(500);
    const hidden = await page.evaluate(() => document.getElementById('questPanel').classList.contains('hidden'));
    if (hidden) ok('hidden'); else fail('still visible');
  });
}
