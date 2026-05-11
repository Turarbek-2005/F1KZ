import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import { AuthState, UserInfo } from "../types/auth.types";
import { axiosAuthClient } from "@/shared/api/axios";

function extractAxiosErrorMessage(error: unknown): string {
  if (!error) return "Unknown error";

  const axiosError = error as AxiosError<{ message?: string; error?: string }>;

  if (axiosError.response?.data) {
    const d = axiosError.response.data;
    if (typeof d === "string") return d;
    return d.message || d.error || "Request failed";
  }

  if (axiosError.message) return axiosError.message;
  return String(error);
}

export const registerUser = createAsyncThunk<
  { user: UserInfo },
  {
    username: string;
    email: string;
    password: string;
    favoriteDriversIds?: string[];
    favoriteTeamsIds?: string[];
  },
  { rejectValue: string }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const res = await axiosAuthClient.post<UserInfo>("/auth/register", payload);
    return { user: res.data };
  } catch (err: unknown) {
    return rejectWithValue(extractAxiosErrorMessage(err));
  }
});

export const loginUser = createAsyncThunk<
  { user: UserInfo },
  { usernameOrEmail: string; password: string },
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const res = await axiosAuthClient.post<{ user: UserInfo }>("/auth/login", payload);
    return res.data;
  } catch (err: unknown) {
    return rejectWithValue(extractAxiosErrorMessage(err));
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosAuthClient.post("/auth/logout");
    } catch (err: unknown) {
      return rejectWithValue(extractAxiosErrorMessage(err));
    }
  }
);

export const fetchMe = createAsyncThunk<{ user: UserInfo }, void, { rejectValue: string }>(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosAuthClient.get<UserInfo>("/user/me");
      return { user: res.data };
    } catch (err: unknown) {
      return rejectWithValue(extractAxiosErrorMessage(err));
    }
  }
);

export const updateUser = createAsyncThunk<
  { user: UserInfo },
  {
    username?: string;
    email?: string;
    password?: string;
    favoriteDriversIds?: string[];
    favoriteTeamsIds?: string[];
  },
  { rejectValue: string }
>("auth/updateUser", async (payload, { rejectWithValue }) => {
  try {
    const res = await axiosAuthClient.patch<UserInfo>("/user/me", payload);
    return { user: res.data };
  } catch (err: unknown) {
    return rejectWithValue(extractAxiosErrorMessage(err));
  }
});

const initialState: AuthState = {
  token: null,
  user: null,
  status: "idle",
  error: null,
  lastUpdated: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ user: UserInfo | null }>) {
      state.user = action.payload.user;
      state.error = null;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Register failed";
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload ?? action.error.message ?? "Login failed") as string;
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "idle";
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = "failed";
        state.user = null;
        state.error = action.payload ?? action.error.message ?? "Logout failed";
      })
      .addCase(fetchMe.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        const message = action.payload ?? action.error.message ?? "Fetch user failed";
        if (
          typeof message === "string" &&
          (message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("no auth token"))
        ) {
          state.status = "idle";
          state.error = null;
          state.user = null;
        } else {
          state.status = "failed";
          state.error = message;
          state.user = null;
        }
      })
      .addCase(updateUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Update user failed";
        if (action.payload?.toLowerCase().includes("unauthorized")) {
          state.user = null;
        }
      });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
