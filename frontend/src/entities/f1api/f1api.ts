import { createApi, BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig, AxiosError } from "axios";
import { axiosClient } from "@/shared/api/axios";
import type {
  DriverByIdResponse,
  DriversResponse,
  DriversStandingsResponse,
  LastNextRacesResponse,
  RaceRoundResponse,
  RacesListResponse,
  SessionResultRow,
  SessionResultsResponse,
  TeamByIdResponse,
  TeamDriversResponse,
  TeamsResponse,
  TeamsStandingsResponse,
  YearRoundParams,
} from "./f1api.interfaces";

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: unknown;
  params?: Record<string, string | number>;
};

type AxiosBaseQueryError = {
  status: number;
  data: unknown;
};

const axiosBaseQuery =
  (): BaseQueryFn<
    AxiosBaseQueryArgs,
    unknown,
    AxiosBaseQueryError
  > =>
  async ({ url, method = "get", data, params }) => {
    const maxAttempts = 2;
    let attempt = 0;

    while (attempt <= maxAttempts) {
      attempt += 1;

      try {
        const res = await axiosClient.request({
          url,
          method,
          data,
          params,
        });

        return { data: res.data };
      } catch (error) {
        const err = error as AxiosError;
        const status = err.response?.status ?? 500;

        if (attempt > maxAttempts) {
          return {
            error: {
              status,
              data: err.response?.data ?? err.message,
            },
          };
        }

        await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
      }
    }

    return {
      error: {
        status: 500,
        data: "Unknown error",
      },
    };
  };


