'use client';

import { useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import type {
  TimingData,
  TimingAppData,
  DriverInfo,
  TimingLine,
  Stint,
} from '../types/timing.types';

interface Props {
  timingData?: TimingData;
  timingAppData?: TimingAppData;
  driverList?: Record<string, DriverInfo>;
}

const COMPOUND_COLORS: Record<string, string> = {
  SOFT: 'bg-red-500 text-white',
  MEDIUM: 'bg-yellow-400 text-black',
  HARD: 'bg-white text-black',
  INTERMEDIATE: 'bg-green-400 text-black',
  WET: 'bg-blue-500 text-white',
  UNKNOWN: 'bg-muted text-muted-foreground',
};

const COMPOUND_SHORT: Record<string, string> = {
  SOFT: 'S',
  MEDIUM: 'M',
  HARD: 'H',
  INTERMEDIATE: 'I',
  WET: 'W',
  UNKNOWN: '?',
};

function getCurrentStint(appLine?: TimingAppLine): Stint | undefined {
  if (!appLine?.Stints) return undefined;
  const keys = Object.keys(appLine.Stints).map(Number).sort((a, b) => b - a);
  return keys.length > 0 ? appLine.Stints[String(keys[0])] : undefined;
}

type TimingAppLine = import('../types/timing.types').TimingAppLine;

function LapTimeBadge({
  value,
  fastest,
  personal,
}: {
  value?: string;
  fastest?: boolean;
  personal?: boolean;
}) {
  if (!value) return <span className="text-muted-foreground/40">—</span>;
  return (
    <span
      className={cn(
        'font-mono tabular-nums text-xs',
        fastest && 'text-purple-400 font-bold',
        personal && !fastest && 'text-green-400',
        !fastest && !personal && 'text-foreground'
      )}
    >
      {value}
    </span>
  );
}

function IntervalValue({ line }: { line: TimingLine }) {
  const val = line.IntervalToPositionAhead;
  if (!val) return <span className="text-muted-foreground/40">—</span>;
  const text = typeof val === 'object' ? val.Value : val;
  return <span className="font-mono tabular-nums text-xs">{text}</span>;
}

export function TimingTower({ timingData, timingAppData, driverList }: Props) {
  const rows = useMemo(() => {
    if (!timingData?.Lines) return [];

    return Object.entries(timingData.Lines)
      .map(([racingNumber, line]) => {
        const driver = driverList?.[racingNumber];
        const appLine = timingAppData?.Lines?.[racingNumber];
        const stint = getCurrentStint(appLine);
        return { racingNumber, line, driver, stint };
      })
      .sort((a, b) => (a.line.Line ?? 99) - (b.line.Line ?? 99));
  }, [timingData, timingAppData, driverList]);

  if (rows.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-12">
        Waiting for timing data...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-[10px] uppercase tracking-widest text-muted-foreground">
            <th className="py-2 px-3 text-left w-8">Pos</th>
            <th className="py-2 px-3 text-left">Driver</th>
            <th className="py-2 px-3 text-right">Gap</th>
            <th className="py-2 px-3 text-right">Interval</th>
            <th className="py-2 px-3 text-right">Last Lap</th>
            <th className="py-2 px-3 text-right">Best Lap</th>
            <th className="py-2 px-3 text-center">Tyre</th>
            <th className="py-2 px-3 text-right">Laps</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ racingNumber, line, driver, stint }, idx) => {
            const teamColor = driver?.TeamColour ? `#${driver.TeamColour}` : undefined;
            const isRetired = line.Retired;
            const isStopped = line.Stopped;
            const isOut = isRetired || isStopped;
            const isInPit = line.InPit;
            const isPitOut = line.PitOut;

            return (
              <tr
                key={racingNumber}
                className={cn(
                  'border-b last:border-0 transition-colors',
                  idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/20',
                  isOut && 'opacity-50'
                )}
              >
                {/* Position */}
                <td className="py-2 px-3">
                  {isOut ? (
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-black tracking-wider">
                      OUT
                    </span>
                  ) : (
                    <span className="font-bold text-base tabular-nums">
                      {line.Line ?? line.Position ?? '—'}
                    </span>
                  )}
                </td>

                {/* Driver */}
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {teamColor && (
                      <span
                        className="inline-block w-0.5 h-5 rounded-full shrink-0"
                        style={{ backgroundColor: teamColor }}
                      />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs tracking-wider">
                          {driver?.Tla ?? racingNumber}
                        </span>
                        <span className="text-[10px] text-muted-foreground hidden sm:inline truncate">
                          {driver?.BroadcastName ?? driver?.FullName}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground/60">
                          #{racingNumber}
                        </span>
                      </div>
                      {isOut ? (
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-red-400">
                          {isStopped ? 'Stopped' : 'Retired'}
                        </span>
                      ) : (isInPit || isPitOut) ? (
                        <span
                          className={cn(
                            'text-[9px] font-semibold uppercase tracking-wider',
                            isPitOut ? 'text-green-400' : 'text-orange-400'
                          )}
                        >
                          {isPitOut ? 'Pit Out' : 'In Pit'}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </td>

                {/* Gap to leader */}
                <td className="py-2 px-3 text-right font-mono tabular-nums text-xs">
                  {idx === 0 ? (
                    <span className="text-muted-foreground/40">Leader</span>
                  ) : (
                    line.GapToLeader || <span className="text-muted-foreground/40">—</span>
                  )}
                </td>

                {/* Interval */}
                <td className="py-2 px-3 text-right">
                  {idx === 0 ? (
                    <span className="text-muted-foreground/40">—</span>
                  ) : (
                    <IntervalValue line={line} />
                  )}
                </td>

                {/* Last lap */}
                <td className="py-2 px-3 text-right">
                  <LapTimeBadge
                    value={line.LastLapTime?.Value}
                    fastest={line.LastLapTime?.OverallFastest}
                    personal={line.LastLapTime?.PersonalFastest}
                  />
                </td>

                {/* Best lap */}
                <td className="py-2 px-3 text-right">
                  <LapTimeBadge value={line.BestLapTime?.Value} />
                </td>

                {/* Tyre */}
                <td className="py-2 px-3 text-center">
                  {stint?.Compound ? (
                    <span
                      className={cn(
                        'inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black',
                        COMPOUND_COLORS[stint.Compound] ?? COMPOUND_COLORS.UNKNOWN
                      )}
                    >
                      {COMPOUND_SHORT[stint.Compound] ?? '?'}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/40 text-xs">—</span>
                  )}
                </td>

                {/* Laps */}
                <td className="py-2 px-3 text-right font-mono tabular-nums text-xs text-muted-foreground">
                  {line.NumberOfLaps ?? '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
