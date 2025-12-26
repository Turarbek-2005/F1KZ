import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from "@reduxjs/toolkit";
import { axiosClient } from "@/shared/api/axios";
import { Driver, DriversState } from "../types/f1.types";
import type { RootState } from "@/shared/store/index";

const initialState: DriversState = {
  items: [],
  byId: {} as Record<string, Driver>,
  status: "idle",
  error: null,
};

export const fetchDrivers = createAsyncThunk<
  Driver[],
  void,
  { rejectValue: { message: string; status?: number } }
>("drivers/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosClient.get<Driver[]>("/f1/drivers");
    return res.data;
  } catch (err) {
    if (typeof err === "object" && err !== null && "response" in err) {
      const axiosErr = err as {
        response?: {
          data?: { message?: string };
          status?: number;
          statusText?: string;
        };
      };

      return rejectWithValue({
        message:
          axiosErr.response?.data?.message ??
          axiosErr.response?.statusText ??
          "Request failed",
        status: axiosErr.response?.status,
      });
    }

    if (err instanceof Error) {
      return rejectWithValue({ message: err.message });
    }

    return rejectWithValue({ message: "Network error" });
  }
});

const driversSlice = createSlice({
  name: "drivers",
  initialState,
  reducers: {
    setDrivers(state, action: PayloadAction<Driver[]>) {
      state.items = action.payload;
      state.byId = action.payload.reduce((acc, d) => {
        acc[d.driverId] = d;
        return acc;
      }, {} as Record<string, Driver>);
      state.status = "succeeded";
      state.error = null;
    },
    clearDrivers(state) {
      state.items = [];
      state.byId = {};
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrivers.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.items = a.payload;
        s.byId = a.payload.reduce((acc, d) => {
          acc[d.driverId] = d;
          return acc;
        }, {} as Record<string, Driver>);
      })
      .addCase(fetchDrivers.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload?.message ?? a.error.message ?? "Error";
      });
  },
});

export const { setDrivers, clearDrivers } = driversSlice.actions;
export default driversSlice.reducer;

export const selectAllDrivers = (state: RootState) => state.drivers.items;

export const selectDriverById = (state: RootState, driverId: string) =>
  driverId ? state.drivers.byId[driverId] : undefined;

export const selectTeamDrivers = createSelector(
  [(state) => state.drivers.items, (_, teamId: string) => teamId],
  (drivers, teamId) =>
    drivers.filter((driver: { teamId: string }) => driver.teamId === teamId)
);
