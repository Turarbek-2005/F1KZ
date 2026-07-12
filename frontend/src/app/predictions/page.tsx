"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Save,
  Trash2,
  Target,
  UserCircle2,
  Loader2,
} from "lucide-react";
import { useGetRacesNextQuery, useGetDriversQuery } from "@/entities/f1api/f1api";
import {
  fetchDrivers,
} from "@/entities/f1/model/driversSlice";
import {
  useGetMyPredictionsQuery,
  useSavePredictionMutation,
  useClearMyPredictionsMutation,
} from "@/entities/predictions/predictionsApi";
import { PredictionCard } from "@/features/predictions/ui/PredictionCard";
import { PredictionsLeaderboard } from "@/features/predictions/ui/Leaderboard";
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

export default function PredictionsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s: RootState) => s.auth.user);
  const driversStatus = useAppSelector((s: RootState) => s.drivers.status);

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (driversStatus === "idle") dispatch(fetchDrivers());
  }, [dispatch, driversStatus]);

  const { data: nextData, isLoading: nextRaceLoading } = useGetRacesNextQuery() as {
    data?: LastNextRacesResponse;
    isLoading: boolean;
  };
  const { data: driversApi } = useGetDriversQuery() as {
    data?: DriversResponse;
  };

  const { data: myPredictions = [], isLoading: predictionsLoading } =
    useGetMyPredictionsQuery(undefined, { skip: !user });
  const [savePrediction, { isLoading: isSaving }] = useSavePredictionMutation();
  const [clearPredictions] = useClearMyPredictionsMutation();

  const nextRace = nextData?.race?.[0];
  const nextRaceId = nextRace?.raceId ?? `${nextData?.round ?? "next"}`;
  const allDrivers = driversApi?.drivers ?? [];

  const existingForNext = useMemo(
    () => myPredictions.find((p) => p.raceId === nextRaceId),
    [myPredictions, nextRaceId]
  );

  // Prefill from existing prediction
  useEffect(() => {
    if (existingForNext) {
      setP1(existingForNext.p1);
      setP2(existingForNext.p2);
      setP3(existingForNext.p3);
    }
  }, [existingForNext]);

  async function handleSave() {
    if (!p1 || !p2 || !p3 || !nextRace || !user) return;
    setSaveError(null);
    try {
      await savePrediction({ p1, p2, p3 }).unwrap();
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setSaveError(e?.data?.message ?? "Failed to save prediction");
    }
  }

  async function handleClear() {
    if (!user || !confirm("Delete all predictions?")) return;
    try {
      await clearPredictions().unwrap();
      setP1("");
      setP2("");
      setP3("");
    } catch {
      // keep current state; the list simply stays
    }
  }

  const history = myPredictions
    .filter((p) => p.raceId !== nextRaceId)
    .slice()
    .sort((a, b) => Number(b.round) - Number(a.round));

  const totalScore = history.reduce((sum, p) => sum + (p.score ?? 0), 0);
  const scoredCount = history.filter((p) => p.score !== undefined).length;
  const accuracy =
    scoredCount > 0 ? Math.round((totalScore / (scoredCount * 15)) * 100) : 0;

  const allValid = p1 && p2 && p3 && p1 !== p2 && p2 !== p3 && p1 !== p3;

  if (!user) {
    return (
      <div className="container px-4 sm:px-0 mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <UserCircle2 className="w-16 h-16 text-muted-foreground" />
        <p className="text-xl font-semibold">Sign in to make predictions</p>
        <p className="text-sm text-muted-foreground text-center">
          Your predictions are saved to your account and tracked across sessions.
        </p>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

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

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={handleSave}
              disabled={!allValid || isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {existingForNext ? "Update" : "Save"} prediction
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
            {saveError && <p className="text-sm text-red-400">{saveError}</p>}
            <p className="text-xs text-muted-foreground ml-auto">
              5 pts exact pos · 1 pt podium
            </p>
          </div>
        </motion.div>
      ) : nextRaceLoading ? (
        <div className="bg-white/5 backdrop-blur rounded-2xl p-6 mb-8 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading next race...
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur rounded-2xl p-6 mb-8 text-center text-muted-foreground">
          Season is over — no upcoming race
        </div>
      )}

      {/* Leaderboard */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-red-500" />
          <h3 className="text-xl font-bold">Leaderboard</h3>
        </div>
        <PredictionsLeaderboard currentUserId={user.id} />
      </motion.section>

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

      {predictionsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : history.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">
          No past predictions yet
        </p>
      ) : (
        <div className="space-y-3">
          {history.map((p) => (
            <PredictionCard key={p.raceId} prediction={p} />
          ))}
        </div>
      )}
    </div>
  );
}
