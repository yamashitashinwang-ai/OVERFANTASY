import type { ReservedPlayerAttackAnimationName } from '../placeholder-art.ts';

export type VisualActionKind = 'interact' | 'hurt' | 'attack';

export type VisualAction = {
  kind: VisualActionKind;
  startedAt: number;
  endsAt: number;
  attackName?: ReservedPlayerAttackAnimationName | 'attack';
};

export type ActiveVisualAction = VisualAction & { progress: number };

export type MagicCastVisualStage = 'charge' | 'release';

export type MagicCastVisualAction = {
  stage: MagicCastVisualStage;
  spellId: string;
  color: number;
  startedAt: number;
  endsAt: number;
};

export interface PlayerMagicCastVisual {
  stage: MagicCastVisualStage;
  spellId: string;
  color: number;
  progress: number;
}

export type VisualAdjust = {
  offsetX: number;
  offsetY: number;
  scale: number;
  tint: number | null;
};
