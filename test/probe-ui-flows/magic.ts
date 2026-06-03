import type { UiFlowProbe } from './harness.ts';

export async function runMagicPanelFlows(probe: UiFlowProbe) {
  const { page, step, ok, fail } = probe;

  // ─── Magic panel cast spell via UI ────────────────────────────────────────
  await step('Magic panel: learn + cast via UI buttons', async () => {
    // Pre-learn for this test
    await page.evaluate(() => {
      window.__state.player.magicKnown = ['littleCold'];
      window.__state.player.mp = 50;
    });
    await page.keyboard.press('f');
    await page.waitForTimeout(400);
    const castBtns = await page.evaluate(() => Array.from(document.querySelectorAll('[data-magic-action="cast"]')).map(b => ({ spell: b.dataset.spell, disabled: b.disabled })));
    if (!castBtns.length) { fail('no cast buttons'); return; }
    ok(`cast buttons: ${JSON.stringify(castBtns).slice(0, 80)}`);

    const canvas = await page.$('#game-container canvas');
    const box = await canvas?.boundingBox();
    if (!box) {
      fail('missing game canvas box');
      return;
    }
    await page.mouse.move(box.x + 24, box.y + box.height - 24);
    await page.mouse.down();
    await page.waitForTimeout(80);
    const pointerState = await page.evaluate(() => {
      const gamePointer = window.__game.input.activePointer;
      const magicScene = window.__game.scene.get('MagicScene');
      const magicPointer = magicScene?.input?.activePointer;
      return {
        gameButtons: gamePointer.buttons,
        gameIsDown: gamePointer.isDown,
        magicButtons: magicPointer?.buttons ?? 0,
        magicIsDown: magicPointer?.isDown ?? false,
        bowCharge: !!window.__runtime.bowCharge,
        attackEffect: !!window.__runtime.attackEffect,
        magicOpen: document.getElementById('magicPanel')?.classList.contains('hidden') === false
      };
    });
    await page.mouse.up();
    if (pointerState.magicOpen && pointerState.gameButtons === 0 && !pointerState.gameIsDown && pointerState.magicButtons === 0 && !pointerState.magicIsDown && !pointerState.bowCharge && !pointerState.attackEffect) {
      ok('canvas pointer swallowed while magic panel is open');
    } else {
      fail(`canvas pointer leaked into game: ${JSON.stringify(pointerState)}`);
    }

    // Click the first cast button with real pointer events. This guards the
    // canvas-to-DOM handoff path: UI pointerdown/up must clear stale game canvas
    // pointer state before the spell begins.
    const spell = castBtns[0].spell;
    await page.click(`[data-magic-action="cast"][data-spell="${spell}"]`);
    await page.waitForTimeout(300);
    const castState = await page.evaluate(() => {
      const gamePointer = window.__game.input.activePointer;
      return {
        pending: window.__runtime.pendingMagicCast,
        gameButtons: gamePointer.buttons,
        gameIsDown: gamePointer.isDown,
        bowCharge: !!window.__runtime.bowCharge
      };
    });
    if (castState.pending && castState.gameButtons === 0 && !castState.gameIsDown && !castState.bowCharge) {
      ok(`pending: ${castState.pending.spellId}, game pointer cleared`);
    } else {
      fail(`cast click leaked canvas pointer state: ${JSON.stringify(castState)}`);
    }
  });

  await step('Close magic panel via close button', async () => {
    await page.evaluate(() => document.querySelector('[data-magic-action="close"]')?.click());
    await page.waitForTimeout(500);
    const hidden = await page.evaluate(() => document.getElementById('magicPanel').classList.contains('hidden'));
    if (hidden) ok('hidden'); else fail('still visible');
  });
}
