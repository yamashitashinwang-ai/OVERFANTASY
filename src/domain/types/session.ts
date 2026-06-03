export interface SessionPlayerState {
  id: string;
  name: string;
  partyId: string;
  control: string;
  connected: boolean;
}

export interface SessionState {
  schemaVersion: number;
  playMode: string;
  localPlayerId: string;
  hostPlayerId: string;
  partyId: string;
  players: Record<string, SessionPlayerState>;
}
