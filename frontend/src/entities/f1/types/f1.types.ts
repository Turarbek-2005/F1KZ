export interface Driver {
  id: number;
  driverId: string;
  imgUrl: string;
  teamId: string;
  nationality: string;
  nationalityImgUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: number;
  teamId: string;
  teamImgUrl: string;
  bolidImgUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type DriversState = {
  items: Driver[];
  byId: Record<number, Driver>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string | null;
};

export type TeamsState = {
  items: Team[];
  byId: Record<number, Team>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string | null;
};