export const f1Api = createApi({
  reducerPath: "f1Api",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Drivers", "Teams", "Races", "Standings", "Results"],
  keepUnusedDataFor: 0,
  endpoints: (build) => ({
    /* ---------- Drivers ---------- */

    getDrivers: build.query<DriversResponse, void>({
      query: () => ({ url: "/f1api/drivers" }),
      providesTags: ["Drivers"],
    }),

    getDriverById: build.query<DriverByIdResponse, string>({
      query: (driverId) => ({
        url: `/f1api/drivers/${driverId}`,
      }),
      providesTags: (_r, _e, id) => [{ type: "Drivers", id }],
    }),

    searchDrivers: build.query<DriversResponse, string>({
      query: (q) => ({
        url: `/f1api/drivers/search`,
        params: { q },
      }),
      providesTags: ["Drivers"],
    }),

    /* ---------- Teams ---------- */

    getTeams: build.query<TeamsResponse, void>({
      query: () => ({ url: "/f1api/teams" }),
      providesTags: ["Teams"],
    }),

    getTeamById: build.query<TeamByIdResponse, string>({
      query: (teamId) => ({
        url: `/f1api/teams/${teamId}`,
      }),
      providesTags: (_r, _e, id) => [{ type: "Teams", id }],
    }),

    getTeamDrivers: build.query<TeamDriversResponse, string>({
      query: (teamId) => ({
        url: `/f1api/teams/${teamId}/drivers`,
      }),
      providesTags: ["Teams"],
    }),

    searchTeams: build.query<TeamsResponse, string>({
      query: (q) => ({
        url: `/f1api/teams/search`,
        params: { q },
      }),
      providesTags: ["Teams"],
    }),

    /* ---------- Results ---------- */

    getLastFp1: build.query<SessionResultsResponse<SessionResultRow>, void>({
      query: () => ({ url: "/f1api/last/fp1" }),
      providesTags: ["Results"],
    }),

    getLastFp2: build.query<SessionResultsResponse<SessionResultRow>, void>({
      query: () => ({ url: "/f1api/last/fp2" }),
      providesTags: ["Results"],
    }),

    getLastFp3: build.query<SessionResultsResponse<SessionResultRow>, void>({
      query: () => ({ url: "/f1api/last/fp3" }),
      providesTags: ["Results"],
    }),

    getLastQualy: build.query<SessionResultsResponse<SessionResultRow>, void>({
      query: () => ({ url: "/f1api/last/qualy" }),
      providesTags: ["Results"],
    }),

    getLastRace: build.query<SessionResultsResponse<SessionResultRow>, void>({
      query: () => ({ url: "/f1api/last/race" }),
      providesTags: ["Results"],
    }),

    getLastSprintQualy: build.query<SessionResultsResponse<SessionResultRow>, void>({
      query: () => ({ url: "/f1api/last/sprint/qualy" }),
      providesTags: ["Results"],
    }),

    getLastSprintRace: build.query<SessionResultsResponse<SessionResultRow>, void>({
      query: () => ({ url: "/f1api/last/sprint/race" }),
      providesTags: ["Results"],
    }),

    /* ---------- Year / Round ---------- */

    getYearRoundFp1: build.query<
      SessionResultsResponse<SessionResultRow>,
      YearRoundParams
    >({
      query: ({ year, round }) => ({
        url: `/f1api/${year}/${round}/fp1`,
      }),
      providesTags: ["Results"],
    }),

    getYearRoundFp2: build.query<
      SessionResultsResponse<SessionResultRow>,
      YearRoundParams
    >({
      query: ({ year, round }) => ({
        url: `/f1api/${year}/${round}/fp2`,
      }),
      providesTags: ["Results"],
    }),

    getYearRoundFp3: build.query<
      SessionResultsResponse<SessionResultRow>,
      YearRoundParams
    >({
      query: ({ year, round }) => ({
        url: `/f1api/${year}/${round}/fp3`,
      }),
      providesTags: ["Results"],
    }),

    getYearRoundQualy: build.query<
      SessionResultsResponse<SessionResultRow>,
      YearRoundParams
    >({
      query: ({ year, round }) => ({
        url: `/f1api/${year}/${round}/qualy`,
      }),
      providesTags: ["Results"],
    }),

    getYearRoundRace: build.query<
      SessionResultsResponse<SessionResultRow>,
      YearRoundParams
    >({
      query: ({ year, round }) => ({
        url: `/f1api/${year}/${round}/race`,
      }),
      providesTags: ["Results"],
    }),

    getYearRoundSprintQualy: build.query<
      SessionResultsResponse<SessionResultRow>,
      YearRoundParams
    >({
      query: ({ year, round }) => ({
        url: `/f1api/${year}/${round}/sprint/qualy`,
      }),
      providesTags: ["Results"],
    }),

    getYearRoundSprintRace: build.query<
      SessionResultsResponse<SessionResultRow>,
      YearRoundParams
    >({
      query: ({ year, round }) => ({
        url: `/f1api/${year}/${round}/sprint/race`,
      }),
      providesTags: ["Results"],
    }),

    /* ---------- Standings ---------- */

    getStandingsTeams: build.query<TeamsStandingsResponse, void>({
      query: () => ({ url: "/f1api/standings/teams" }),
      providesTags: ["Standings"],
    }),

    getStandingsDrivers: build.query<DriversStandingsResponse, void>({
      query: () => ({ url: "/f1api/standings/drivers" }),
      providesTags: ["Standings"],
    }),

    /* ---------- Races ---------- */

    getRaces: build.query<RacesListResponse, void>({
      query: () => ({ url: "/f1api/races" }),
      providesTags: ["Races"],
    }),

    getRacesLast: build.query<LastNextRacesResponse, void>({
      query: () => ({ url: "/f1api/races/last" }),
      providesTags: ["Races"],
    }),

    getRacesNext: build.query<LastNextRacesResponse, void>({
      query: () => ({ url: "/f1api/races/next" }),
      providesTags: ["Races"],
    }),

    getRacesYear: build.query<RacesListResponse, string | number>({
      query: (year) => ({
        url: `/f1api/races/${year}`,
      }),
      providesTags: ["Races"],
    }),

    getRacesYearRound: build.query<RaceRoundResponse, YearRoundParams>({
      query: ({ year, round }) => ({
        url: `/f1api/races/${year}/${round}`,
      }),
      providesTags: (_r, _e, { year, round }) => [
        { type: "Races", id: `${year}-${round}` },
      ],
    }),
  }),
});

export const {
  useGetDriversQuery,
  useGetDriverByIdQuery,
  useSearchDriversQuery,
  useGetTeamsQuery,
  useGetTeamByIdQuery,
  useGetTeamDriversQuery,
  useSearchTeamsQuery,
  useGetLastFp1Query,
  useGetLastFp2Query,
  useGetLastFp3Query,
  useGetLastQualyQuery,
  useGetLastRaceQuery,
  useGetLastSprintQualyQuery,
  useGetLastSprintRaceQuery,
  useGetYearRoundFp1Query,
  useGetYearRoundFp2Query,
  useGetYearRoundFp3Query,
  useGetYearRoundQualyQuery,
  useGetYearRoundRaceQuery,
  useGetYearRoundSprintQualyQuery,
  useGetYearRoundSprintRaceQuery,
  useGetStandingsTeamsQuery,
  useGetStandingsDriversQuery,
  useGetRacesQuery,
  useGetRacesLastQuery,
  useGetRacesNextQuery,
  useGetRacesYearQuery,
  useGetRacesYearRoundQuery,
} = f1Api;
