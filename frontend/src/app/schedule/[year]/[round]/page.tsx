"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useGetRacesYearRoundQuery } from "@/entities/f1api/f1api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Calendar, Clock, Loader2 } from "lucide-react";

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
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-16 w-16" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Could not load race schedule. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (skip) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Path</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Year or round is missing from the URL.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-2">
            {race?.race[0]?.raceName}
          </CardTitle>
          <p className="text-muted-foreground">{race?.race[0]?.circuit.name}</p>
        </CardHeader>
        <CardContent>
          <h3 className="text-2xl font-semibold mb-4">Schedule</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Results</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {race?.race[0]?.schedule?.fp1?.date && (
                <TableRow>
                  <TableCell className="font-bold uppercase">
                    Practice 1
                  </TableCell>
                  <TableCell className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatRaceDate(race?.race[0]?.schedule?.fp1?.date)}
                  </TableCell>
                  <TableCell>
                    <Clock className="mr-2 h-4 w-4 inline" />
                    {formatRaceTime(race?.race[0]?.schedule?.fp1?.time)}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" asChild>
                      <Link href={`/results/${year}/${round}/fp1`}>
                        Results
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              {race?.race[0]?.schedule?.fp2?.date && (
                <TableRow>
                  <TableCell className="font-bold uppercase">
                    Practice 2
                  </TableCell>
                  <TableCell className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatRaceDate(race?.race[0]?.schedule?.fp2?.date)}
                  </TableCell>
                  <TableCell>
                    <Clock className="mr-2 h-4 w-4 inline" />
                    {formatRaceTime(race?.race[0]?.schedule?.fp2?.time)}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" asChild>
                      <Link href={`/results/${year}/${round}/fp2`}>
                        Results
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              {race?.race[0]?.schedule?.fp3?.date && (
                <TableRow>
                  <TableCell className="font-bold uppercase">
                    Practice 3
                  </TableCell>
                  <TableCell className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatRaceDate(race?.race[0]?.schedule?.fp3?.date)}
                  </TableCell>
                  <TableCell>
                    <Clock className="mr-2 h-4 w-4 inline" />
                    {formatRaceTime(race?.race[0]?.schedule?.fp3?.time)}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" asChild>
                      <Link href={`/results/${year}/${round}/fp3`}>
                        Results
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              {race?.race[0]?.schedule?.sprintQualy?.date && (
                <TableRow>
                  <TableCell className="font-bold uppercase">
                    Sprint Qualifying
                  </TableCell>
                  <TableCell className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatRaceDate(
                      race?.race[0]?.schedule?.sprintQualy?.date
                    )}
                  </TableCell>
                  <TableCell>
                    <Clock className="mr-2 h-4 w-4 inline" />
                    {formatRaceTime(
                      race?.race[0]?.schedule?.sprintQualy?.time
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" asChild>
                      <Link href={`/results/${year}/${round}/sprintQualy`}>
                        Results
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              {race?.race[0]?.schedule?.sprintRace?.date && (
                <TableRow>
                  <TableCell className="font-bold uppercase">
                    Sprint
                  </TableCell>
                  <TableCell className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatRaceDate(
                      race?.race[0]?.schedule?.sprintRace?.date
                    )}
                  </TableCell>
                  <TableCell>
                    <Clock className="mr-2 h-4 w-4 inline" />
                    {formatRaceTime(
                      race?.race[0]?.schedule?.sprintRace?.time
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" asChild>
                      <Link href={`/results/${year}/${round}/sprintRace`}>
                        Results
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )}

              {race?.race[0]?.schedule?.qualy?.date && (
                <TableRow>
                  <TableCell className="font-bold uppercase">
                    Qualifying
                  </TableCell>
                  <TableCell className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatRaceDate(race?.race[0]?.schedule?.qualy?.date)}
                  </TableCell>
                  <TableCell>
                    <Clock className="mr-2 h-4 w-4 inline" />
                    {formatRaceTime(race?.race[0]?.schedule?.qualy?.time)}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" asChild>
                      <Link href={`/results/${year}/${round}/qualy`}>
                        Results
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              {race?.race[0]?.schedule?.race?.date && (
                <TableRow>
                  <TableCell className="font-bold uppercase">Race</TableCell>
                  <TableCell className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatRaceDate(race?.race[0]?.schedule?.race?.date)}
                  </TableCell>
                  <TableCell>
                    <Clock className="mr-2 h-4 w-4 inline" />
                    {formatRaceTime(race?.race[0]?.schedule?.race?.time)}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" asChild>
                      <Link href={`/results/${year}/${round}/race`}>
                        Results
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}