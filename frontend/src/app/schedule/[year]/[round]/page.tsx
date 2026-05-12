"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useGetRacesYearRoundQuery } from "@/entities/f1api/f1api";
import type {
  RaceRoundResponse,
  RaceSession,
} from "@/entities/f1api/f1api.interfaces";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import {
  Calendar,
  Clock,
  Loader2,
  ArrowLeft,
  MapPin,
  Flag,
  Activity,
  Timer,
  Zap,
  Trophy,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";

function toSingleString(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "long",
  });
}

function formatTime(time?: string) {
  if (!time) return "";
  return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isPast(date?: string, time?: string) {
  if (!date) return false;
  const dt = new Date(`${date}T${time ?? "00:00:00"}`);
  return dt < new Date();
}

type SessionConfig = {
  key: string;
  label: string;
  shortLabel: string;
  resultPath: string;
  icon: React.ReactNode;
  accent: string;
  borderColor: string;
  bgColor: string;
};

const SESSION_CONFIGS: SessionConfig[] = [
  {
    key: "fp1",
    label: "Practice 1",
    shortLabel: "FP1",
    resultPath: "fp1",
    icon: <Activity className="w-4 h-4" />,
    accent: "text-sky-500",
    borderColor: "border-sky-500",
    bgColor: "bg-sky-500/10",
  },
  {
    key: "fp2",
    label: "Practice 2",
    shortLabel: "FP2",
    resultPath: "fp2",
    icon: <Activity className="w-4 h-4" />,
    accent: "text-sky-500",
    borderColor: "border-sky-500",
    bgColor: "bg-sky-500/10",
  },
  {
    key: "sprintQualy",
    label: "Sprint Qualifying",
    shortLabel: "SQ",
    resultPath: "sprintQualy",
    icon: <Zap className="w-4 h-4" />,
    accent: "text-yellow-500",
    borderColor: "border-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    key: "fp3",
    label: "Practice 3",
    shortLabel: "FP3",
    resultPath: "fp3",
    icon: <Activity className="w-4 h-4" />,
    accent: "text-sky-500",
    borderColor: "border-sky-500",
    bgColor: "bg-sky-500/10",
  },
  {
    key: "sprintRace",
    label: "Sprint",
    shortLabel: "Sprint",
    resultPath: "sprintRace",
    icon: <Zap className="w-4 h-4" />,
    accent: "text-orange-500",
    borderColor: "border-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    key: "qualy",
    label: "Qualifying",
    shortLabel: "QUALI",
    resultPath: "qualyfying",
    icon: <Timer className="w-4 h-4" />,
    accent: "text-violet-500",
    borderColor: "border-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    key: "race",
    label: "Race",
    shortLabel: "RACE",
    resultPath: "race",
    icon: <Flag className="w-4 h-4" />,
    accent: "text-red-500",
    borderColor: "border-red-500",
    bgColor: "bg-red-500/10",
  },
];

function SessionCard({
  config,
  session,
  year,
  round,
  index,
}: {
  config: SessionConfig;
  session: RaceSession;
  year: string;
  round: string;
  index: number;
}) {
  const past = isPast(session.date, session.time);
  const isRace = config.key === "race";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className={cn(
        "relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border-l-4 p-5",
        "border border-border bg-card",
        config.borderColor,
        past && "opacity-60",
        isRace && "ring-1 ring-red-500/30",
      )}
    >
      {/* Session label */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
            config.bgColor,
            config.accent,
          )}
        >
          {config.icon}
        </div>
        <div>
          <div
            className={cn(
              "font-bold text-sm tracking-wide uppercase",
              config.accent,
            )}
          >
            {config.shortLabel}
          </div>
          <div className="font-semibold text-base">{config.label}</div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground sm:ml-auto">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          {formatDate(session.date)}
        </span>
        {session.time && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {formatTime(session.time)} UTC
          </span>
        )}
      </div>

      {/* Results button */}
      <Button
        variant={past ? "default" : "outline"}
        size="sm"
        asChild
        className="shrink-0 bg-red-600 hover:bg-red-700 border-0 text-white"
      >
        <Link href={`/results/${year}/${round}/${config.resultPath}`}>
          {past ? (
            <span className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              Results
            </span>
          ) : (
            "Upcoming"
          )}
        </Link>
      </Button>

      {past && (
        <span className="absolute top-2 right-2 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
          completed
        </span>
      )}
    </motion.div>
  );
}

export default function ScheduleYearRoundPage() {
  const params = useParams();
  const year = toSingleString(params?.year);
  const round = toSingleString(params?.round);
  const skip = !year || !round;

  const {
    data: race,
    isLoading,
    error,
  } = useGetRacesYearRoundQuery({ year: year!, round: round! }, { skip }) as {
    data?: RaceRoundResponse;
    isLoading: boolean;
    error: Error;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin h-10 w-10 text-red-500" />
      </div>
    );
  }

  if (error || skip) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Could not load race schedule.</p>
          <p className="text-sm text-muted-foreground">
            Please try again later.
          </p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/schedule">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Schedule
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const entry = race?.race[0];
  const schedule = entry?.schedule;

  const sessions = SESSION_CONFIGS.filter(
    (cfg) =>
      (schedule as Record<string, RaceSession | undefined>)?.[cfg.key]?.date,
  ).map((cfg) => ({
    config: cfg,
    session: (schedule as Record<string, RaceSession>)[cfg.key],
  }));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-linear-to-b from-red-950/40 via-background to-background border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent pointer-events-none" />

        <div className="container px-4 sm:px-6 mx-auto pt-10 pb-12 relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href="/schedule"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Schedule
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest bg-red-500/15 text-red-500 border border-red-500/30 rounded-full px-3 py-1">
                <Flag className="w-3 h-3" />
                Round {entry?.round} · {year}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              {entry?.raceName}
            </h1>

            {entry?.circuit && (
              <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-500" />
                  {entry.circuit.name}
                </span>
                {(entry.circuit.city || entry.circuit.country) && (
                  <span className="flex items-center gap-1.5">
                    <span className="text-border">·</span>
                    {[entry.circuit.city, entry.circuit.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
              </div>
            )}

            {entry?.date && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-red-500" />
                Race day: {formatDate(entry.date)}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Sessions */}
      <div className="container px-4 sm:px-6 mx-auto py-10 max-w-3xl">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5"
        >
          Weekend Schedule
        </motion.h2>

        <div className="flex flex-col gap-3">
          {sessions.map(({ config, session }, i) => (
            <SessionCard
              key={config.key}
              config={config}
              session={session}
              year={year!}
              round={round!}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
