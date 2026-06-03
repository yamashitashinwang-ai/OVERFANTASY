export type WeaponProbeCase = {
  id: string;
  type: string;
  expectAttack?: boolean;
  expectCharge?: boolean;
  needsArrows?: boolean;
};

// Starting gear IDs that the game ships with one per weapon type
// (cross-referenced against the static gear catalog).
export const WEAPONS: WeaponProbeCase[] = [
  { id: 'trainingSword',  type: '剑',  expectAttack: true },
  { id: 'ironSword',      type: '剑',  expectAttack: true },
  { id: 'shortBow',       type: '弓',  expectCharge: true, needsArrows: true }
];
