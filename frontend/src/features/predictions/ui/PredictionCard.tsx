"use client";

import Image from "next/image";
import { Trophy } from "lucide-react";
import { useAppSelector } from "@/shared/lib/hooks";
import { selectAllDrivers } from "@/entities/f1/model/driversSlice";
import { useGetDriversQuery } from "@/entities/f1api/f1api";
import type { DriversResponse } from "@/entities/f1api/f1api.interfaces";
import type { Prediction } from "@/entities/predictions/predictions.types";
import { teamCssVar } from "@/shared/lib/teamColor";
import { cn } from "@/shared/lib/utils";

// One prediction with its podium picks, correctness highlighting and score.
// Used on the predictions page, own profile and public profiles.
export function PredictionCard({ prediction: p }: { prediction: Prediction }) {
  const driversMeta = useAppSelector(selectAllDrivers);
  const { data: driversApi } = useGetDriversQuery() as {
    data?: DriversResponse;
  };

  function driverLabel(id: string) {
    const apiD = driversApi?.drivers.find((d) => d.driverId === id);
    if (apiD) return `${apiD.name ?? ""} ${apiD.surname ?? ""}`.trim();
    return id;
  }

  return (
    <div className="bg-white/5 backdrop-blur rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold">{p.raceName}</p>
          <p className="text-xs text-muted-foreground">Round {p.round}</p>
        </div>
        {p.score !== undefined ? (
          <div className="flex items-center gap-1.5 bg-red-500/10 text-red-400 px-3 py-1 rounded-full">
            <Trophy className="w-3 h-3" />
            <span className="text-sm font-bold tabular-nums">
              {p.score} pts
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">Pending</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(["p1", "p2", "p3"] as const).map((key, idx) => {
          const id = p[key];
          const meta = driversMeta.find((d) => d.driverId === id);
          const correct = p.actual && p.actual[key] === id;
          const inPodium =
            p.actual && Object.values(p.actual).includes(id) && !correct;

          return (
            <div
              key={key}
              className={cn(
                "rounded-lg p-2 text-center border",
                correct && "border-green-500/60 bg-green-500/10",
                inPodium && "border-yellow-500/40 bg-yellow-500/10",
                !p.actual && "border-white/10",
                p.actual &&
                  !correct &&
                  !inPodium &&
                  "border-red-500/30 bg-red-500/5"
              )}
            >
              <p className="text-[10px] uppercase text-muted-foreground mb-1">
                {["1st", "2nd", "3rd"][idx]}
              </p>
              <div
                className="w-10 h-10 mx-auto rounded-full overflow-hidden mb-1"
                style={{
                  background:
                    teamCssVar(meta?.teamId) ?? "rgba(255,255,255,0.1)",
                }}
              >
                {meta?.imgUrl && (
                  <Image
                    src={meta.imgUrl}
                    alt={id}
                    width={40}
                    height={40}
                    className="object-cover object-top w-full h-full"
                  />
                )}
              </div>
              <p className="text-xs font-semibold truncate">
                {driverLabel(id)}
              </p>
              {p.actual && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Actual:{" "}
                  {driverLabel(p.actual[key]).split(" ").slice(-1)[0]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
