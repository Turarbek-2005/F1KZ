import { configureStore } from "@reduxjs/toolkit";
import driversReducer from "@/entities/f1/model/driversSlice";
import aiReducer from "@/entities/ai/aiSlice";
import teamsReducer from "@/entities/f1/model/teamsSlice";
import authReducer from '@/entities/auth/model/authSlice';
import { f1Api } from '@/entities/f1api/f1api';
import { predictionsApi } from '@/entities/predictions/predictionsApi';

export const store = configureStore({
  reducer: {
    drivers: driversReducer,
    teams: teamsReducer,
    auth: authReducer,
    ai: aiReducer,
    [f1Api.reducerPath]: f1Api.reducer,
    [predictionsApi.reducerPath]: predictionsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(f1Api.middleware, predictionsApi.middleware),

});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
