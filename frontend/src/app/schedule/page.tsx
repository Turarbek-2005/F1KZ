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
export default function Schedule() {
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const dispatch = useAppDispatch();
  const drivers = useAppSelector(selectAllDrivers);
  const { data: races, error, isLoading } = useGetRacesYearQuery(year);
  const {
    data: racesLast,
    error: errorLast,
    isLoading: isLoadingLast,
  } = useGetRacesLastQuery();
  const {
    data: racesNext,
    error: errorNext,
    isLoading: isLoadingNext,
  } = useGetRacesNextQuery();

  useEffect(() => {
    dispatch(fetchDrivers());
  }, [dispatch]);

  function formatRaceDates(start: string, end: string) {
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
          href={`/schedule/${year}/${racesLast?.round}`}
          className="border border-white/10 rounded-2xl p-4 bg-white/5 backdrop-blur shadow-lg"
        >
          <h4 className="text-xl font-black mb-2 tracking-wide uppercase">
            Last Race
          </h4>

          <div className="space-y-1">
            <p className="text-sm">Round {racesLast?.round}</p>
            <p className="text-lg font-semibold">
              {`${racesLast?.race[0].circuit.country}  ${racesLast?.race[0].circuit.city}`}
            </p>

            <p className="uppercase font-bold tracking-wide text-sm">
              {formatRaceDates(
                racesLast?.race[0].schedule.fp1.date,
                racesLast?.race[0].schedule.race.date
              )}
            </p>
          </div>
        </Link>
        <Link
          href={`/schedule/${year}/${racesNext?.round}`}
          className="border border-white/10 rounded-2xl p-4 bg-white/5 backdrop-blur shadow-lg"
        >
          <h4 className="text-xl font-black mb-2 tracking-wide uppercase">
            Next Race
          </h4>
          {!racesNext ? (
            <h4 className="text-xl font-black uppercase">The season is over</h4>
          ) : (
            <div className="space-y-1">
              <p className="text-sm">Round {racesNext?.round}</p>
              <p className="text-lg font-semibold">
                {racesNext?.race[0].circuit.country}{" "}
                {racesNext?.race[0].circuit.city ==
                racesNext?.race[0].circuit.country
                  ? ""
                  : racesNext?.race[0].circuit.city}
              </p>

              <p className="uppercase font-bold tracking-wide text-sm">
                {formatRaceDates(
                  racesNext?.race[0].schedule.fp1.date,
                  racesNext?.race[0].schedule.race.date
                )}
              </p>
            </div>
          )}
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {races?.races?.map((race: any) => (
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
                    race?.schedule.fp1.date,
                    race?.schedule.race.date
                  )}
                </p>
              ) : (
                ""
              )}
            </div>
            <p className="font-bold text-xl">
              {race?.circuit.country}{" "}
              {race?.circuit.city == race?.circuit.country
                ? ""
                : race?.circuit.city}
            </p>
            <p className="text-[12px] mb-10">{race?.raceName}</p>
            <div className="flex items-center gap-2">
              {race?.winner
                ? (() => {
                    const winner = drivers?.find(
                      (d) => d.driverId === race?.winner?.driverId
                    );
                    return (
                      winner && (
                        <div className="flex items-center gap-2">
                          Winner:
                          <div
                            className="w-8 h-8 overflow-hidden rounded-full"
                            style={{
                              background: `var(--team-${race?.teamWinner.teamId
                                .toLowerCase()
                                .replace(" ", "_")})`,
                            }}
                          >
                            <Image
                              src={winner.imgUrl}
                              alt={winner.driverId}
                              width={32}
                              height={32}
                              className="object-cover object-top w-full h-full"
                            />
                          </div>
                          {race?.winner.name} {race?.winner.surname}
                        </div>
                      )
                    );
                  })()
                : ""}
            </div>

            {!race?.winner ? (
              <p className="mt-auto uppercase text-lg font-bold">
                {formatRaceDates(
                  race?.schedule.fp1.date,
                  race?.schedule.race.date
                )}
              </p>
            ) : (
              ""
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
