"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { skipToken } from "@reduxjs/toolkit/query/react";
import {
  useGetDriverByIdQuery,
  useGetDriversQuery,
  useGetStandingsDriversQuery,
} from "@/entities/f1api/f1api";
import type {
  ApiDriver,
  DriverByIdResponse,
  DriversResponse,
  DriversStandingsResponse,
  DriverResultEntry,
} from "@/entities/f1api/f1api.interfaces";
import {
  fetchDrivers,
  selectAllDrivers,
} from "@/entities/f1/model/driversSlice";
import type { Driver } from "@/entities/f1/types/f1.types";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import type { RootState } from "@/shared/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { grapeNuts } from "@/app/fonts";

function safeTeamVar(teamId?: string) {
  if (!teamId) return undefined;
  return `var(--team-${teamId.toLowerCase().replace(" ", "_")})`;
}

function calcStats(results: DriverResultEntry[]) {
  const races = results.length;
  const wins = results.filter((r) => r.result?.finishingPosition == 1).length;
  const podiums = results.filter(
    (r) =>
      Number(r.result?.finishingPosition) >= 1 &&
      Number(r.result?.finishingPosition) <= 3
  ).length;
  const dnfs = results.filter(
    (r) =>
      r.result?.finishingPosition === "DNF" ||
      r.result?.finishingPosition === "DNS"
  ).length;
  const bestFinish = results.reduce<number | null>((best, r) => {
    const pos = Number(r.result?.finishingPosition);
    if (!isNaN(pos) && pos > 0 && (best === null || pos < best)) return pos;
    return best;
  }, null);
  return { races, wins, podiums, dnfs, bestFinish };
}

interface StatRowProps {
  label: string;
  valA: string | number;
  valB: string | number;
  higherIsBetter?: boolean;
}

function StatRow({ label, valA, valB, higherIsBetter = true }: StatRowProps) {
  const a = Number(valA);
  const b = Number(valB);
  const aWins =
    !isNaN(a) && !isNaN(b) && a !== b && (higherIsBetter ? a > b : a < b);
  const bWins =
    !isNaN(a) && !isNaN(b) && a !== b && (higherIsBetter ? b > a : b < a);

  return (
    <div className="grid grid-cols-3 items-center py-3 border-b border-white/8 last:border-0">
      <span
        className={cn(
          "text-sm sm:text-base font-bold text-right pr-3 sm:pr-6 tabular-nums",
          aWins && "text-red-400"
        )}
      >
        {valA}
      </span>
      <span className="text-[10px] sm:text-xs text-center text-gray-400 uppercase tracking-wide px-1">
        {label}
      </span>
      <span
        className={cn(
          "text-sm sm:text-base font-bold text-left pl-3 sm:pl-6 tabular-nums",
          bWins && "text-red-400"
        )}
      >
        {valB}
      </span>
    </div>
  );
}

function DriverCardSkeleton() {
  return (
    <div className="relative rounded-xl overflow-hidden h-52 sm:h-64 md:h-72 p-4 flex flex-col justify-between bg-white/5">
      <div className="flex flex-col gap-2 z-10 relative">
        <Skeleton className="h-5 sm:h-7 w-24 sm:w-32" />
        <Skeleton className="h-5 sm:h-7 w-32 sm:w-40" />
        <Skeleton className="h-3 sm:h-4 w-20 mt-1" />
        <Skeleton className="h-8 sm:h-10 w-14 mt-2" />
      </div>
      <div className="flex items-center gap-2 z-10 relative">
        <Skeleton className="h-6 w-6 sm:h-7 sm:w-7 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="absolute bottom-0 right-[10%] sm:right-[8%] w-28 sm:w-36 md:w-44 h-44 sm:h-56 md:h-68">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
    </div>
  );
}

interface DriverCardProps {
  apiData: DriverByIdResponse;
  meta?: Driver;
  standing?: { position?: number; points?: number };
}

