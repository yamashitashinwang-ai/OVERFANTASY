import type { ActorState } from '../../types.ts';

export type EntityFilter = (entity: ActorState) => boolean;

export interface WeaponShapeSpec {
  name: string;
  type?: string;
  range?: number;
}
