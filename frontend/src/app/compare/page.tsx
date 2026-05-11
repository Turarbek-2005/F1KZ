"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { Loader2 } from "lucide-react";
import {
  useGetDriversQuery,
  useGetDriverByIdQuery,
  useGetStandingsDriversQuery,
} from "@/entities/f1api/f1api";
import type {
  DriversResponse,
  DriverByIdResponse,
  DriversStandingsResponse,
  DriverResultEntry,
} from "@/entities/f1api/f1api.interfaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
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
  const aWins = !isNaN(a) && !isNaN(b) && a !== b && (higherIsBetter ? a > b : a < b);
  const bWins = !isNaN(a) && !isNaN(b) && a !== b && (higherIsBetter ? b > a : b < a);

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

interface DriverCardProps {
  apiData: DriverByIdResponse;
  imgUrl?: string;
  nationalityImgUrl?: string;
  nationality?: string;
  standing?: { position?: number; points?: number };
}

function DriverCard({
  apiData,
  imgUrl,
  nationalityImgUrl,
  nationality,
  standing,
}: DriverCardProps) {
  const teamId = apiData.team?.teamId ?? apiData.driver?.teamId ?? "";

  return (
    <div
      className="relative rounded-xl overflow-hidden h-52 sm:h-64 md:h-72 cursor-default p-4 flex flex-col justify-between"
      style={{ background: safeTeamVar(teamId) ?? "rgba(255,255,255,0.05)" }}
    >
      {/* Text content */}
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

      {/* Bottom: flag + standing */}
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

      {/* Driver photo — same style as /drivers page */}
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

export default function ComparePage() {
  const [driverAId, setDriverAId] = useState<string>("");
  const [driverBId, setDriverBId] = useState<string>("");

  const { data: driversData, isLoading: driversLoading } =
    useGetDriversQuery() as { data?: DriversResponse; isLoading: boolean };

  const { data: standingsData } = useGetStandingsDriversQuery() as {
    data?: DriversStandingsResponse;
  };

  const { data: driverAData, isLoading: loadingA } = useGetDriverByIdQuery(
    driverAId || skipToken
  ) as { data?: DriverByIdResponse; isLoading: boolean };

  const { data: driverBData, isLoading: loadingB } = useGetDriverByIdQuery(
    driverBId || skipToken
  ) as { data?: DriverByIdResponse; isLoading: boolean };

  const drivers = driversData?.drivers ?? [];
  const standings = standingsData?.drivers_championship ?? [];

  const standingA = standings.find((s) => s.driverId === driverAId);
  const standingB = standings.find((s) => s.driverId === driverBId);

  const driverAMeta = drivers.find((d) => d.driverId === driverAId);
  const driverBMeta = drivers.find((d) => d.driverId === driverBId);

  const statsA = driverAData ? calcStats(driverAData.results ?? []) : null;
  const statsB = driverBData ? calcStats(driverBData.results ?? []) : null;

  const showComparison =
    driverAId && driverBId && driverAData && driverBData && statsA && statsB;

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

      {driversLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin h-10 w-10" />
        </div>
      ) : (
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
            <Select value={driverAId} onValueChange={setDriverAId}>
              <SelectTrigger className="text-xs sm:text-sm">
                <SelectValue placeholder="Select driver..." />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((d) => (
                  <SelectItem
                    key={d.driverId}
                    value={d.driverId}
                    disabled={d.driverId === driverBId}
                  >
                    {d.name} {d.surname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-400 mb-1.5">
              Driver B
            </p>
            <Select value={driverBId} onValueChange={setDriverBId}>
              <SelectTrigger className="text-xs sm:text-sm">
                <SelectValue placeholder="Select driver..." />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((d) => (
                  <SelectItem
                    key={d.driverId}
                    value={d.driverId}
                    disabled={d.driverId === driverAId}
                  >
                    {d.name} {d.surname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}

      {!driverAId && !driverBId && !driversLoading && (
        <p className="text-center text-gray-400 mt-16 text-base sm:text-lg">
          Select two drivers to compare their stats
        </p>
      )}

      {(loadingA || loadingB) && (driverAId || driverBId) && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin h-10 w-10" />
        </div>
      )}

      {showComparison && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 sm:space-y-6"
        >
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <DriverCard
              apiData={driverAData!}
              imgUrl={driverAMeta?.imgUrl}
              nationalityImgUrl={driverAMeta?.nationalityImgUrl}
              nationality={driverAMeta?.nationality}
              standing={standingA}
            />
            <DriverCard
              apiData={driverBData!}
              imgUrl={driverBMeta?.imgUrl}
              nationalityImgUrl={driverBMeta?.nationalityImgUrl}
              nationality={driverBMeta?.nationality}
              standing={standingB}
            />
          </div>

          <div className="bg-white/5 backdrop-blur rounded-2xl px-4 sm:px-6 py-4 shadow-lg">
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
            <StatRow label="Races" valA={statsA!.races} valB={statsB!.races} />
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
          </div>
        </motion.div>
      )}
    </div>
  );
}
