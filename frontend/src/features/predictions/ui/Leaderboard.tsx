"use client";

import Link from "next/link";
import { Crown, Loader2, Medal } from "lucide-react";
import { useGetLeaderboardQuery } from "@/entities/predictions/predictionsApi";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { cn } from "@/shared/lib/utils";

const MAX_PTS_PER_RACE = 15;

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return <Crown className="w-4 h-4 text-yellow-400" aria-label="1st" />;
  if (rank === 2)
    return <Medal className="w-4 h-4 text-gray-300" aria-label="2nd" />;
  if (rank === 3)
    return <Medal className="w-4 h-4 text-amber-600" aria-label="3rd" />;
  return (
    <span className="text-xs text-muted-foreground tabular-nums">{rank}</span>
  );
}

// Ranked list of players by prediction points. Every row links to that
// player's public profile.
export function PredictionsLeaderboard({
  currentUserId,
}: {
  currentUserId?: number;
}) {
  const { data: rows, isLoading, isError } = useGetLeaderboardQuery();

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur rounded-2xl p-6 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading leaderboard...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white/5 backdrop-blur rounded-2xl p-6 text-center text-sm text-muted-foreground">
        Could not load the leaderboard.
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur rounded-2xl p-6 text-center text-sm text-muted-foreground">
        No scored predictions yet — be the first on the board!
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur rounded-2xl overflow-hidden">
      <div className="grid grid-cols-[2.5rem_1fr_4rem_4.5rem] sm:grid-cols-[3rem_1fr_5rem_5rem_5rem] items-center gap-2 px-4 py-2.5 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-white/10">
        <span>#</span>
        <span>Player</span>
        <span className="text-right">Points</span>
        <span className="text-right hidden sm:block">Races</span>
        <span className="text-right">Accuracy</span>
      </div>

      {rows.map((row, i) => {
        const rank = i + 1;
        const accuracy =
          row.scored > 0
            ? Math.round((row.points / (row.scored * MAX_PTS_PER_RACE)) * 100)
            : 0;
        const isMe = row.userId === currentUserId;

        return (
          <Link
            key={row.userId}
            href={`/users/${row.userId}`}
            className={cn(
              "grid grid-cols-[2.5rem_1fr_4rem_4.5rem] sm:grid-cols-[3rem_1fr_5rem_5rem_5rem] items-center gap-2 px-4 py-3 border-b border-white/5 last:border-b-0 transition hover:bg-white/10",
              isMe && "bg-red-500/10 hover:bg-red-500/15"
            )}
          >
            <span className="flex items-center">
              <RankBadge rank={rank} />
            </span>
            <span className="flex items-center gap-2.5 min-w-0">
              <UserAvatar
                src={row.avatarUrl}
                name={row.username}
                className="w-8 h-8 text-xs"
              />
              <span className="text-sm font-semibold truncate">
                {row.username}
                {isMe && (
                  <span className="ml-1.5 text-[10px] font-normal text-red-400">
                    you
                  </span>
                )}
              </span>
            </span>
            <span className="text-right text-sm font-bold text-red-400 tabular-nums">
              {row.points}
            </span>
            <span className="text-right text-sm text-muted-foreground tabular-nums hidden sm:block">
              {row.scored}
            </span>
            <span className="text-right text-sm text-muted-foreground tabular-nums">
              {accuracy}%
            </span>
          </Link>
        );
      })}
    </div>
  );
}
