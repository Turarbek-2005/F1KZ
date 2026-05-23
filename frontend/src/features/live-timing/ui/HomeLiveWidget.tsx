'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveTiming } from '../hooks/useLiveTiming';
import type { Stint } from '../types/timing.types';

type TimingAppLine = import('../types/timing.types').TimingAppLine;

const COMPOUND_SHORT: Record<string, string> = {
  SOFT: 'S', MEDIUM: 'M', HARD: 'H', INTERMEDIATE: 'I', WET: 'W',
};
const COMPOUND_COLORS: Record<string, string> = {
  SOFT: '#ef4444', MEDIUM: '#facc15', HARD: '#ffffff',
  INTERMEDIATE: '#4ade80', WET: '#60a5fa',
};

function getCurrentStint(appLine?: TimingAppLine): Stint | undefined {
  if (!appLine?.Stints) return undefined;
  const keys = Object.keys(appLine.Stints).map(Number).sort((a, b) => b - a);
  return keys.length > 0 ? appLine.Stints[String(keys[0])] : undefined;
}

export function HomeLiveWidget() {
  const { state, status } = useLiveTiming();

  const sessionActive =
    state.SessionStatus?.Status === 'Started' ||
    state.SessionStatus?.Status === 'Ends';

  const rows = useMemo(() => {
    if (!state.TimingData?.Lines) return [];
    return Object.entries(state.TimingData.Lines)
      .map(([num, line]) => ({
        num,
        line,
        driver: state.DriverList?.[num],
        stint: getCurrentStint(state.TimingAppData?.Lines?.[num]),
      }))
      .sort((a, b) => (a.line.Line ?? 99) - (b.line.Line ?? 99))
      .slice(0, 5);
  }, [state.TimingData, state.DriverList, state.TimingAppData]);

  // Don't render anything while connecting or when no active session
  if (status === 'connecting' || !sessionActive || rows.length === 0) return null;

  const sessionName = state.SessionInfo?.Name ?? 'Session';
  const meeting = state.SessionInfo?.Meeting?.Name ?? '';
  const lap = state.LapCount;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl"
      >
        <Link href="/live" className="block group">
          <div className="bg-black/70 backdrop-blur-sm border border-red-500/30 hover:border-red-500/60 transition-all duration-300 rounded-2xl px-5 py-4 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-red-500">Live</span>
                <span className="text-xs text-white/50 ml-1">
                  {meeting} · {sessionName}
                  {lap?.CurrentLap != null && lap.TotalLaps != null && (
                    <> · Lap {lap.CurrentLap}/{lap.TotalLaps}</>
                  )}
                </span>
              </div>
              <span className="text-xs text-white/40 group-hover:text-red-400 transition-colors">
                Full timing →
              </span>
            </div>

            {/* Top-5 rows */}
            <div className="space-y-1.5">
              {rows.map(({ num, line, driver, stint }) => {
                const teamColor = driver?.TeamColour ? `#${driver.TeamColour}` : '#666';
                const compound = stint?.Compound;
                const isLeader = line.Line === 1;

                return (
                  <div
                    key={num}
                    className="flex items-center gap-3 text-white text-sm"
                  >
                    {/* Position */}
                    <span className="w-5 text-right font-bold text-base tabular-nums text-white/80">
                      {line.Line}
                    </span>

                    {/* Team bar */}
                    <span
                      className="w-0.5 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: teamColor }}
                    />

                    {/* Driver */}
                    <span className="font-bold text-xs tracking-wider w-8 shrink-0">
                      {driver?.Tla ?? num}
                    </span>
                    <span className="text-white/50 text-xs truncate flex-1 hidden sm:block">
                      {driver?.BroadcastName}
                    </span>

                    {/* Tyre */}
                    {compound && (
                      <span
                        className="text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: COMPOUND_COLORS[compound] ?? '#888',
                          color: compound === 'MEDIUM' || compound === 'HARD' ? '#000' : '#fff',
                        }}
                      >
                        {COMPOUND_SHORT[compound] ?? '?'}
                      </span>
                    )}

                    {/* Gap / Last lap */}
                    <span className="font-mono tabular-nums text-xs text-white/60 w-20 text-right shrink-0">
                      {isLeader
                        ? (line.LastLapTime?.Value ?? '—')
                        : (line.GapToLeader ?? '—')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
