import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { axiosClient } from "@/shared/api/axios";
import { Driver,DriversState } from "../types/f1.types";
import type { RootState } from "@/shared/store/index";

const initialState: DriversState = {
  items: [],
  byId: {},
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
  } catch (err: any) {
    if (err.response) {
      return rejectWithValue({
        message: err.response.data?.message || err.response.statusText,
        status: err.response.status,
      });
    }
    return rejectWithValue({ message: err.message || "Network error" });
  }
});

const driversSlice = createSlice({
  name: "drivers",
  initialState,
  reducers: {
    setDrivers(state, action: PayloadAction<Driver[]>) {
      state.items = action.payload;
      state.byId = action.payload.reduce((acc, d) => {
        acc[d.id] = d;
        return acc;
      }, {} as Record<number, Driver>);
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
          acc[d.id] = d;
          return acc;
        }, {} as Record<number, Driver>);
      })
      .addCase(fetchDrivers.rejected, (s, a) => {
        s.status = "failed";
        s.error = (a.payload as any)?.message ?? a.error.message ?? "Error";
      });
  },
});

export const { setDrivers, clearDrivers } = driversSlice.actions;
export default driversSlice.reducer;

export const selectAllDrivers = (state: RootState) => state.drivers.items;
export const selectDriverById = (state: RootState, id: number) =>
  state.drivers.byId[id];
