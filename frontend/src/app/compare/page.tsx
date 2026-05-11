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
    (r) => r.result?.finishingPosition === "DNF" || r.result?.finishingPosition === "DNS"
  ).length;
  const totalPoints = results.reduce(
    (acc, r) => acc + (r.result?.pointsObtained ?? 0),
    0
  );
  const bestFinish = results.reduce<number | null>((best, r) => {
    const pos = Number(r.result?.finishingPosition);
    if (!isNaN(pos) && pos > 0 && (best === null || pos < best)) return pos;
    return best;
  }, null);
  return { races, wins, podiums, dnfs, totalPoints, bestFinish };
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
  const aWins = !isNaN(a) && !isNaN(b) && (higherIsBetter ? a > b : a < b);
  const bWins = !isNaN(a) && !isNaN(b) && (higherIsBetter ? b > a : b < a);

  return (
    <div className="grid grid-cols-3 items-center py-3 border-b border-white/8 last:border-0">
      <span
        className={cn(
          "text-sm sm:text-base font-semibold text-right pr-4",
          aWins && "text-red-400"
        )}
      >
        {valA}
      </span>
      <span className="text-xs text-center text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      <span
        className={cn(
          "text-sm sm:text-base font-semibold text-left pl-4",
          bWins && "text-red-400"
        )}
      >
        {valB}
      </span>
    </div>
  );
}

interface DriverCardProps {
  driverId: string;
  apiData: DriverByIdResponse;
  imgUrl?: string;
  nationalityImgUrl?: string;
  standing?: { position?: number; points?: number };
}

function DriverCard({
  apiData,
  imgUrl,
  nationalityImgUrl,
  standing,
}: DriverCardProps) {
  const teamId = apiData.team?.teamId ?? apiData.driver?.teamId ?? "";
  return (
    <div
      className="relative rounded-2xl overflow-hidden h-52 flex flex-col justify-end p-4"
      style={{ background: safeTeamVar(teamId) ?? "rgba(255,255,255,0.05)" }}
    >
      {imgUrl && (
        <div className="absolute bottom-0 right-4 w-32 h-44 pointer-events-none">
          <Image
            src={imgUrl}
            alt={apiData.driver?.driverId ?? "driver"}
            fill
            className="object-cover object-top"
          />
        </div>
      )}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          {nationalityImgUrl && (
            <div className="w-5 h-5 rounded-full overflow-hidden border border-white/40">
              <Image
                src={nationalityImgUrl}
                alt="flag"
                width={20}
                height={20}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <span className="text-xs text-white/70">{apiData.driver?.nationality}</span>
        </div>
        <p className="text-xl font-extrabold leading-tight text-white drop-shadow">
          {apiData.driver?.name} {apiData.driver?.surname}
        </p>
        <p className="text-sm text-white/70">{apiData.team?.teamName}</p>
        {standing?.position && (
          <p className="text-xs text-white/50 mt-1">
            P{standing.position} · {standing.points} pts
          </p>
        )}
      </div>
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

  const driverAImg = drivers.find((d) => d.driverId === driverAId);
  const driverBImg = drivers.find((d) => d.driverId === driverBId);

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
        className="text-4xl font-extrabold mt-4 mb-8"
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
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
              Driver A
            </p>
            <Select value={driverAId} onValueChange={setDriverAId}>
              <SelectTrigger>
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
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
              Driver B
            </p>
            <Select value={driverBId} onValueChange={setDriverBId}>
              <SelectTrigger>
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

      {!driverAId && !driverBId && (
        <p className="text-center text-gray-400 mt-16 text-lg">
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
        >
          <div className="grid grid-cols-2 gap-4 mb-8">
            <DriverCard
              driverId={driverAId}
              apiData={driverAData!}
              imgUrl={driverAImg?.imgUrl}
              nationalityImgUrl={driverAImg?.nationalityImgUrl}
              standing={standingA}
            />
            <DriverCard
              driverId={driverBId}
              apiData={driverBData!}
              imgUrl={driverBImg?.imgUrl}
              nationalityImgUrl={driverBImg?.nationalityImgUrl}
              standing={standingB}
            />
          </div>

          <div className="bg-white/5 backdrop-blur rounded-2xl px-6 py-4 shadow-lg">
            <h3 className="text-center text-xs uppercase tracking-widest text-gray-400 mb-4">
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
            <StatRow label="DNFs" valA={statsA!.dnfs} valB={statsB!.dnfs} higherIsBetter={false} />
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
