import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { axiosClient } from "@/shared/api/axios";

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

export type Category = "race" | "transfers" | "teams" | "drivers" | "technical";

export interface NewsItem {
  title: string;
  summary: string;
  category: Category;
  date: string;
}

type AiState = {
  news: NewsItem[] | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastUpdated: number | null;
};

const initialState: AiState = {
  news: null,
  status: "idle",
  error: null,
  lastUpdated: null,
};

export const generateNews = createAsyncThunk<
  NewsItem[],
  { prompt: string },
  { rejectValue: string }
>("ai/generateNews", async (payload, { rejectWithValue }) => {
  try {
    console.log("[AI] generateNews payload:", payload);

    const res = await axiosClient.post<{ news: string | NewsItem[] }>(
      "/ai/generate-news",
      { prompt: payload.prompt }
    );

    console.log("[AI] Raw axios response:", res);
    console.log("[AI] res.data:", res.data);
    console.log("[AI] res.data.news (raw):", res.data.news);

    const raw = res.data.news;
    let newsArr: NewsItem[] | null = null;

    if (typeof raw === "string") {
      console.log("[AI] news is STRING, trying JSON.parse");

      try {
        const parsed = JSON.parse(raw);
        console.log("[AI] Parsed JSON:", parsed);

        if (Array.isArray(parsed)) {
          newsArr = parsed;
        } else if (
          parsed &&
          typeof parsed === "object" &&
          Array.isArray((parsed as any).news)
        ) {
          newsArr = (parsed as any).news as NewsItem[];
        } else {
          console.error("[AI] Invalid JSON structure:", parsed);
          return rejectWithValue("Invalid JSON structure in response");
        }
      } catch (e) {
        console.warn("[AI] JSON.parse failed, using fallback", e);

        newsArr = [
          {
            title: payload.prompt || "AI Generated News",
            summary: raw,
            category: "race",
            date: new Date().toISOString(),
          },
        ];
      }
    } else if (Array.isArray(raw)) {
      console.log("[AI] news is ARRAY");
      newsArr = raw;
    } else if (
      raw &&
      typeof raw === "object" &&
      Array.isArray((raw as any).news)
    ) {
      console.log("[AI] news is OBJECT with news[]");
      newsArr = (raw as any).news as NewsItem[];
    } else {
      console.error("[AI] Unexpected response format:", raw);
      return rejectWithValue("Unexpected response format from server");
    }

    console.log("[AI] Final parsed newsArr:", newsArr);

    if (!newsArr || newsArr.length === 0) {
      console.error("[AI] newsArr empty or null");
      return rejectWithValue("No news items returned");
    }

    for (const item of newsArr) {
      if (!item.title || !item.date) {
        console.error("[AI] Malformed news item:", item);
        return rejectWithValue("Malformed news item in response");
      }
    }

    console.log("[AI] generateNews SUCCESS");
    return newsArr;
  } catch (err: unknown) {
    console.error("[AI] generateNews ERROR:", err);

    if (axios.isAxiosError<ApiErrorResponse>(err)) {
      console.error("[AI] Axios error response:", err.response);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Request failed";
      return rejectWithValue(msg);
    }

    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }

    return rejectWithValue("Network error");
  }
});


const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    clearNews(state) {
      state.news = null;
      state.status = "idle";
      state.error = null;
      state.lastUpdated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateNews.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(generateNews.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.news = a.payload;
        s.lastUpdated = Date.now();
      })
      .addCase(generateNews.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload ?? a.error.message ?? "Error";
      });
  },
});

export const { clearNews } = aiSlice.actions;

export const selectNews = (state: any): NewsItem[] | null => state.ai.news;
export const selectNewsStatus = (state: any) => state.ai.status;
export const selectNewsError = (state: any) => state.ai.error;
export const selectNewsLastUpdated = (state: any) => state.ai.lastUpdated;

export default aiSlice.reducer;
