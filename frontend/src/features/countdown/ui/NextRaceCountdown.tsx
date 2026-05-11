"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useGetRacesNextQuery } from "@/entities/f1api/f1api";
import type { LastNextRacesResponse } from "@/entities/f1api/f1api.interfaces";
import { Skeleton } from "@/shared/ui/skeleton";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(targetDate: Date): TimeLeft {
  const diff = targetDate.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function CountdownSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="w-full max-w-4xl"
    >
      <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-52" />
          </div>
          <div className="flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Skeleton className="h-9 w-10" />
                <Skeleton className="h-2 w-7" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function NextRaceCountdown() {
  const { data, isLoading } = useGetRacesNextQuery() as {
    data?: LastNextRacesResponse;
    isLoading: boolean;
  };

  const nextRace = data?.race?.[0];
  const raceDate = nextRace?.schedule?.race?.date;
  const raceTime = nextRace?.schedule?.race?.time;

  const target = raceDate
    ? new Date(`${raceDate}T${raceTime ?? "00:00:00"}`)
    : null;

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(
    target ? calcTimeLeft(target) : null
  );

  useEffect(() => {
    if (!target) return;
    setTimeLeft(calcTimeLeft(target));
    const id = setInterval(() => setTimeLeft(calcTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [raceDate, raceTime]);

  if (isLoading) return <CountdownSkeleton />;
  if (!nextRace || !target || !timeLeft) return null;

  const isOver = Object.values(timeLeft).every((v) => v === 0);
  const country = nextRace.circuit?.country ?? "";
  const city =
    nextRace.circuit?.city && nextRace.circuit.city !== country
      ? nextRace.circuit.city
      : "";
  const location = [country, city].filter(Boolean).join(" · ");
  const round = data?.round;

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="w-full max-w-4xl"
    >
      <Link href={`/schedule/${new Date(raceDate!).getFullYear()}/${round}`}>
        <div className="bg-black/60 backdrop-blur-sm border border-white/10 hover:border-red-500/50 transition-colors duration-300 rounded-2xl px-6 py-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                Next Race · Round {round}
              </p>
              <p className="text-lg font-bold text-white leading-tight">
                {location}
              </p>
              <p className="text-sm text-gray-400">{nextRace.raceName}</p>
            </div>

            {isOver ? (
              <p className="text-red-400 font-semibold text-sm uppercase tracking-wide">
                Race in progress
              </p>
            ) : (
              <div className="flex gap-3">
                {units.map(({ label, value }) => (
                  <div key={label} className="flex flex-col items-center">
                    <span className="text-2xl sm:text-3xl font-extrabold tabular-nums text-white leading-none">
                      {pad(value)}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
