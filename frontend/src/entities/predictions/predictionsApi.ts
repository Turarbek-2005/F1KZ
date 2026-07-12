import { createApi, BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig, AxiosError } from "axios";
import { axiosAuthClient } from "@/shared/api/axios";
import type {
  LeaderboardRow,
  Prediction,
  PublicProfile,
  SavePredictionPayload,
} from "./predictions.types";

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: unknown;
};

type AxiosBaseQueryError = {
  status: number;
  data: unknown;
};

// Same pattern as f1api, but on the credentialed client — /predictions/me
// endpoints need the auth cookie.
const axiosAuthBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> =>
  async ({ url, method = "get", data }) => {
    try {
      const res = await axiosAuthClient.request({ url, method, data });
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

export const predictionsApi = createApi({
  reducerPath: "predictionsApi",
  baseQuery: axiosAuthBaseQuery(),
  tagTypes: ["MyPredictions", "Leaderboard", "PublicProfile"],
  endpoints: (build) => ({
    getMyPredictions: build.query<Prediction[], void>({
      query: () => ({ url: "/predictions/me" }),
      providesTags: ["MyPredictions"],
    }),

    savePrediction: build.mutation<Prediction, SavePredictionPayload>({
      query: (body) => ({
        url: "/predictions/me",
        method: "put",
        data: body,
      }),
      invalidatesTags: ["MyPredictions"],
    }),

    clearMyPredictions: build.mutation<{ message: string }, void>({
      query: () => ({ url: "/predictions/me", method: "delete" }),
      invalidatesTags: ["MyPredictions", "Leaderboard"],
    }),

    getLeaderboard: build.query<LeaderboardRow[], void>({
      query: () => ({ url: "/predictions/leaderboard" }),
      providesTags: ["Leaderboard"],
    }),

    getPublicProfile: build.query<PublicProfile, number | string>({
      query: (id) => ({ url: `/users/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "PublicProfile", id }],
    }),
  }),
});

export const {
  useGetMyPredictionsQuery,
  useSavePredictionMutation,
  useClearMyPredictionsMutation,
  useGetLeaderboardQuery,
  useGetPublicProfileQuery,
} = predictionsApi;
