import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import { AuthState, UserInfo } from "../types/auth.types";
import { axiosClient } from "@/shared/api/axios";

const LOCAL_TOKEN_KEY = "f1kz_token";

function saveToken(token: string | null) {
  if (token) localStorage.setItem(LOCAL_TOKEN_KEY, token);
  else localStorage.removeItem(LOCAL_TOKEN_KEY);
}

function loadToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LOCAL_TOKEN_KEY);
}

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
    const res = await axiosClient.post<UserInfo>("/auth/register", payload);
    return { user: res.data };
  } catch (err: unknown) {
    return rejectWithValue(extractAxiosErrorMessage(err));
  }
});

export const loginUser = createAsyncThunk<
  { token: string; user: UserInfo },
  { usernameOrEmail: string; password: string },
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const res = await axiosClient.post<{ token: string; user: UserInfo }>(
      "/auth/login",
      payload
    );

    const { token, user } = res.data;

    if (!token || !user) {
      return rejectWithValue("Invalid server response: missing token or user");
    }

    saveToken(token);
    return { token, user };
  } catch (err: unknown) {
    return rejectWithValue(extractAxiosErrorMessage(err));
  }
});

export const fetchMe = createAsyncThunk<
  { user: UserInfo },
  void,
  { state: { auth: AuthState }; rejectValue: string }
>("auth/fetchMe", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token ?? loadToken();
    if (!token) return rejectWithValue("No token");

    const res = await axiosClient.get<UserInfo>("/user/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return { user: res.data };
  } catch (err: unknown) {
    const msg = extractAxiosErrorMessage(err);
    const axiosError = err as AxiosError;
    if (axiosError.response?.status === 401) saveToken(null);
    return rejectWithValue(msg);
  }
});

export const updateUser = createAsyncThunk<
  { user: UserInfo },
  {
    username?: string;
    email?: string;
    password?: string;
    favoriteDriversIds?: string[];
    favoriteTeamsIds?: string[];
  },
  { state: { auth: AuthState }; rejectValue: string }
>("auth/updateUser", async (payload, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("Unauthorized");

    const res = await axiosClient.patch<UserInfo>("/user/me", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return { user: res.data };
  } catch (err: unknown) {
    const msg = extractAxiosErrorMessage(err);
    const axiosError = err as AxiosError;
    if (axiosError.response?.status === 401) saveToken(null);
    return rejectWithValue(msg);
  }
});

const initialState: AuthState = {
  token: typeof window !== "undefined" ? loadToken() : null,
  user: null,
  status: "idle",
  error: null,
  lastUpdated: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(
      state,
      action: PayloadAction<{ token: string | null; user: UserInfo | null }>
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
      if (action.payload.token) saveToken(action.payload.token);
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = "idle";
      state.error = null;
      saveToken(null);
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
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Login failed";
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
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Fetch user failed";
        if (
          action.payload &&
          (action.payload.toLowerCase().includes("unauthorized") ||
            action.payload.toLowerCase().includes("no token"))
        ) {
          state.token = null;
          state.user = null;
          saveToken(null);
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
          state.token = null;
          state.user = null;
          saveToken(null);
        }
      });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
