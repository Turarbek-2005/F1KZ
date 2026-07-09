'use client';

import { motion } from 'framer-motion';
import { RefreshCw, WifiOff, Radio, History } from 'lucide-react';
import { useLiveTiming } from '@/features/live-timing/hooks/useLiveTiming';
import { SessionInfoBar } from '@/features/live-timing/ui/SessionInfoBar';
import { TrackStatusBanner } from '@/features/live-timing/ui/TrackStatusBanner';
import { TimingTower } from '@/features/live-timing/ui/TimingTower';
import { WeatherWidget } from '@/features/live-timing/ui/WeatherWidget';
import { RaceControlFeed } from '@/features/live-timing/ui/RaceControlFeed';

function ConnectionBadge({ status }: { status: string }) {
  if (status === 'connected') return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {status === 'connecting' ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Connecting to F1 Live Timing...</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-400" />
          <span>Disconnected — reconnecting...</span>
        </>
      )}
    </div>
  );
}

function LastRaceBanner({ sessionName }: { sessionName?: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 border rounded-xl text-sm text-muted-foreground">
      <History className="w-4 h-4 shrink-0" />
      <span>
        No live session right now — showing data from the last race
        {sessionName ? ` (${sessionName})` : ''}.
      </span>
    </div>
  );
}

function NoSessionScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <Radio className="w-8 h-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">No Live Session</h2>
        <p className="text-muted-foreground max-w-sm">
          There is no active Formula 1 session right now. Come back during a race
          weekend to see live timing data.
        </p>
      </div>
      <p className="text-xs text-muted-foreground/60">
        Data sourced from OpenF1 (api.openf1.org)
      </p>
    </div>
  );
}

export default function LivePage() {
  const { state, status, lastUpdate } = useLiveTiming();

  // Show whatever data we receive — even when the session isn't live, we still
  // render the latest session's timing. Only fall back to the empty screen when
  // there are genuinely no rows to display.
  const hasTimingData =
    Object.keys(state.TimingData?.Lines ?? {}).length > 0;
  const isLive = state.SessionStatus?.Status === 'Started';

  return (
    <div className="container px-4 sm:px-0 mx-auto pb-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-4 space-y-4"
      >
        {/* Header row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-3xl font-bold">Live Timing</h1>
          <div className="flex items-center gap-3">
            <ConnectionBadge status={status} />
            {lastUpdate && (
              <span className="text-xs text-muted-foreground tabular-nums">
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Session info bar */}
        <SessionInfoBar
          sessionInfo={state.SessionInfo}
          lapCount={state.LapCount}
          clock={state.ExtrapolatedClock}
          sessionStatus={state.SessionStatus}
        />

        {/* Track status banner (only when not green) */}
        <TrackStatusBanner trackStatus={state.TrackStatus} />

        {/* Last-race notice when there's data but no live session */}
        {hasTimingData && !isLive && (
          <LastRaceBanner sessionName={state.SessionInfo?.Name} />
        )}

        {/* Main content */}
        {!hasTimingData && status !== 'connecting' ? (
          <NoSessionScreen />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-4">
            {/* Timing tower — main column */}
            <div className="space-y-4">
              <TimingTower
                timingData={state.TimingData}
                timingAppData={state.TimingAppData}
                driverList={state.DriverList}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <WeatherWidget weather={state.WeatherData} />
              <RaceControlFeed messages={state.RaceControlMessages} />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
