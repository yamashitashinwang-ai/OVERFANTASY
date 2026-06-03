import type Phaser from 'phaser';
import { runtime, state } from '../../runtime/state.ts';

export function installGameSceneDevtools(scene: Phaser.Scene) {
  if (!import.meta.env.DEV || typeof window === 'undefined') return;

  window.__state = state;
  window.__runtime = runtime;
  window.__game = scene;

  Promise.all([
    import('../../runtime/log.ts')
  ]).then(([logMod]) => {
    window.__dumpLogs = logMod.dumpLogs;
    window.__clearLogs = logMod.clearLogs;
    window.__setLogPattern = logMod.setLogPattern;
    logMod.enableDefaultPattern();
  });

  Promise.all([
    import('../../domain/inventory.ts'),
    import('../../domain/economy.ts'),
    import('../../domain/quest.ts'),
    import('../../domain/magic.ts'),
    import('../../domain/npc.ts'),
    import('../../domain/dungeon.ts'),
    import('../../domain/combat/actions.ts'),
    import('../../domain/combat/damage.ts'),
    import('../../domain/combat/bow.ts'),
    import('../../domain/combat/weapon.ts'),
    import('../../domain/combat/targeting.ts'),
    import('../../domain/player.ts'),
    import('../../domain/corruption.ts'),
    import('../../domain/world.ts'),
    import('../../domain/world-spawn.ts'),
    import('../../domain/ai.ts'),
    import('../../runtime/state.ts'),
    import('../game-scene-helpers.ts'),
    import('../../display/index.ts'),
    import('../../ui/backpack.ts'),
    import('../../ui/quest.ts'),
    import('../../ui/shop.ts'),
    import('../../ui/forge.ts'),
    import('../../ui/magic.ts')
  ]).then((mods) => { window.__api = Object.assign({}, ...mods); });
}
