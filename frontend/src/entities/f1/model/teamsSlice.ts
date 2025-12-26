import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { axiosClient } from "@/shared/api/axios";
import { Team, TeamsState } from "../types/f1.types";
import type { RootState } from "@/shared/store/index";

const initialState: TeamsState = {
  items: [],
  byId: {} as Record<string, Team>,
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

const teamsSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    setTeams(state, action: PayloadAction<Team[]>) {
      state.items = action.payload;
      state.byId = action.payload.reduce(
        (acc: Record<string, Team>, t: Team) => {
          acc[t.teamId] = t;
          return acc;
        },
        {} as Record<string, Team>
      );
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
        s.byId = a.payload.reduce((acc: Record<string, Team>, t: Team) => {
          acc[t.teamId] = t;
          return acc;
        }, {} as Record<string, Team>);
      })
      .addCase(fetchTeams.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload?.message ?? a.error.message ?? "Error";
      });
  },
});

export const { setTeams, clearTeams } = teamsSlice.actions;
export default teamsSlice.reducer;

export const selectAllTeams = (state: RootState) => state.teams.items;

export const selectTeamById = (
  state: RootState,
  teamId?: string
): Team | undefined => (teamId ? state.teams.byId[teamId] : undefined);
