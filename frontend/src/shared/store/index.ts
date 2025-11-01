import { configureStore } from "@reduxjs/toolkit";
import userReducer from "@/entities/user/model/userSlice";
import driversReducer from "@/entities/f1/model/driversSlice";
import teamsReducer from "@/entities/f1/model/teamsSlice";
import { f1Api } from '@/entities/f1api/f1api';

export const store = configureStore({
  reducer: {
    user: userReducer,
    drivers: driversReducer,
    teams: teamsReducer,
    [f1Api.reducerPath]: f1Api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(f1Api.middleware),
  
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
