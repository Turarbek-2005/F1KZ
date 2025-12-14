"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  useGetRacesYearQuery,
  useGetRacesYearRoundQuery,
} from "@/entities/f1api/f1api";
import Fp1Table from "@/features/results/ui/Fp1Table";
import Fp2Table from "@/features/results/ui/Fp2Table";
import Fp3Table from "@/features/results/ui/Fp3Table";
import QualyTable from "@/features/results/ui/QualyTable";
import RaceTable from "@/features/results/ui/RaceTable";
import SprintQualyTable from "@/features/results/ui/SprintQualyTable";
import SprintRaceTable from "@/features/results/ui/SprintRaceTable";

function toSingleString(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}
export default function ResultsYearRoundSessionPage() {
  const params = useParams();

  const DEFAULT_YEAR = "2025";
  const DEFAULT_ROUND = "1";
  const DEFAULT_SESSION = "race";

  const [year, setYear] = useState(
    toSingleString(params?.year) ?? DEFAULT_YEAR
  );
  const [round, setRound] = useState(
    toSingleString(params?.round) ?? DEFAULT_ROUND
  );
  const [session, setSession] = useState(
    toSingleString(params?.session) ?? DEFAULT_SESSION
  );

  const { data: races, error, isLoading } = useGetRacesYearQuery(year!);
  const queryArgs = year && round ? { year, round } : skipToken;

  const { data: race, isLoading: isLoadingRace } =
    useGetRacesYearRoundQuery(queryArgs);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-16 w-16" />
      </div>
    );
  }

  return (
    <div className="container mx-auto pb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 flex items-center gap-3"
      >
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger>
            <SelectValue placeholder="Выбери год" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
            <SelectItem value="2022">2022</SelectItem>
            <SelectItem value="2021">2021</SelectItem>
            <SelectItem value="2020">2020</SelectItem>
          </SelectContent>
        </Select>
        <Select value={round} onValueChange={setRound}>
          <SelectTrigger>
            <SelectValue placeholder="Выбери этап" />
          </SelectTrigger>
          <SelectContent>
            {races?.races?.map((race: any) => (
              <SelectItem key={race?.round} value={race?.round?.toString()}>
                {race?.circuit?.country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={session} onValueChange={setSession}>
          <SelectTrigger>
            <SelectValue placeholder="Выбери сессию" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fp1">Practice 1</SelectItem>
            <SelectItem value="fp2">Practice 2</SelectItem>
            <SelectItem value="fp3">Practice 3</SelectItem>
            <SelectItem value="sprintQualyfying">Sprint Qualyfying</SelectItem>
            <SelectItem value="sprintRace">Sprint</SelectItem>
            <SelectItem value="qualyfying">Qualifying</SelectItem>
            <SelectItem value="race">Race</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-4">
          {race?.race[0]?.raceName} - {session?.toUpperCase()} Results
        </h1>
        {session === "fp1" && year && round && (
          <Fp1Table year={year} round={round} />
        )}
        {session === "fp2" && year && round && (
          <Fp2Table year={year} round={round} />
        )}
        {session === "fp3" && year && round && (
          <Fp3Table year={year} round={round} />
        )}

        {session === "sprintQualyfying" && year && round && (
          <SprintQualyTable year={year} round={round} />
        )}
        {session === "sprintRace" && year && round && (
          <SprintRaceTable year={year} round={round} />
        )}
        {session === "qualyfying" && year && round && (
          <QualyTable year={year} round={round} />
        )}
        {session === "race" && year && round && (
          <RaceTable year={year} round={round} />
        )}
      </motion.div>
    </div>
  );
}
