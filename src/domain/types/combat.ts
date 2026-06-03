import type { Vector2 } from './common.ts';

export interface AttackEffect {
  shape: string;
  effect: string;
  angle: number;
  duration: number;
  weaponType?: string;
  weaponName?: string;
  hit?: boolean;
  critical?: boolean;
  time?: number;
  reach?: number;
  halfAngle?: number;
  halfWidth?: number;
  centerDist?: number;
  radius?: number;
  color?: string;
  lineWidth?: number;
  handX?: number;
  handY?: number;
  zones?: AttackHitZone[];
  [key: string]: unknown;
}

export interface AttackHitZone {
  shape: 'sector' | 'line' | 'circle';
  role: 'close' | 'main';
  x: number;
  y: number;
  angle: number;
  reach?: number;
  halfAngle?: number;
  halfWidth?: number;
  radius?: number;
}

export interface BowCharge {
  time: number;
  rushed?: boolean;
}

export interface PendingMagicCast {
  spellId: string;
  timer: number;
  total: number;
  cost?: number;
  spent?: number;
}

export interface ArrowProjectile extends Vector2 {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  vx: number;
  vy: number;
  speed: number;
  angle: number;
  range: number;
  traveled: number;
  damageScale: number;
  weaponAtk: number;
}

export interface MagicEffectState extends Vector2 {
  spellId: string;
  name?: string;
  kind?: string;
  radius: number;
  color?: string;
  time: number;
  duration: number;
  tickTimer: number;
  damagePerSecond?: number;
  slowPower?: number;
}
