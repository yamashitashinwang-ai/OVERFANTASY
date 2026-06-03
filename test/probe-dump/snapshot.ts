import { join } from 'node:path';
import type { DumpProbe } from './harness.ts';

export type DumpSnapshot = {
  player: {
    hp: number;
    maxHp: number;
    pos: [number, number];
    invuln: number;
    attackCooldown: number;
    dodgeCooldown: number;
    dodgeTimer: number;
    blockTimer: number;
    stamina: number;
    monsterForm: boolean;
    _cd_invuln: unknown;
    _cd_dodgeCooldown: unknown;
  };
  scene: string;
  mode: string;
  nearest_monsters: Array<{ name: string; dist: number; cd: number }>;
};

export async function takeDumpSnapshot(probe: DumpProbe, outDir: string, label: string): Promise<DumpSnapshot> {
  const box = await probe.getCanvasBox();
  await probe.page.screenshot({ path: join(outDir, `${label}.png`), clip: box });
  return probe.page.evaluate(() => ({
    player: {
      hp: window.__state.player.hp,
      maxHp: window.__state.player.maxHp,
      pos: [window.__state.player.x, window.__state.player.y],
      invuln: window.__state.player.invuln,
      attackCooldown: window.__state.player.attackCooldown,
      dodgeCooldown: window.__state.player.dodgeCooldown,
      dodgeTimer: window.__state.player.dodgeTimer,
      blockTimer: window.__state.player.blockTimer,
      stamina: window.__state.player.stamina,
      monsterForm: window.__state.player.monsterForm,
      _cd_invuln: window.__state.player.__cd_invuln,
      _cd_dodgeCooldown: window.__state.player.__cd_dodgeCooldown
    },
    scene: window.__state.scene,
    mode: window.__state.mode,
    nearest_monsters: window.__state.entities
      .filter(e => e.alive && e.faction === 'monster')
      .map(e => ({ name: e.name, dist: Math.hypot(e.x - window.__state.player.x, e.y - window.__state.player.y), cd: e.cooldown }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5)
  }));
}
