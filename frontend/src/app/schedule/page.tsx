"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  fetchDrivers,
  selectAllDrivers,
} from "@/entities/f1/model/driversSlice";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import {
  useGetRacesYearQuery,
  useGetRacesLastQuery,
  useGetRacesNextQuery,
} from "@/entities/f1api/f1api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Loader2 } from "lucide-react";

export type RaceScheduleSession = {
  date: string;
  time?: string;
};

export type RaceSchedule = {
  fp1: RaceScheduleSession;
  fp2?: RaceScheduleSession;
  fp3?: RaceScheduleSession;
  sprintQualyfying?: RaceScheduleSession;
  sprintRace?: RaceScheduleSession;
  qualyfying?: RaceScheduleSession;
  race: RaceScheduleSession;
};

export type RaceWinner = {
  driverId: string;
  name: string;
  surname: string;
};

export type RaceTeamWinner = {
  teamId: string;
};

export type RaceCircuit = {
  country: string;
  city: string;
};

export type Race = {
  race:string;
  raceId: string;
  raceName: string;
  round: number;
  circuit: RaceCircuit;
  schedule: RaceSchedule;
  winner?: RaceWinner;
  teamWinner?: RaceTeamWinner;
};
export interface RaceApiResponse {
  round: number;
  race: Race[];
}

export default function Schedule() {
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const dispatch = useAppDispatch();
  const drivers = useAppSelector(selectAllDrivers);
  const { data: races, isLoading } = useGetRacesYearQuery(year) as { data?: RaceApiResponse; isLoading: boolean };
  const { data: racesLast, isLoading: isLoadingLast } =
    useGetRacesLastQuery() as { data?: RaceApiResponse; isLoading: boolean };
  const { data: racesNext, isLoading: isLoadingNext } =
    useGetRacesNextQuery() as { data?: RaceApiResponse; isLoading: boolean };

  useEffect(() => {
    dispatch(fetchDrivers());
  }, [dispatch]);

  function formatRaceDates(start?: string, end?: string) {
    if (!start || !end) return "";
    const startDate = new Date(start);
    const endDate = new Date(end);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const month = months[endDate.getMonth()];

    if (startDate.getMonth() !== endDate.getMonth()) {
      const startMonth = months[startDate.getMonth()];
      return `${startDay} ${startMonth} – ${endDay} ${month}`;
    }

    return `${startDay} – ${endDay} ${month}`;
  }

  // small helpers to avoid repeating optional chains in JSX
  const lastRaceFirst = racesLast?.race?.[0];
  const nextRaceFirst = racesNext?.race?.[0];
  const racesList: Race[] = races?.race ?? [];

  useEffect(() => {
    console.log("Races:", races);
    console.log("Last Race:", racesLast);
    console.log("Next Race:", racesNext);
  }, [races, racesLast, racesNext]);

  if (isLoading || isLoadingLast || isLoadingNext) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-16 w-16" />
      </div>
    );
  }

  const getCountryCity = (r?: Race | undefined) => {
    if (!r?.circuit) return "";
    const city =
      r.circuit.city === r.circuit.country ? "" : ` ${r.circuit.city}`;
    return `${r.circuit.country}${city}`;
  };

  const safeFormatDates = (r?: Race | undefined) => {
    if (!r?.schedule) return "";
    return formatRaceDates(r.schedule.fp1?.date, r.schedule.race?.date);
  };

  const safeTeamColor = (teamId?: string) => {
    if (!teamId) return undefined;
    try {
      return `var(--team-${teamId.toLowerCase().replace(" ", "_")})`;
    } catch {
      return undefined;
    }
  };

  return (
    <div className="container mx-auto pb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger>
            <SelectValue placeholder="Выбери год" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="2026">2026</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
            <SelectItem value="2022">2022</SelectItem>
            <SelectItem value="2021">2021</SelectItem>
            <SelectItem value="2020">2020</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>
      <h2 className="text-2xl font-bold mb-6">
        {year} FIA FORMULA ONE WORLD CHAMPIONSHIP™ RACE CALENDAR
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mb-10">
        <Link
          href={`/schedule/${year}/${racesLast?.round ?? ""}`}
          className="border border-white/10 rounded-2xl p-4 bg-white/5 backdrop-blur shadow-lg"
        >
          <h4 className="text-xl font-black mb-2 tracking-wide uppercase">
            Last Race
          </h4>

          <div className="space-y-1">
            <p className="text-sm">Round {racesLast?.round ?? "-"}</p>
            <p className="text-lg font-semibold">
              {getCountryCity(lastRaceFirst)}
            </p>

            <p className="uppercase font-bold tracking-wide text-sm">
              {safeFormatDates(lastRaceFirst)}
            </p>
          </div>
        </Link>
        <Link
          href={`/schedule/${year}/${racesNext?.round ?? ""}`}
          className="border border-white/10 rounded-2xl p-4 bg-white/5 backdrop-blur shadow-lg"
        >
          <h4 className="text-xl font-black mb-2 tracking-wide uppercase">
            Next Race
          </h4>
          {!nextRaceFirst ? (
            <h4 className="text-xl font-black uppercase">The season is over</h4>
          ) : (
            <div className="space-y-1">
              <p className="text-sm">Round {racesNext?.round ?? "-"}</p>
              <p className="text-lg font-semibold">
                {getCountryCity(nextRaceFirst)}
              </p>

              <p className="uppercase font-bold tracking-wide text-sm">
                {safeFormatDates(nextRaceFirst)}
              </p>
            </div>
          )}
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.isArray(racesList)
          ? racesList.map((race: Race) => {
              const winnerDriver =
                race?.winner &&
                drivers?.find((d) => d.driverId === race.winner?.driverId);

              const teamColor = safeTeamColor(race?.teamWinner?.teamId);

              return (
                <Link
                  key={race?.raceId}
                  href={`/schedule/${year}/${race.round}`}
                  className="border rounded p-3  flex flex-col"
                >
                  <div className="flex justify-between uppercase text-[10px] items-center">
                    <p>Round {race?.round}</p>
                    {race?.winner ? (
                      <p>
                        {formatRaceDates(
                          race?.schedule.fp1?.date,
                          race?.schedule.race?.date
                        )}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                  <p className="font-bold text-xl">
                    {race?.circuit?.country}{" "}
                    {race?.circuit?.city === race?.circuit?.country
                      ? ""
                      : race?.circuit?.city}
                  </p>
                  <p className="text-[12px] mb-10">{race?.raceName}</p>
                  <div className="flex items-center gap-2">
                    {winnerDriver ? (
                      <div className="flex items-center gap-2">
                        Winner:
                        <div
                          className="w-8 h-8 overflow-hidden rounded-full"
                          style={{
                            background: teamColor,
                          }}
                        >
                          <Image
                            src={winnerDriver.imgUrl}
                            alt={winnerDriver.driverId}
                            width={32}
                            height={32}
                            className="object-cover object-top w-full h-full"
                          />
                        </div>
                        {race.winner?.name} {race.winner?.surname}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>

                  {!race?.winner ? (
                    <p className="mt-auto uppercase text-lg font-bold">
                      {formatRaceDates(
                        race?.schedule.fp1?.date,
                        race?.schedule.race?.date
                      )}
                    </p>
                  ) : null}
                </Link>
              );
            })
          : null}
      </div>
    </div>
  );
}
