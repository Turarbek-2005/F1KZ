'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { LiveTimingState } from '../types/timing.types';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// How long to wait after opening SSE before falling back to REST polling.
// On Vercel serverless the SSE response is often dropped silently and no
// data arrives — when that happens, polling /live/state keeps the page alive.
const SSE_GRACE_PERIOD_MS = 6000;
const POLL_INTERVAL_MS = 5000;

function deepMerge(target: any, source: any): any {
  if (source === null || source === undefined) return target;
  if (typeof source !== 'object' || Array.isArray(source)) return source;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target?.[key];
    if (
      sv !== null &&
      typeof sv === 'object' &&
      !Array.isArray(sv) &&
      tv !== null &&
      typeof tv === 'object' &&
      !Array.isArray(tv)
    ) {
      result[key] = deepMerge(tv, sv);
    } else {
      result[key] = sv;
    }
  }
  return result;
}

export function useLiveTiming() {
  const [state, setState] = useState<LiveTimingState>({});
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const stateRef = useRef<LiveTimingState>({});
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sseHasDeliveredRef = useRef(false);

  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
  ).replace(/\/+$/, '');

  const applyState = useCallback((next: LiveTimingState) => {
    stateRef.current = next;
    setState(next);
    setStatus('connected');
    setLastUpdate(new Date());
  }, []);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const pollOnce = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/live/state`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as LiveTimingState;
      if (data && Object.keys(data).length > 0) {
        applyState(data);
      }
    } catch {
      // ignore — next interval will retry
    }
  }, [apiBase, applyState]);

  const startPolling = useCallback(() => {
    if (pollTimerRef.current) return;
    pollOnce();
    pollTimerRef.current = setInterval(pollOnce, POLL_INTERVAL_MS);
  }, [pollOnce]);

  const connect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
    }

    setStatus('connecting');
    sseHasDeliveredRef.current = false;
    const es = new EventSource(`${apiBase}/live/stream`);
    esRef.current = es;

    // If SSE doesn't push anything within the grace period, assume the
    // platform is dropping the stream and switch on REST polling.
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    fallbackTimerRef.current = setTimeout(() => {
      if (!sseHasDeliveredRef.current) startPolling();
    }, SSE_GRACE_PERIOD_MS);

    es.onopen = () => {
      // Wait for the 'connected' event from the server before flipping status.
    };

    es.onerror = () => {
      setStatus((s) => (s === 'connected' ? s : 'disconnected'));
      es.close();
      esRef.current = null;
      // Polling keeps the page populated while SSE is down.
      startPolling();
      // Try SSE again — when it works, polling auto-stops.
      setTimeout(connect, 5000);
    };

    es.addEventListener('connected', () => {
      setStatus('connected');
    });

    es.addEventListener('snapshot', (e) => {
      sseHasDeliveredRef.current = true;
      stopPolling();
      const snapshot = JSON.parse((e as MessageEvent).data) as LiveTimingState;
      applyState(snapshot);
    });

    es.addEventListener('update', (e) => {
      sseHasDeliveredRef.current = true;
      stopPolling();
      const { topic, data } = JSON.parse((e as MessageEvent).data) as {
        topic: string;
        data: any;
        timestamp: string;
      };
      const next = {
        ...stateRef.current,
        [topic]: deepMerge((stateRef.current as any)[topic] ?? {}, data),
      };
      applyState(next);
    });
  }, [apiBase, applyState, startPolling, stopPolling]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      esRef.current = null;
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, status, lastUpdate };
}
