// src/entities/f1/api/f1Api.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig } from "axios";
import { axiosClient } from "@/shared/api/axios";

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: any;
  params?: any;
};

const axiosBaseQuery =
  () =>
  async ({ url, method = "get", data, params }: AxiosBaseQueryArgs) => {
    try {
      const res = await axiosClient.request({
        url,
        method,
        data,
        params,
      });

      return { data: res.data };
    } catch (axiosError: any) {
      const err = axiosError;
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
    // Drivers
    getDrivers: build.query<any, void>({
      query: () => ({ url: "/f1api/drivers", method: "get" }),
      providesTags: ["Drivers"],
    }),
    getDriverById: build.query<any, string>({
      query: (driverId) => ({
        url: `/f1api/drivers/${driverId}`,
        method: "get",
      }),
      providesTags: (_result, _err, driverId) => [
        { type: "Drivers", id: driverId },
      ],
    }),
    searchDrivers: build.query<any, string>({
      query: (q) => ({
        url: `/f1api/drivers/search?q=${encodeURIComponent(q)}`,
        method: "get",
      }),
      providesTags: ["Drivers"],
    }),

    // Teams
    getTeams: build.query<any, void>({
      query: () => ({ url: "/f1api/teams", method: "get" }),
      providesTags: ["Teams"],
    }),
    getTeamById: build.query<any, string>({
      query: (teamId) => ({ url: `/f1api/teams/${teamId}`, method: "get" }),
      providesTags: (_r, _e, teamId) => [{ type: "Teams", id: teamId }],
    }),
    getTeamDrivers: build.query<any, string>({
      query: (teamId) => ({
        url: `/f1api/teams/${teamId}/drivers`,
        method: "get",
      }),
      providesTags: ["Teams"],
    }),
    searchTeams: build.query<any, string>({
      query: (q) => ({
        url: `/f1api/teams/search?q=${encodeURIComponent(q)}`,
        method: "get",
      }),
      providesTags: ["Teams"],
    }),

    // Results
    getLastFp1: build.query<any, void>({
      query: () => ({ url: "/f1api/last/fp1", method: "get" }),
      providesTags: ["Results"],
    }),
    getLastFp2: build.query<any, void>({
      query: () => ({ url: "/f1api/last/fp2", method: "get" }),
      providesTags: ["Results"],
    }),
    getLastFp3: build.query<any, void>({
      query: () => ({ url: "/f1api/last/fp3", method: "get" }),
      providesTags: ["Results"],
    }),
    getLastQualy: build.query<any, void>({
      query: () => ({ url: "/f1api/last/qualy", method: "get" }),
      providesTags: ["Results"],
    }),
    getLastRace: build.query<any, void>({
      query: () => ({ url: "/f1api/last/race", method: "get" }),
      providesTags: ["Results"],
    }),
    getLastSprintQualy: build.query<any, void>({
      query: () => ({ url: "/f1api/last/sprint/qualy", method: "get" }),
      providesTags: ["Results"],
    }),
    getLastSprintRace: build.query<any, void>({
      query: () => ({ url: "/f1api/last/sprint/race", method: "get" }),
      providesTags: ["Results"],
    }),

    // Standings
    getStandingsTeams: build.query<any, void>({
      query: () => ({ url: "/f1api/standings/teams", method: "get" }),
      providesTags: ["Standings"],
    }),
    getStandingsDrivers: build.query<any, void>({
      query: () => ({ url: "/f1api/standings/drivers", method: "get" }),
      providesTags: ["Standings"],
    }),

    // Races
    getRaces: build.query<any, void>({
      query: () => ({ url: "/f1api/races", method: "get" }),
      providesTags: ["Races"],
    }),
    getRacesLast: build.query<any, void>({
      query: () => ({ url: "/f1api/races/last", method: "get" }),
      providesTags: ["Races"],
    }),
    getRacesNext: build.query<any, void>({
      query: () => ({ url: "/f1api/races/next", method: "get" }),
      providesTags: ["Races"],
    }),
    getRacesYear: build.query<any, string | number>({
      query: (year) => ({ url: `/f1api/races/${year}`, method: "get" }),
      providesTags: ["Races"],
    }),
    getRacesYearRound: build.query<
      any,
      { year: string | number; round: string | number }
    >({
      query: ({ year, round }) => ({
        url: `/f1api/races/${year}/${round}`,
        method: "get",
      }),
      providesTags: (_res, _err, { year, round }) => [
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
  useGetStandingsTeamsQuery,
  useGetStandingsDriversQuery,
  useGetRacesQuery,
  useGetRacesLastQuery,
  useGetRacesNextQuery,
  useGetRacesYearQuery,
  useGetRacesYearRoundQuery,
} = f1Api;
