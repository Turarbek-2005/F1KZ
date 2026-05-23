'use client';

import { cn } from '@/shared/lib/utils';
import type { TrackStatus, TrackStatusCode } from '../types/timing.types';

interface Props {
  trackStatus?: TrackStatus;
}

const STATUS_CONFIG: Record<
  TrackStatusCode,
  { label: string; bg: string; text: string; border: string }
> = {
  '1': { label: 'Green Flag', bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
  '2': { label: 'Yellow Flag', bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/30' },
  '3': { label: 'Flag', bg: 'bg-yellow-400/10', text: 'text-yellow-400', border: 'border-yellow-400/30' },
  '4': { label: 'Safety Car', bg: 'bg-yellow-400/15', text: 'text-yellow-400', border: 'border-yellow-400/40' },
  '5': { label: 'Red Flag', bg: 'bg-red-600/15', text: 'text-red-500', border: 'border-red-500/40' },
  '6': { label: 'Virtual Safety Car', bg: 'bg-yellow-300/10', text: 'text-yellow-300', border: 'border-yellow-300/30' },
  '7': { label: 'VSC Ending', bg: 'bg-yellow-200/10', text: 'text-yellow-200', border: 'border-yellow-200/30' },
};

export function TrackStatusBanner({ trackStatus }: Props) {
  if (!trackStatus) return null;

  const code = trackStatus.Status as TrackStatusCode;
  const cfg = STATUS_CONFIG[code] ?? STATUS_CONFIG['1'];

  // Don't show anything for green flag (clean state)
  if (code === '1') return null;

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-3 py-2 px-4 rounded-xl border font-semibold tracking-wide uppercase text-sm',
        cfg.bg,
        cfg.text,
        cfg.border
      )}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', cfg.text.replace('text', 'bg'))} />
        <span className={cn('relative inline-flex rounded-full h-2.5 w-2.5', cfg.text.replace('text', 'bg'))} />
      </span>
      {cfg.label}
      {trackStatus.Message && trackStatus.Message !== cfg.label && (
        <span className="text-xs opacity-75 normal-case tracking-normal font-normal">
          — {trackStatus.Message}
        </span>
      )}
    </div>
  );
}