function DriverCard({ apiData, meta, standing }: DriverCardProps) {
  const teamId = apiData.team?.teamId ?? apiData.driver?.teamId ?? meta?.teamId ?? "";
  const imgUrl = meta?.imgUrl ?? apiData.driver?.imgUrl;
  const nationalityImgUrl = meta?.nationalityImgUrl ?? apiData.driver?.nationalityImgUrl;
  const nationality = meta?.nationality ?? apiData.driver?.nationality;

  return (
    <div
      className="relative rounded-xl overflow-hidden h-52 sm:h-64 md:h-72 cursor-default p-4 flex flex-col justify-between"
      style={{ background: safeTeamVar(teamId) ?? "rgba(255,255,255,0.05)" }}
    >
      <div className="flex flex-col z-10 relative">
        <span className="text-lg sm:text-2xl font-bold leading-tight text-white drop-shadow">
          {apiData.driver?.name}
        </span>
        <span className="text-lg sm:text-2xl font-bold leading-tight text-white drop-shadow">
          {apiData.driver?.surname}
        </span>
        <span className="text-xs sm:text-sm text-white/70 mt-0.5">
          {apiData.team?.teamName}
        </span>
        <span
          className={cn(
            grapeNuts.className,
            "text-3xl sm:text-4xl font-medium mt-1 text-white"
          )}
        >
          {apiData.driver?.number}
        </span>
      </div>

      <div className="flex items-center gap-2 z-10 relative">
        {nationalityImgUrl && (
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border-2 border-white/60 shrink-0">
            <Image
              src={nationalityImgUrl}
              alt="flag"
              width={28}
              height={28}
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <span className="text-xs text-white/70">{nationality}</span>
        {standing?.position && (
          <span className="ml-auto text-xs text-white/60">
            P{standing.position} · {standing.points} pts
          </span>
        )}
      </div>

      {imgUrl && (
        <div className="w-28 sm:w-36 md:w-44 h-44 sm:h-56 md:h-68 overflow-hidden absolute bottom-0 right-[10%] sm:right-[8%]">
          <Image
            src={imgUrl}
            alt={apiData.driver?.surname ?? "driver"}
            width={176}
            height={272}
            className="object-cover object-top w-full h-full"
          />
        </div>
      )}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur rounded-2xl px-4 sm:px-6 py-4 shadow-lg">
      <div className="flex justify-center mb-2">
        <Skeleton className="h-3 w-32" />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-3 items-center py-3 border-b border-white/8 last:border-0"
        >
          <div className="flex justify-end pr-3 sm:pr-6">
            <Skeleton className="h-4 sm:h-5 w-8" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex justify-start pl-3 sm:pl-6">
            <Skeleton className="h-4 sm:h-5 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ComparePage() {
  const dispatch = useAppDispatch();
  const drivers = useAppSelector(selectAllDrivers);
  const driversStatus = useAppSelector((s: RootState) => s.drivers.status);

  const [driverAId, setDriverAId] = useState<string>("");
  const [driverBId, setDriverBId] = useState<string>("");

  useEffect(() => {
    if (driversStatus === "idle") dispatch(fetchDrivers());
  }, [dispatch, driversStatus]);

  const { data: driversApi } = useGetDriversQuery() as {
    data?: DriversResponse;
  };
  const apiDrivers: ApiDriver[] = driversApi?.drivers ?? [];

  const { data: standingsData } = useGetStandingsDriversQuery() as {
    data?: DriversStandingsResponse;
  };

  const { data: driverAData, isFetching: fetchingA } = useGetDriverByIdQuery(
    driverAId || skipToken
  ) as { data?: DriverByIdResponse; isFetching: boolean };

  const { data: driverBData, isFetching: fetchingB } = useGetDriverByIdQuery(
    driverBId || skipToken
  ) as { data?: DriverByIdResponse; isFetching: boolean };

  const standings = standingsData?.drivers_championship ?? [];
  const standingA = standings.find((s) => s.driverId === driverAId);
  const standingB = standings.find((s) => s.driverId === driverBId);

  const driverAMeta = drivers.find((d) => d.driverId === driverAId);
  const driverBMeta = drivers.find((d) => d.driverId === driverBId);

  const statsA = driverAData ? calcStats(driverAData.results ?? []) : null;
  const statsB = driverBData ? calcStats(driverBData.results ?? []) : null;

  const driversListLoading =
    driversStatus === "idle" || driversStatus === "loading";

  const showACard = !!driverAId;
  const showBCard = !!driverBId;
  const cardALoading = showACard && (fetchingA || !driverAData);
  const cardBLoading = showBCard && (fetchingB || !driverBData);
  const showStats =
    showACard &&
    showBCard &&
    !cardALoading &&
    !cardBLoading &&
    statsA &&
    statsB;
  const statsLoading =
    showACard && showBCard && (cardALoading || cardBLoading);

  return (
    <div className="container px-4 sm:px-0 mx-auto pb-10">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl sm:text-4xl font-extrabold mt-4 mb-6 sm:mb-8"
      >
        Driver Comparison
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8"
      >
        <div>
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-400 mb-1.5">
            Driver A
          </p>
          {driversListLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select value={driverAId} onValueChange={setDriverAId}>
              <SelectTrigger className="text-xs sm:text-sm">
                <SelectValue placeholder="Select driver..." />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((d) => {
                  const apiD = apiDrivers.find(
                    (a) => a.driverId === d.driverId
                  );
                  const label = apiD
                    ? `${apiD.name ?? ""} ${apiD.surname ?? ""}`.trim()
                    : d.driverId;
                  return (
                    <SelectItem
                      key={d.driverId}
                      value={d.driverId}
                      disabled={d.driverId === driverBId}
                    >
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-400 mb-1.5">
            Driver B
          </p>
          {driversListLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select value={driverBId} onValueChange={setDriverBId}>
              <SelectTrigger className="text-xs sm:text-sm">
                <SelectValue placeholder="Select driver..." />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((d) => {
                  const apiD = apiDrivers.find(
                    (a) => a.driverId === d.driverId
                  );
                  const label = apiD
                    ? `${apiD.name ?? ""} ${apiD.surname ?? ""}`.trim()
                    : d.driverId;
                  return (
                    <SelectItem
                      key={d.driverId}
                      value={d.driverId}
                      disabled={d.driverId === driverAId}
                    >
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        </div>
      </motion.div>

      {!showACard && !showBCard && !driversListLoading && (
        <p className="text-center text-gray-400 mt-16 text-base sm:text-lg">
          Select two drivers to compare their stats
        </p>
      )}

      {(showACard || showBCard) && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {showACard ? (
              cardALoading ? (
                <DriverCardSkeleton />
              ) : (
                <DriverCard
                  apiData={driverAData!}
                  meta={driverAMeta}
                  standing={standingA}
                />
              )
            ) : (
              <div className="rounded-xl border border-dashed border-white/15 h-52 sm:h-64 md:h-72 flex items-center justify-center text-xs sm:text-sm text-gray-500">
                Pick driver A
              </div>
            )}

            {showBCard ? (
              cardBLoading ? (
                <DriverCardSkeleton />
              ) : (
                <DriverCard
                  apiData={driverBData!}
                  meta={driverBMeta}
                  standing={standingB}
                />
              )
            ) : (
              <div className="rounded-xl border border-dashed border-white/15 h-52 sm:h-64 md:h-72 flex items-center justify-center text-xs sm:text-sm text-gray-500">
                Pick driver B
              </div>
            )}
          </div>

          {statsLoading && <StatsSkeleton />}

          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/5 backdrop-blur rounded-2xl px-4 sm:px-6 py-4 shadow-lg"
            >
              <h3 className="text-center text-[10px] sm:text-xs uppercase tracking-widest text-gray-400 mb-2">
                Season {driverAData!.season} Stats
              </h3>

              <StatRow
                label="Position"
                valA={standingA?.position ?? "—"}
                valB={standingB?.position ?? "—"}
                higherIsBetter={false}
              />
              <StatRow
                label="Points"
                valA={standingA?.points ?? 0}
                valB={standingB?.points ?? 0}
              />
              <StatRow label="Wins" valA={statsA!.wins} valB={statsB!.wins} />
              <StatRow
                label="Podiums"
                valA={statsA!.podiums}
                valB={statsB!.podiums}
              />
              <StatRow
                label="Races"
                valA={statsA!.races}
                valB={statsB!.races}
              />
              <StatRow
                label="Best Finish"
                valA={statsA!.bestFinish ?? "—"}
                valB={statsB!.bestFinish ?? "—"}
                higherIsBetter={false}
              />
              <StatRow
                label="DNFs"
                valA={statsA!.dnfs}
                valB={statsB!.dnfs}
                higherIsBetter={false}
              />
              <StatRow
                label="Number"
                valA={driverAData!.driver?.number ?? "—"}
                valB={driverBData!.driver?.number ?? "—"}
                higherIsBetter={false}
              />
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
