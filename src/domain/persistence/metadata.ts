import DATA from '../../data.ts';
import { state } from '../../runtime/state.ts';
import { currentLanguage } from '../i18n.ts';
import type { GameState } from '../types.ts';
import type { SaveMeta } from './types.ts';

const { sceneNames } = DATA;

export function saveMeta(snapshot: GameState): SaveMeta {
  const p = snapshot.player || state.player;
  return {
    scene: snapshot.mode === 'dungeon' ? '排列迷宫' : (sceneNames[snapshot.scene] || snapshot.scene || '未知'),
    hp: `${Math.max(0, Math.floor(p.hp))}/${p.maxHp}`,
    gold: p.gold || 0,
    time: Number(snapshot.time || 0)
  };
}

export function formatGameTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  if (currentLanguage() === 'ja') return `${min}分${String(sec).padStart(2, '0')}秒`;
  if (currentLanguage() === 'en') return `${min}m ${String(sec).padStart(2, '0')}s`;
  return `${min}分${String(sec).padStart(2, '0')}秒`;
}

export function formatSaveTime(value: string | number | Date): string {
  const locale = currentLanguage() === 'ja' ? 'ja-JP'
              : currentLanguage() === 'en' ? 'en-US'
              : 'zh-CN';
  return new Date(value).toLocaleString(locale, { hour12: false });
}
