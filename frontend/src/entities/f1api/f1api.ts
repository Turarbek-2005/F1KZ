// src/entities/f1/api/f1Api.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import type { AxiosRequestConfig } from 'axios';
import { axiosClient } from '@/shared/api/axios'; 
import type { RootState } from "@/shared/store/index";

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: any;
  params?: any;
};

const axiosBaseQuery =
  () =>
  async (
    { url, method = 'get', data, params }: AxiosBaseQueryArgs,
    { getState }: { getState: () => unknown }
  ) => {
    try {
      const state = getState() as RootState;
      const token = state.user?.token;

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await axiosClient.request({
        url, 
        method,
        data,
        params,
        headers,
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
  reducerPath: 'f1Api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Drivers', 'Teams', 'Races', 'Standings', 'Results'],
  endpoints: (build) => ({
    // Drivers
    getDrivers: build.query<any, void>({
      query: () => ({ url: '/f1api/drivers', method: 'get' }),
      providesTags: ['Drivers'],
    }),
    getDriverById: build.query<any, string>({
      query: (driverId) => ({ url: `/f1api/drivers/${driverId}`, method: 'get' }),
      providesTags: (_result, _err, driverId) => [{ type: 'Drivers', id: driverId }],
    }),
    searchDrivers: build.query<any, string>({
      query: (q) => ({ url: `/f1api/drivers/search?q=${encodeURIComponent(q)}`, method: 'get' }),
    }),

    // Teams
    getTeams: build.query<any, void>({
      query: () => ({ url: '/f1api/teams', method: 'get' }),
      providesTags: ['Teams'],
    }),
    getTeamById: build.query<any, string>({
      query: (teamId) => ({ url: `/f1api/teams/${teamId}`, method: 'get' }),
      providesTags: (_r, _e, teamId) => [{ type: 'Teams', id: teamId }],
    }),
    getTeamDrivers: build.query<any, string>({
      query: (teamId) => ({ url: `/f1api/teams/${teamId}/drivers`, method: 'get' }),
    }),
    searchTeams: build.query<any, string>({
      query: (q) => ({ url: `/f1api/teams/search?q=${encodeURIComponent(q)}`, method: 'get' }),
    }),

    // Results
    getLastFp1: build.query<any, void>({ query: () => ({ url: '/f1api/last/fp1', method: 'get' }), providesTags: ['Results'] }),
    getLastFp2: build.query<any, void>({ query: () => ({ url: '/f1api/last/fp2', method: 'get' }), providesTags: ['Results'] }),
    getLastFp3: build.query<any, void>({ query: () => ({ url: '/f1api/last/fp3', method: 'get' }), providesTags: ['Results'] }),
    getLastQualy: build.query<any, void>({ query: () => ({ url: '/f1api/last/qualy', method: 'get' }), providesTags: ['Results'] }),
    getLastRace: build.query<any, void>({ query: () => ({ url: '/f1api/last/race', method: 'get' }), providesTags: ['Results'] }),
    getLastSprintQualy: build.query<any, void>({ query: () => ({ url: '/f1api/last/sprint/qualy', method: 'get' }), providesTags: ['Results'] }),
    getLastSprintRace: build.query<any, void>({ query: () => ({ url: '/f1api/last/sprint/race', method: 'get' }), providesTags: ['Results'] }),

    // Standings
    getStandingsTeams: build.query<any, void>({ query: () => ({ url: '/f1api/standings/teams', method: 'get' }), providesTags: ['Standings'] }),
    getStandingsDrivers: build.query<any, void>({ query: () => ({ url: '/f1api/standings/drivers', method: 'get' }), providesTags: ['Standings'] }),

    // Races
    getRaces: build.query<any, void>({ query: () => ({ url: '/f1api/races', method: 'get' }), providesTags: ['Races'] }),
    getRacesLast: build.query<any, void>({ query: () => ({ url: '/f1api/races/last', method: 'get' }) }),
    getRacesNext: build.query<any, void>({ query: () => ({ url: '/f1api/races/next', method: 'get' }) }),
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
} = f1Api;
