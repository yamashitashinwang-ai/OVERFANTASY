export type SceneKey = string;
export type ResourceBag = Record<string, number>;
export type FlagBag = Record<string, boolean>;
export type Direction8 = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

export interface Vector2 {
  x: number;
  y: number;
}

export interface OwnedRecord {
  id?: string;
  ownerId?: string;
  partyId?: string;
}
