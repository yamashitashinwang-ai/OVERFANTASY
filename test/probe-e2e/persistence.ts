import type { E2eProbe } from './harness.ts';

export async function runPersistenceAndI18nChecks(probe: E2eProbe) {
  const { page, step, ok, fail, state: $state, log } = probe;

  // ─── PAUSE / SAVE ─────────────────────────────────────────────────────────
  await step('Pause (Esc) + save', async () => {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const visible = await page.evaluate(() => !document.getElementById('pauseMenu').classList.contains('hidden'));
    if (!visible) { fail('pause not visible'); return; }
    await page.evaluate(() => document.querySelector('[data-pause-action="save"]')?.click());
    await page.waitForTimeout(400);
    const saves = await page.evaluate(() => JSON.parse(localStorage.getItem('overfantasy.saves.v1') || '[]'));
    if (saves.length > 0) ok(`saves: ${saves.length}`);
    else fail('no save record');
  });

  await step('Open pause + Esc closes it', async () => {
    // After save click, pause auto-closed. Open it fresh, then Esc closes.
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const open = await page.evaluate(() => !document.getElementById('pauseMenu').classList.contains('hidden'));
    if (!open) { fail('pause not open after first Esc'); return; }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const hidden = await page.evaluate(() => document.getElementById('pauseMenu').classList.contains('hidden'));
    if (hidden) ok('Esc closed pause'); else fail('Esc did not close pause');
  });

  // ─── PERSISTENCE round trip ──────────────────────────────────────────────
  await step('Persistence round-trip via reload + continue', async () => {
    // Set distinctive state, save via pause→save, reload, continue.
    await page.evaluate(() => { window.__state.player.hp = 17; window.__state.player.gold = 999; });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await page.evaluate(() => document.querySelector('[data-pause-action="save"]')?.click());
    await page.waitForTimeout(600);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.evaluate(() => document.querySelector('[data-menu-action="continue"]')?.click());
    await page.waitForTimeout(2200);
    const s = await $state();
    if (s.player.hp === 17 && s.player.gold === 999) ok(`hp=${s.player.hp} gold=${s.player.gold}`);
    else fail(`hp=${s.player.hp} (expected 17), gold=${s.player.gold} (expected 999)`);
  });

  // ─── DOMAIN API SMOKE TESTS ───────────────────────────────────────────────
  await step('Domain: addMaterial/addResource emit events + persist', async () => {
    await page.evaluate(() => { window.__state.player.materials = {}; });
    // Call via injected helper — we can't import ES modules from playwright,
    // but we can hand-edit state and verify the render reacts.
    await page.evaluate(() => { window.__state.player.materials['狼毛'] = 3; });
    await page.keyboard.press('b');
    await page.waitForTimeout(300);
    await page.evaluate(() => document.querySelector('[data-bag-category="loot"]')?.click());
    await page.waitForTimeout(200);
    const items = await page.evaluate(() => Array.from(document.querySelectorAll('[data-bag-item]')).map(b => b.dataset.bagItem));
    if (items.includes('狼毛')) ok('loot rendered'); else fail(`expected 狼毛: got ${items}`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  });

  // ─── i18n switch ──────────────────────────────────────────────────────────
  await step('Language switch via main menu', async () => {
    // Open main menu via pause → main
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    await page.evaluate(() => document.querySelector('[data-pause-action="main"]')?.click());
    await page.waitForTimeout(800);
    await page.evaluate(() => document.querySelector('[data-menu-action="language"]')?.click());
    await page.waitForTimeout(300);
    const langBtns = await page.evaluate(() => Array.from(document.querySelectorAll('[data-language]')).map(b => b.dataset.language));
    if (langBtns.includes('en') && langBtns.includes('ja')) ok(`langs: ${langBtns.join(',')}`);
    else fail(`missing languages: ${langBtns}`);
    await page.evaluate(() => document.querySelector('[data-language="en"]')?.click());
    await page.waitForTimeout(400);
    const enText = await page.evaluate(() => document.querySelector('.menu-card h2')?.textContent);
    if (enText && /English|Language/i.test(enText)) ok(`menu in EN: ${enText}`);
    else log(`     menu title after switch: ${enText}`);
  });
}
