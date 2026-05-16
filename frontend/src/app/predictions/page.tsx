"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Trophy, Save, Trash2, Target } from "lucide-react";
import {
  useGetRacesNextQuery,
  useGetRacesLastQuery,
  useGetLastRaceQuery,
  useGetDriversQuery,
} from "@/entities/f1api/f1api";
import {
  fetchDrivers,
  selectAllDrivers,
} from "@/entities/f1/model/driversSlice";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import type { RootState } from "@/shared/store";
import type {
  LastNextRacesResponse,
  DriversResponse,
} from "@/entities/f1api/f1api.interfaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type RaceResultRow = {
  driver: { driverId: string; name: string; surname: string };
  team: { teamId: string; teamName: string };
  position: number;
};

interface Prediction {
  raceId: string;
  round: string | number;
  raceName: string;
  p1: string;
  p2: string;
  p3: string;
  score?: number;
  actual?: { p1: string; p2: string; p3: string };
}

const STORAGE_KEY = "f1kz_predictions_v1";

function loadPredictions(): Record<string, Prediction> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function savePredictions(data: Record<string, Prediction>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function scorePrediction(p: Prediction, actual: { p1: string; p2: string; p3: string }) {
  let pts = 0;
  // 5 points for exact position match
  if (p.p1 === actual.p1) pts += 5;
  if (p.p2 === actual.p2) pts += 5;
  if (p.p3 === actual.p3) pts += 5;
  // 1 point bonus if guessed driver is on podium (any position)
  const guessed = [p.p1, p.p2, p.p3];
  const podium = [actual.p1, actual.p2, actual.p3];
  guessed.forEach((g, i) => {
    if (g && podium.includes(g) && podium[i] !== g) pts += 1;
  });
  return pts;
}

function teamVarById(teamId?: string) {
  if (!teamId) return undefined;
  return `var(--team-${teamId.toLowerCase().replace(" ", "_")})`;
}

export default function PredictionsPage() {
  const dispatch = useAppDispatch();
  const driversMeta = useAppSelector(selectAllDrivers);
  const driversStatus = useAppSelector((s: RootState) => s.drivers.status);

  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (driversStatus === "idle") dispatch(fetchDrivers());
    setPredictions(loadPredictions());
  }, [dispatch, driversStatus]);

  const { data: nextData } = useGetRacesNextQuery() as {
    data?: LastNextRacesResponse;
  };
  const { data: lastMeta } = useGetRacesLastQuery() as {
    data?: LastNextRacesResponse;
  };
  const { data: lastResults } = useGetLastRaceQuery() as {
    data?: { races?: { results?: RaceResultRow[] } };
  };
  const { data: driversApi } = useGetDriversQuery() as {
    data?: DriversResponse;
  };

  const nextRace = nextData?.race?.[0];
  const nextRaceId = nextRace?.raceId ?? `${nextData?.round ?? "next"}`;
  const allDrivers = driversApi?.drivers ?? [];

  // Score predictions when results arrive
  useEffect(() => {
    const lastRaceId = lastMeta?.race?.[0]?.raceId;
    const results = lastResults?.races?.results ?? [];
    if (!lastRaceId || results.length < 3) return;

    const existing = predictions[lastRaceId];
    if (!existing || existing.score !== undefined) return;

    const sorted = results
      .slice()
      .sort((a, b) => (a.position ?? 99) - (b.position ?? 99));
    const actual = {
      p1: sorted[0].driver.driverId,
      p2: sorted[1].driver.driverId,
      p3: sorted[2].driver.driverId,
    };
    const score = scorePrediction(existing, actual);
    const updated = {
      ...predictions,
      [lastRaceId]: { ...existing, score, actual },
    };
    setPredictions(updated);
    savePredictions(updated);
  }, [lastResults, lastMeta, predictions]);

  // Prefill from existing prediction
  useEffect(() => {
    const existing = predictions[nextRaceId];
    if (existing) {
      setP1(existing.p1);
      setP2(existing.p2);
      setP3(existing.p3);
    }
  }, [nextRaceId, predictions]);

  function driverLabel(id: string) {
    const apiD = allDrivers.find((d) => d.driverId === id);
    if (apiD) return `${apiD.name ?? ""} ${apiD.surname ?? ""}`.trim();
    return id;
  }

  function driverMeta(id: string) {
    return driversMeta.find((d) => d.driverId === id);
  }

  function handleSave() {
    if (!p1 || !p2 || !p3 || !nextRace) return;
    const pred: Prediction = {
      raceId: nextRaceId,
      round: nextData?.round ?? "",
      raceName: nextRace.raceName ?? "",
      p1,
      p2,
      p3,
    };
    const updated = { ...predictions, [nextRaceId]: pred };
    setPredictions(updated);
    savePredictions(updated);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  function handleClear() {
    if (!confirm("Delete all predictions?")) return;
    setPredictions({});
    savePredictions({});
    setP1("");
    setP2("");
    setP3("");
  }

  const history = Object.values(predictions)
    .filter((p) => p.raceId !== nextRaceId)
    .sort((a, b) => Number(b.round) - Number(a.round));

  const totalScore = history.reduce((sum, p) => sum + (p.score ?? 0), 0);
  const scoredCount = history.filter((p) => p.score !== undefined).length;
  const accuracy =
    scoredCount > 0 ? Math.round((totalScore / (scoredCount * 15)) * 100) : 0;

  const allValid = p1 && p2 && p3 && p1 !== p2 && p2 !== p3 && p1 !== p3;

  return (
    <div className="container px-4 sm:px-0 mx-auto pb-10">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl sm:text-4xl font-extrabold mt-4 mb-6 flex items-center gap-3"
      >
        <Target className="w-7 h-7 text-red-500" /> Race Predictions
      </motion.h2>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-8"
      >
        <div className="bg-white/5 backdrop-blur rounded-xl p-4 text-center">
          <p className="text-3xl font-extrabold text-red-500 tabular-nums">
            {totalScore}
          </p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            Total points
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur rounded-xl p-4 text-center">
          <p className="text-3xl font-extrabold tabular-nums">{scoredCount}</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            Races scored
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur rounded-xl p-4 text-center">
          <p className="text-3xl font-extrabold tabular-nums">{accuracy}%</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            Accuracy
          </p>
        </div>
      </motion.div>

      {/* Prediction form */}
      {nextRace ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white/5 backdrop-blur rounded-2xl p-5 sm:p-6 mb-8"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            Next Race · Round {nextData?.round}
          </p>
          <h3 className="text-xl font-bold mb-4">
            {nextRace.raceName}
            <span className="text-muted-foreground text-base font-normal ml-2">
              {nextRace.circuit?.country}
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {[
              { label: "1st 🥇", value: p1, set: setP1, exclude: [p2, p3] },
              { label: "2nd 🥈", value: p2, set: setP2, exclude: [p1, p3] },
              { label: "3rd 🥉", value: p3, set: setP3, exclude: [p1, p2] },
            ].map((slot) => (
              <div key={slot.label}>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                  {slot.label}
                </p>
                <Select value={slot.value} onValueChange={slot.set}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select driver..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allDrivers.map((d) => (
                      <SelectItem
                        key={d.driverId}
                        value={d.driverId}
                        disabled={slot.exclude.includes(d.driverId)}
                      >
                        {d.name} {d.surname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={!allValid}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {predictions[nextRaceId] ? "Update" : "Save"} prediction
            </Button>
            {savedFlash && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-green-400"
              >
                ✓ Saved
              </motion.p>
            )}
            <p className="text-xs text-muted-foreground ml-auto">
              5 pts exact pos · 1 pt podium
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="bg-white/5 backdrop-blur rounded-2xl p-6 mb-8 text-center text-muted-foreground">
          Season is over — no upcoming race
        </div>
      )}

      {/* History */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">History</h3>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-red-500 transition flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">
          No past predictions yet
        </p>
      ) : (
        <div className="space-y-3">
          {history.map((p) => (
            <div
              key={p.raceId}
              className="bg-white/5 backdrop-blur rounded-xl p-4"
            >
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
                  <span className="text-xs text-muted-foreground italic">
                    Pending
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(["p1", "p2", "p3"] as const).map((key, idx) => {
                  const id = p[key];
                  const meta = driverMeta(id);
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
                        p.actual && !correct && !inPodium && "border-red-500/30 bg-red-500/5"
                      )}
                    >
                      <p className="text-[10px] uppercase text-muted-foreground mb-1">
                        {["1st", "2nd", "3rd"][idx]}
                      </p>
                      <div
                        className="w-10 h-10 mx-auto rounded-full overflow-hidden mb-1"
                        style={{
                          background:
                            teamVarById(meta?.teamId) ?? "rgba(255,255,255,0.1)",
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
                          Actual: {driverLabel(p.actual[key]).split(" ").slice(-1)[0]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
