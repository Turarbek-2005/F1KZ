export interface Prediction {
  raceId: string;
  round: string | number;
  raceName: string;
  p1: string;
  p2: string;
  p3: string;
  score?: number;
  actual?: { p1: string; p2: string; p3: string };
}

export interface SavePredictionPayload {
  p1: string;
  p2: string;
  p3: string;
}

export interface LeaderboardRow {
  userId: number;
  username: string;
  avatarUrl?: string | null;
  points: number;
  scored: number;
}

export interface PublicProfile {
  id: number;
  username: string;
  avatarUrl?: string | null;
  favoriteDriversIds: string[];
  favoriteTeamsIds: string[];
  createdAt: string;
  predictions: Prediction[];
}
