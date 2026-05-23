export type TrackStatusCode = '1' | '2' | '3' | '4' | '5' | '6' | '7';

export interface TrackStatus {
  Status: TrackStatusCode;
  Message: string;
}

export interface LapTime {
  Value: string;
  Status: number;
  OverallFastest?: boolean;
  PersonalFastest?: boolean;
}

export interface Sector {
  Value: string;
  Status: number;
  OverallFastest?: boolean;
  PersonalFastest?: boolean;
}

export interface TimingLine {
  GapToLeader?: string;
  IntervalToPositionAhead?: { Value: string; IsPersonalBest?: boolean } | string;
  Line?: number;
  Position?: string;
  ShowPosition?: boolean;
  RacingNumber?: string;
  Retired?: boolean;
  InPit?: boolean;
  PitOut?: boolean;
  Stopped?: boolean;
  Status?: number;
  LastLapTime?: LapTime;
  BestLapTime?: { Value: string; Lap?: number };
  NumberOfLaps?: number;
  Sectors?: Sector[];
  Speeds?: Record<string, unknown>;
}

export interface TimingData {
  Lines?: Record<string, TimingLine>;
  Withheld?: boolean;
  Underway?: boolean;
}

export interface Stint {
  Compound?: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET' | 'UNKNOWN';
  New?: boolean;
  TotalLaps?: number;
  StartLaps?: number;
}

export interface TimingAppLine {
  RacingNumber?: string;
  Line?: number;
  GridPos?: string;
  Stints?: Record<string, Stint>;
}

export interface TimingAppData {
  Lines?: Record<string, TimingAppLine>;
}

export interface DriverInfo {
  RacingNumber: string;
  BroadcastName?: string;
  FullName?: string;
  Tla?: string;
  Line?: number;
  TeamName?: string;
  TeamColour?: string;
  FirstName?: string;
  LastName?: string;
  HeadshotUrl?: string;
}

export interface WeatherData {
  AirTemp?: string;
  Humidity?: string;
  Pressure?: string;
  Rainfall?: boolean | string;
  TrackTemp?: string;
  WindDirection?: string;
  WindSpeed?: string;
}

export interface LapCount {
  CurrentLap?: number;
  TotalLaps?: number;
}

export interface ExtrapolatedClock {
  Utc?: string;
  Remaining?: string;
  Extrapolating?: boolean;
}

export interface RaceControlMessage {
  Utc?: string;
  Lap?: number;
  Category?: string;
  Flag?: string;
  Message?: string;
  Scope?: string;
  Sector?: number;
  RacingNumber?: string;
  Status?: string;
}

export interface RaceControlMessages {
  Messages?: Record<string, RaceControlMessage>;
}

export interface SessionMeeting {
  Key?: number;
  Name?: string;
  OfficialName?: string;
  Location?: string;
  Country?: { Code?: string; Key?: number; Name?: string };
  Circuit?: { Key?: number; ShortName?: string };
}

export interface SessionInfo {
  Meeting?: SessionMeeting;
  Key?: number;
  Type?: string;
  Name?: string;
  StartDate?: string;
  EndDate?: string;
  GmtOffset?: string;
  Path?: string;
}

export interface SessionStatus {
  Status?: 'Inactive' | 'Started' | 'Aborted' | 'Finished' | 'Ends' | string;
}

export interface LiveTimingState {
  TrackStatus?: TrackStatus;
  TimingData?: TimingData;
  TimingAppData?: TimingAppData;
  DriverList?: Record<string, DriverInfo>;
  WeatherData?: WeatherData;
  LapCount?: LapCount;
  ExtrapolatedClock?: ExtrapolatedClock;
  RaceControlMessages?: RaceControlMessages;
  SessionInfo?: SessionInfo;
  SessionStatus?: SessionStatus;
  Heartbeat?: { Utc?: string };
}
