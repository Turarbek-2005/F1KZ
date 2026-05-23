'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { LiveTimingState } from '../types/timing.types';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

const POLL_INTERVAL = 5000;

export function useLiveTiming() {
  const [state, setState] = useState<LiveTimingState>({});
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
  ).replace(/\/$/, '');

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/live/state`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as LiveTimingState;
      setState(data);
      setStatus('connected');
      setLastUpdate(new Date());
    } catch {
      setStatus('disconnected');
    } finally {
      timerRef.current = setTimeout(fetchState, POLL_INTERVAL);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchState();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, status, lastUpdate };
}
