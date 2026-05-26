"use client";

import { useEffect, useState } from "react";
import type { LiveTimingState } from "../types/timing.types";

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

const POLL_INTERVAL = 5000;

export function useLiveTiming({ enabled = true }: { enabled?: boolean } = {}) {
  const [state, setState] = useState<LiveTimingState>({});
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const apiBase = (
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4200"
    ).replace(/\/$/, "");

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const controller = new AbortController();

    const tick = async () => {
      try {
        const res = await fetch(`${apiBase}/live/state`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as LiveTimingState;
        if (cancelled) return;
        setState(data);
        setStatus("connected");
        setLastUpdate(new Date());
      } catch {
        if (cancelled) return;
        setStatus("disconnected");
      } finally {
        if (!cancelled) {
          timer = setTimeout(tick, POLL_INTERVAL);
        }
      }
    };

    tick();

    return () => {
      cancelled = true;
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [enabled]);

  return { state, status, lastUpdate };
}
