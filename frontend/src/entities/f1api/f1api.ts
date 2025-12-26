import { createApi, BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig, AxiosError } from "axios";
import { axiosClient } from "@/shared/api/axios";

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

      return {
        error: {
          status: err.response?.status ?? 500,
          data: err.response?.data ?? err.message,
        },
      };
    }
  };


export const f1Api = createApi({
  reducerPath: "f1Api",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Drivers", "Teams", "Races", "Standings", "Results"],
  endpoints: (build) => ({
    /* ---------- Drivers ---------- */

    getDrivers: build.query<unknown, void>({
      query: () => ({ url: "/f1api/drivers" }),
      providesTags: ["Drivers"],
    }),

    getDriverById: build.query<unknown, string>({
      query: (driverId) => ({
        url: `/f1api/drivers/${driverId}`,
      }),
      providesTags: (_r, _e, id) => [{ type: "Drivers", id }],
    }),

    searchDrivers: build.query<unknown, string>({
      query: (q) => ({
        url: `/f1api/drivers/search`,
        params: { q },
      }),
      providesTags: ["Drivers"],
    }),

    /* ---------- Teams ---------- */

    getTeams: build.query<unknown, void>({
      query: () => ({ url: "/f1api/teams" }),
      providesTags: ["Teams"],
    }),

    getTeamById: build.query<unknown, string>({
      query: (teamId) => ({
        url: `/f1api/teams/${teamId}`,
      }),
      providesTags: (_r, _e, id) => [{ type: "Teams", id }],
    }),

    getTeamDrivers: build.query<unknown, string>({
      query: (teamId) => ({
        url: `/f1api/teams/${teamId}/drivers`,
      }),
      providesTags: ["Teams"],
    }),

    searchTeams: build.query<unknown, string>({
      query: (q) => ({
        url: `/f1api/teams/search`,
        params: { q },
      }),
      providesTags: ["Teams"],
    }),

    /* ---------- Results ---------- */

    getLastFp1: build.query<unknown, void>({
      query: () => ({ url: "/f1api/last/fp1" }),
      providesTags: ["Results"],
    }),

    getLastFp2: build.query<unknown, void>({
      query: () => ({ url: "/f1api/last/fp2" }),
      providesTags: ["Results"],
    }),

    getLastFp3: build.query<unknown, void>({
      query: () => ({ url: "/f1api/last/fp3" }),
      providesTags: ["Results"],
    }),

    getLastQualy: build.query<unknown, void>({
      query: () => ({ url: "/f1api/last/qualy" }),
      providesTags: ["Results"],
    }),

    getLastRace: build.query<unknown, void>({
      query: () => ({ url: "/f1api/last/race" }),
      providesTags: ["Results"],
    }),

    getLastSprintQualy: build.query<unknown, void>({
      query: () => ({ url: "/f1api/last/sprint/qualy" }),
      providesTags: ["Results"],
    }),

    getLastSprintRace: build.query<unknown, void>({
      query: () => ({ url: "/f1api/last/sprint/race" }),
      providesTags: ["Results"],
    }),

    /* ---------- Year / Round ---------- */

    getYearRoundFp1: build.query<
      unknown,
      { year: string | number; round: string | number }
    >({
      query: ({ year, round }) => ({
        url: `/f1api/${year}/${round}/fp1`,
      }),
      providesTags: ["Results"],
    }),

    getYearRoundFp2: build.query<
      unknown,
      { year: string | number; round: string | number }
    >({
      query: ({ year, round }) => ({
        url: `/f1api/${year}/${round}/fp2`,
      }),
      providesTags: ["Results"],
    }),

    getYearRoundFp3: build.query<
      unknown,
      { year: string | number; round: string | number }
    >({
      query: ({ year, round }) => ({
        url: `/f1api/${year}/${round}/fp3`,
      }),
      providesTags: ["Results"],
    }),

    getYearRoundQualy: build.query<
      unknown,
      { year: string | number; round: string | number }
    >({
      query: ({ year, round }) => ({
        url: `/f1api/${year}/${round}/qualy`,
      }),
      providesTags: ["Results"],
    }),

    getYearRoundRace: build.query<
      unknown,
      { year: string | number; round: string | number }
    >({
      query: ({ year, round }) => ({
        url: `/f1api/${year}/${round}/race`,
      }),
      providesTags: ["Results"],
    }),

    getYearRoundSprintQualy: build.query<
      unknown,
      { year: string | number; round: string | number }
    >({
      query: ({ year, round }) => ({
        url: `/f1api/${year}/${round}/sprint/qualy`,
      }),
      providesTags: ["Results"],
    }),

    getYearRoundSprintRace: build.query<
      unknown,
      { year: string | number; round: string | number }
    >({
      query: ({ year, round }) => ({
        url: `/f1api/${year}/${round}/sprint/race`,
      }),
      providesTags: ["Results"],
    }),

    /* ---------- Standings ---------- */

    getStandingsTeams: build.query<unknown, void>({
      query: () => ({ url: "/f1api/standings/teams" }),
      providesTags: ["Standings"],
    }),

    getStandingsDrivers: build.query<unknown, void>({
      query: () => ({ url: "/f1api/standings/drivers" }),
      providesTags: ["Standings"],
    }),

    /* ---------- Races ---------- */

    getRaces: build.query<unknown, void>({
      query: () => ({ url: "/f1api/races" }),
      providesTags: ["Races"],
    }),

    getRacesLast: build.query<unknown, void>({
      query: () => ({ url: "/f1api/races/last" }),
      providesTags: ["Races"],
    }),

    getRacesNext: build.query<unknown, void>({
      query: () => ({ url: "/f1api/races/next" }),
      providesTags: ["Races"],
    }),

    getRacesYear: build.query<unknown, string | number>({
      query: (year) => ({
        url: `/f1api/races/${year}`,
      }),
      providesTags: ["Races"],
    }),

    getRacesYearRound: build.query<
      unknown,
      { year: string | number; round: string | number }
    >({
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
