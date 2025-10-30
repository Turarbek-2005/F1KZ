import { configureStore } from "@reduxjs/toolkit";
import userReducer from "@/entities/user/model/userSlice";
import driversReducer from "@/entities/f1/model/driversSlice";
import teamsReducer from "@/entities/f1/model/teamsSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    drivers: driversReducer,
    teams: teamsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
