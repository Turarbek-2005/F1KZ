export interface YearRoundParams {
  year: string | number;
  round: string | number;
}

export interface ApiDriver {
  driverId: string;
  name?: string;
  surname?: string;
  shortName?: string;
  number?: string | number;
  imgUrl?: string;
  teamId?: string;
  nationalityImgUrl?: string;
  nationality?: string;
  birthday?: string;
}

export interface ApiTeam {
  teamId: string;
  teamName?: string;
  teamImgUrl?: string;
  bolidImgUrl?: string;
}

export interface DriversResponse {
  drivers: ApiDriver[];
}

export interface TeamsResponse {
  teams: ApiTeam[];
}

export interface DriverResultEntry {
  race?: {
    round?: string | number;
    name?: string;
    date?: string;
    raceId?: string;
  };
  result?: {
    gridPosition?: number | string;
    finishingPosition?: number | string;
    pointsObtained?: number;
  };
  sprintResult?: {
    finishingPosition?: number | string;
    pointsObtained?: number;
  };
}

export interface DriverByIdResponse {
  season?: string;
  driver?: ApiDriver;
  team?: ApiTeam;
  results?: DriverResultEntry[];
}

export interface TeamByIdResponse {
  team: ApiTeam[];
}

export interface TeamDriversResponse {
  team: ApiTeam;
  drivers: { driver: ApiDriver }[];
}

export interface DriverStanding {
  driverId: string;
  position?: number;
  points?: number;
  teamId?: string;
  driver?: {
    name?: string;
    surname?: string;
    shortName?: string;
  };
  team?: {
    teamName?: string;
  };
}

export interface TeamStanding {
  teamId: string;
  position?: number;
  points?: number;
  team?: {
    teamName?: string;
  };
}

export interface DriversStandingsResponse {
  drivers_championship: DriverStanding[];
}

export interface TeamsStandingsResponse {
  constructors_championship: TeamStanding[];
}

export interface RaceSession {
  date?: string;
  time?: string;
}

export interface RaceSchedule {
  fp1?: RaceSession;
  fp2?: RaceSession;
  fp3?: RaceSession;
  sprintQualy?: RaceSession;
  sprintQualyfying?: RaceSession;
  sprintRace?: RaceSession;
  qualy?: RaceSession;
  qualyfying?: RaceSession;
  race?: RaceSession;
}

export interface RaceEntry {
  race?: string;
  raceId?: string;
  raceName?: string;
  round?: number | string;
  date?: string;
  circuit?: {
    name?: string;
    country?: string;
    city?: string;
  };
  schedule?: RaceSchedule;
  winner?: {
    driverId: string;
    name?: string;
    surname?: string;
  };
  teamWinner?: {
    teamId?: string;
  };
}

export interface RacesListResponse {
  races: RaceEntry[];
}

export interface RaceRoundResponse {
  race: RaceEntry[];
}

export interface LastNextRacesResponse {
  round?: number | string;
  race?: RaceEntry[];
}

export interface SessionResultRow {
  driver: {
    driverId: string;
    name: string;
    surname: string;
  };
  team: {
    teamId: string;
    teamName: string;
  };
  [key: string]: unknown;
}

export interface SessionResultsResponse<T extends SessionResultRow> {
  races?: Record<string, T[]>;
}
