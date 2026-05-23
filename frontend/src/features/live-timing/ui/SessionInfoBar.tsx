'use client';

import type { SessionInfo, LapCount, ExtrapolatedClock, SessionStatus } from '../types/timing.types';
import { Flag } from 'lucide-react';

interface Props {
  sessionInfo?: SessionInfo;
  lapCount?: LapCount;
  clock?: ExtrapolatedClock;
  sessionStatus?: SessionStatus;
}

function formatRemaining(remaining?: string) {
  if (!remaining) return null;
  // Format: "1:23:45.000" → "1:23:45"
  return remaining.split('.')[0];
}

export function SessionInfoBar({ sessionInfo, lapCount, clock, sessionStatus }: Props) {
  const meeting = sessionInfo?.Meeting;
  const isActive = sessionStatus?.Status === 'Started';
  const isFinished = sessionStatus?.Status === 'Finished' || sessionStatus?.Status === 'Ends';

  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-card border rounded-xl text-sm">
      <div className="flex items-center gap-2">
        <Flag className="w-4 h-4 text-red-500" />
        <span className="font-semibold">
          {meeting?.OfficialName ?? meeting?.Name ?? 'F1 Live Timing'}
        </span>
      </div>

      {meeting?.Location && (
        <span className="text-muted-foreground">{meeting.Location}</span>
      )}

      {sessionInfo?.Name && (
        <span className="uppercase tracking-widest text-xs font-medium px-2 py-0.5 rounded bg-muted">
          {sessionInfo.Name}
        </span>
      )}

      {/* Lap counter */}
      {lapCount?.CurrentLap != null && lapCount.TotalLaps != null && (
        <span className="font-mono font-semibold">
          Lap {lapCount.CurrentLap} / {lapCount.TotalLaps}
        </span>
      )}

      {/* Remaining time */}
      {clock?.Remaining && (
        <span className="font-mono tabular-nums text-muted-foreground">
          {formatRemaining(clock.Remaining)}
        </span>
      )}

      <div className="ml-auto flex items-center gap-2">
        {isActive && (
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-red-500">Live</span>
          </span>
        )}
        {isFinished && (
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Finished
          </span>
        )}
      </div>
    </div>
  );
}
