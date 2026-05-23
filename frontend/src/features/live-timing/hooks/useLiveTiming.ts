'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { LiveTimingState } from '../types/timing.types';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

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

  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
  ).replace(/\/+$/, '');

  const connect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
    }

    setStatus('connecting');
    const es = new EventSource(`${apiBase}/live/stream`);
    esRef.current = es;

    es.onopen = () => {
      // onopen fires for the HTTP handshake; wait for the 'connected' event
      // from the server before marking status as connected.
    };

    es.onerror = () => {
      setStatus('disconnected');
      es.close();
      esRef.current = null;
      // Retry after 5 s
      setTimeout(connect, 5000);
    };

    // Server sends this immediately after the SSE channel opens
    es.addEventListener('connected', () => {
      setStatus('connected');
    });

    // Full state snapshot from backend
    es.addEventListener('snapshot', (e) => {
      const snapshot = JSON.parse((e as MessageEvent).data) as LiveTimingState;
      stateRef.current = snapshot;
      setState(snapshot);
      setStatus('connected');
      setLastUpdate(new Date());
    });

    // Incremental topic update
    es.addEventListener('update', (e) => {
      const { topic, data } = JSON.parse((e as MessageEvent).data) as {
        topic: string;
        data: any;
        timestamp: string;
      };

      stateRef.current = {
        ...stateRef.current,
        [topic]: deepMerge((stateRef.current as any)[topic] ?? {}, data),
      };
      setState({ ...stateRef.current });
      setLastUpdate(new Date());
    });
  }, [apiBase]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, status, lastUpdate };
}
