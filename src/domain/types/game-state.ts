import type { SceneKey } from './common.ts';
import type { ActorState, PetRemainState, PetState, PlayerState } from './actors.ts';
import type { DeathRecordState, DeathRespawnState } from './death.ts';
import type { QuestStateBag, NpcMemoryState } from './quests.ts';
import type { SessionState } from './session.ts';
import type { LostPackageState, PickupState, WorldObjectState } from './world.ts';

export interface GameState {
  schemaVersion: number;
  session: SessionState;
  settings: { language: string };
  mode: 'world' | 'dungeon' | string;
  scene: SceneKey;
  time: number;
  dayClock: number;
  newsClock: number;
  spawnClock: number;
  toastTimer: number;
  shrineLoads: Record<string, number>;
  shrineLoadDecayClock: number;
  lostPackages: LostPackageState[];
  lastDeath: DeathRecordState | null;
  pendingDeathRespawn: DeathRespawnState | null;
  player: PlayerState;
  map: string[][];
  solids: WorldObjectState[];
  entities: ActorState[];
  pets: PetState[];
  petRemains: PetRemainState[];
  quests: QuestStateBag;
  npcMemory: Record<string, NpcMemoryState>;
  npcMemoryByPlayer: Record<string, Record<string, NpcMemoryState>>;
  objects: WorldObjectState[];
  pickups: PickupState[];
  dungeon: { w: number; h: number } | null;
}
