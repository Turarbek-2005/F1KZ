"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useGetRacesYearRoundQuery } from "@/entities/f1api/f1api";
import { Table, TableBody, TableCell, TableRow } from "@/shared/ui/table";
import Link from "next/link";

function toSingleString(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export function formatRaceDate(date?: string) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export function formatRaceTime(time?: string) {
  if (!time) return "";
  const d = new Date(`1970-01-01T${time}`);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
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
  } = useGetRacesYearRoundQuery({ year: year!, round: round! }, { skip });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error loading race</div>;
  }
  if (skip) {
    return <div>Некорректный путь — year или round отсутствует</div>;
  }

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold mb-6">{race?.race[0]?.raceName}</h2>
      <h3 className="text-3xl font-black mb-6">Schedule</h3>
      <div className="bg-black/3 dark:bg-white/5 rounded-lg">
        <Table>
          <TableBody>
            {race?.race[0]?.schedule?.fp1?.date && (
              <TableRow>
                <TableCell className="font-bold uppercase">
                  Practice 1
                </TableCell>
                <TableCell className="font-bold">
                  {formatRaceDate(race?.race[0]?.schedule?.fp1?.date)}
                </TableCell>
                <TableCell className="font-bold">
                  {formatRaceTime(race?.race[0]?.schedule?.fp1?.time)}
                </TableCell>
                <TableCell className="font-bold">
                  <Link
                    href={`/results/${year}/${round}/fp1`}
                    className="underline"
                  >
                    Results
                  </Link>
                </TableCell>
              </TableRow>
            )}
            {race?.race[0]?.schedule?.fp2?.date && (
              <TableRow>
                <TableCell className="font-bold uppercase">
                  Practice 2
                </TableCell>
                <TableCell className="font-bold">
                  {formatRaceDate(race?.race[0]?.schedule?.fp2?.date)}
                </TableCell>
                <TableCell className="font-bold">
                  {formatRaceTime(race?.race[0]?.schedule?.fp1?.time)}
                </TableCell>
                <TableCell className="font-bold">
                  <Link
                    href={`/results/${year}/${round}/fp2`}
                    className="underline"
                  >
                    Results
                  </Link>
                </TableCell>
              </TableRow>
            )}
            {race?.race[0]?.schedule?.fp3?.date && (
              <TableRow>
                <TableCell className="font-bold uppercase">
                  Practice 3
                </TableCell>
                <TableCell className="font-bold">
                  {formatRaceDate(race?.race[0]?.schedule?.fp3?.date)}
                </TableCell>
                <TableCell className="font-bold">
                  {formatRaceTime(race?.race[0]?.schedule?.fp3?.time)}
                </TableCell>
                <TableCell className="font-bold">
                  <Link
                    href={`/results/${year}/${round}/fp3`}
                    className="underline"
                  >
                    Results
                  </Link>
                </TableCell>
              </TableRow>
            )}
            {race?.race[0]?.schedule?.sprintQualy?.date && (
              <TableRow>
                <TableCell className="font-bold  uppercase">
                  Sprint Qualifying
                </TableCell>
                <TableCell className="font-bold">
                  {formatRaceDate(race?.race[0]?.schedule?.sprintQualy?.date)}
                </TableCell>
                <TableCell className="font-bold">
                  {formatRaceTime(race?.race[0]?.schedule?.sprintQualy?.time)}
                </TableCell>
                <TableCell className="font-bold">
                  <Link
                    href={`/results/${year}/${round}/sprintQualy`}
                    className="underline"
                  >
                    Results
                  </Link>
                </TableCell>
              </TableRow>
            )}
            {race?.race[0]?.schedule?.sprintRace?.date && (
              <TableRow>
                <TableCell className="font-bold  uppercase">Sprint</TableCell>
                <TableCell className="font-bold">
                  {formatRaceDate(race?.race[0]?.schedule?.sprintRace?.date)}
                </TableCell>
                <TableCell className="font-bold">
                  {formatRaceTime(race?.race[0]?.schedule?.sprintRace?.time)}
                </TableCell>
                <TableCell className="font-bold">
                  <Link
                    href={`/results/${year}/${round}/sprintRace`}
                    className="underline"
                  >
                    Results
                  </Link>
                </TableCell>
              </TableRow>
            )}

            {race?.race[0]?.schedule?.qualy?.date && (
              <TableRow>
                <TableCell className="font-bold  uppercase">
                  Qualifying
                </TableCell>
                <TableCell className="font-bold">
                  {formatRaceDate(race?.race[0]?.schedule?.qualy?.date)}
                </TableCell>
                <TableCell className="font-bold">
                  {formatRaceTime(race?.race[0]?.schedule?.qualy?.time)}
                </TableCell>
                <TableCell className="font-bold">
                  <Link
                    href={`/results/${year}/${round}/qualy`}
                    className="underline"
                  >
                    Results
                  </Link>
                </TableCell>
              </TableRow>
            )}
            {race?.race[0]?.schedule?.race?.date && (
              <TableRow>
                <TableCell className="font-bold  uppercase">Race</TableCell>
                <TableCell className="font-bold">
                  {formatRaceDate(race?.race[0]?.schedule?.race?.date)}
                </TableCell>
                <TableCell className="font-bold">
                  {formatRaceTime(race?.race[0]?.schedule?.race?.time)}
                </TableCell>
                <TableCell className="font-bold">
                  <Link
                    href={`/results/${year}/${round}/race`}
                    className="underline"
                  >
                    Results
                  </Link>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
