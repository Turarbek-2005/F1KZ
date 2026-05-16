"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import {
  useGetLastRaceQuery,
  useGetRacesLastQuery,
} from "@/entities/f1api/f1api";
import {
  fetchDrivers,
  selectAllDrivers,
} from "@/entities/f1/model/driversSlice";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import type { RootState } from "@/shared/store";
import type { LastNextRacesResponse } from "@/entities/f1api/f1api.interfaces";
import { Skeleton } from "@/shared/ui/skeleton";

type RaceResultRow = {
  driver: { driverId: string; name: string; surname: string };
  team: { teamId: string; teamName: string };
  position: number;
  time?: string;
  points: number;
};

function teamVar(teamId?: string) {
  if (!teamId) return undefined;
  return `var(--team-${teamId.toLowerCase().replace(" ", "_")})`;
}

const PODIUM_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

function PodiumSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4 shadow-xl"
    >
      <Skeleton className="h-3 w-32 mb-3" />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </motion.div>
  );
}

export function LastRaceWidget() {
  const dispatch = useAppDispatch();
  const driversList = useAppSelector(selectAllDrivers);
  const driversStatus = useAppSelector((s: RootState) => s.drivers.status);

  useEffect(() => {
    if (driversStatus === "idle") dispatch(fetchDrivers());
  }, [dispatch, driversStatus]);

  const { data: raceMeta, isLoading: metaLoading } = useGetRacesLastQuery() as {
    data?: LastNextRacesResponse;
    isLoading: boolean;
  };

  const { data: resultsData, isLoading: resultsLoading } = useGetLastRaceQuery() as {
    data?: { races?: { results?: RaceResultRow[] } };
    isLoading: boolean;
  };

  if (metaLoading || resultsLoading) return <PodiumSkeleton />;

  const results = resultsData?.races?.results ?? [];
  const top3 = results
    .slice()
    .sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
    .slice(0, 3);

  if (top3.length === 0) return null;

  const race = raceMeta?.race?.[0];
  const country = race?.circuit?.country ?? "";
  const round = raceMeta?.round;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="w-full max-w-4xl"
    >
      <Link
        href={`/results/${new Date().getFullYear()}/${round}/race`}
        className="block"
      >
        <div className="bg-black/60 backdrop-blur-sm border border-white/10 hover:border-yellow-500/50 transition-colors duration-300 rounded-2xl px-6 py-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <p className="text-xs uppercase tracking-widest text-gray-400">
                Last Race · Round {round} · {country}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {top3.map((r, i) => {
              const meta = driversList.find((d) => d.driverId === r.driver.driverId);
              return (
                <div
                  key={r.driver.driverId}
                  className="relative rounded-xl overflow-hidden h-24 sm:h-28 flex items-end p-3"
                  style={{
                    background: teamVar(r.team.teamId) ?? "rgba(255,255,255,0.05)",
                  }}
                >
                  <span
                    className="absolute top-1.5 right-2 text-2xl sm:text-3xl font-extrabold leading-none"
                    style={{ color: PODIUM_COLORS[i] }}
                  >
                    {r.position}
                  </span>
                  <div className="relative z-10 min-w-0">
                    <p className="text-[10px] sm:text-xs text-white/70 uppercase">
                      {r.driver.name?.[0]}. {r.driver.surname}
                    </p>
                    <p className="text-[10px] text-white/60 truncate">
                      {r.team.teamName}
                    </p>
                  </div>
                  {meta?.imgUrl && (
                    <div className="absolute bottom-0 right-0 w-16 h-20 sm:w-20 sm:h-24 overflow-hidden opacity-90">
                      <Image
                        src={meta.imgUrl}
                        alt={r.driver.surname}
                        width={80}
                        height={96}
                        className="object-cover object-top w-full h-full"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
