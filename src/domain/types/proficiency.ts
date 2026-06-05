export type ProficiencyId =
  | 'sword'
  | 'dagger'
  | 'spear'
  | 'hammer'
  | 'bow'
  | 'magic'
  | 'forging'
  | 'gathering'
  | 'survival';

export interface ProficiencyProgress {
  level: number;
  exp: number;
  totalExp: number;
  firstReachedAt: number;
}

export type ProficiencyTable = Record<ProficiencyId, ProficiencyProgress>;

export interface ProficiencyClaimTable {
  hits: Partial<Record<ProficiencyId, string[]>>;
  defeats: Partial<Record<ProficiencyId, string[]>>;
}

export type CareerSubclassId = string;

export interface CareerState {
  firstClass: ProficiencyId | null;
  firstClassConfirmed: boolean;
  subclass: CareerSubclassId | null;
  subclassConfirmed: boolean;
}

export interface ProficiencyState {
  records: ProficiencyTable;
  classTendency: ProficiencyId;
  nextOrder: number;
  claims: ProficiencyClaimTable;
  survivalAwardedAt: number | null;
  career: CareerState;
}
