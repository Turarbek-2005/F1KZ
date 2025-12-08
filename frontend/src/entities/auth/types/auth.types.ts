export type UserInfo = {
  id: number;
  username: string;
  email: string;
  favoriteDriversIds?: string[];
  favoriteTeamsIds?: string[];
};

export type AuthState = {
  token: string | null;
  user: UserInfo | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastUpdated: string | null;
};