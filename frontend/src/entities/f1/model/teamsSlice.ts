import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { axiosClient } from "@/shared/api/axios";
import { Team, TeamsState } from "../types/f1.types";
import type { RootState } from "@/shared/store/index";



const initialState: TeamsState = {
  items: [],
  byId: {},
  status: "idle",
  error: null,
};

export const fetchTeams = createAsyncThunk<
  Team[],
  void,
  { rejectValue: { message: string; status?: number } }
>("teams/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosClient.get<Team[]>("/f1/teams");
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

const teamsSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    setTeams(state, action: PayloadAction<Team[]>) {
      state.items = action.payload;
      state.byId = action.payload.reduce((acc, t) => {
        acc[t.id] = t;
        return acc;
      }, {} as Record<number, Team>);
      state.status = "succeeded";
      state.error = null;
    },
    clearTeams(state) {
      state.items = [];
      state.byId = {};
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(fetchTeams.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.items = a.payload;
        s.byId = a.payload.reduce((acc, t) => {
          acc[t.id] = t;
          return acc;
        }, {} as Record<number, Team>);
      })
      .addCase(fetchTeams.rejected, (s, a) => {
        s.status = "failed";
        s.error = (a.payload as any)?.message ?? a.error.message ?? "Error";
      });
  },
});

export const { setTeams, clearTeams } = teamsSlice.actions;
export default teamsSlice.reducer;

export const selectAllTeams = (state: RootState) => state.teams.items;
export const selectTeamById = (state: RootState, id: number) =>
  state.teams.byId[id];
