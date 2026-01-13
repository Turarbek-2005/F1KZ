"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { Loader2, MoveLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import {
  fetchDrivers,
  selectDriverById,
} from "@/entities/f1/model/driversSlice";
import { fetchTeams, selectTeamById } from "@/entities/f1/model/teamsSlice";
import {
  useGetDriverByIdQuery,
  useGetStandingsDriversQuery,
} from "@/entities/f1api/f1api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "@/shared/ui/table";
import { cn } from "@/shared/lib/utils";
import { grapeNuts } from "@/app/fonts";

interface DriverStanding {
  driverId: string;
  position?: number;
  points?: number;
  team?: {
    teamName?: string;
  };
}

interface DriverApiData {
  season?: string;
  driver?: {
    name?: string;
    surname?: string;
    number?: string | number;
    birthday?: string;
  };
  team?: {
    teamName?: string;
  };
  results?: ResultEntry[];
}

interface ResultEntry {
  race?: {
    round?: string | number;
    name?: string;
    date?: string;
    raceId?: string;
  };
  result?: {
    gridPosition?: number | string;
    finishingPosition?: number | string;
    pointsObtained?: number;
  };
  sprintResult?: {
    finishingPosition?: number | string;
    pointsObtained?: number;
  };
}

export default function Driver() {
  const params = useParams();
  const rawId = params?.id;
  const driverId =
    typeof rawId === "string" && rawId.length > 0 ? rawId : undefined;

  const dispatch = useAppDispatch();

  const driver = useAppSelector((state) =>
    driverId ? selectDriverById(state, driverId) : undefined
  );
  const teamIdFromDriver = driver ? driver.teamId : undefined;
  const team = useAppSelector((state) =>
    teamIdFromDriver ? selectTeamById(state, teamIdFromDriver) : undefined
  );

  const {
    data: rawDriverApi,
    isLoading: driverApiLoading,
    isError: driverApiError,
  } = useGetDriverByIdQuery(driverId ?? skipToken, {
    refetchOnMountOrArgChange: false,
  });

  const {
    data: rawStandingsData,
  } = useGetStandingsDriversQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const driverApi = (rawDriverApi ?? undefined) as DriverApiData | undefined;
  const driversStandings = (rawStandingsData ?? {
    drivers_championship: [],
  }) as { drivers_championship: DriverStanding[] };

  const topDriverStat = driversStandings.drivers_championship?.find(
    (d: DriverStanding) => d.position === 1
  );
  const topDriverId = topDriverStat?.driverId;

  const {
    data: rawTopDriverApi,
    isLoading: topDriverLoading,
    isError: topDriverError,
  } = useGetDriverByIdQuery(topDriverId ?? skipToken, {
    refetchOnMountOrArgChange: false,
  });

  const topDriverApi = (rawTopDriverApi ?? undefined) as
    | DriverApiData
    | undefined;

  const twoDriverIds = Array.from(
    new Set([topDriverId, driverId].filter(Boolean))
  );

  const twoDriversData: {
    id?: string;
    apiData?: DriverApiData | undefined;
    stat?: DriverStanding | undefined;
  }[] = twoDriverIds.map((id) => {
    const apiData = id === driverId ? driverApi : topDriverApi;
    const stat = driversStandings.drivers_championship?.find(
      (d) => d.driverId === id
    );
    return { id, apiData, stat };
  });

  useEffect(() => {
    dispatch(fetchDrivers());
    dispatch(fetchTeams());
  }, [dispatch]);

  if (!driverId) {
    return (
      <div className="container px-4 sm:px-0 mx-auto">
        <p>Driver ID is missing in URL</p>
      </div>
    );
  }

  if (driverApiLoading || topDriverLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-16 w-16" />
      </div>
    );
  }

  if (driverApiError || topDriverError) {
    return (
      <div className="container px-4 sm:px-0 mx-auto">
        <p>Error loading driver data.</p>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container px-4 sm:px-0 mx-auto mb-2"
      >
        <Link href="/drivers" className="hover:underline flex gap-2">
          <MoveLeft className="w-4" /> Back to Drivers
        </Link>
      </motion.div>

      <div
        className="w-full h-140 flex relative"
        style={{
          background: `var(--team-${driver?.teamId
            ?.toLowerCase()
            .replace(" ", "_")})`,
        }}
      >
        <div className="w-full pt-6 md:p-0 md:w-1/2 h-full z-1 flex flex-col items-center justify-start md:justify-center ">
          <div className="text-center mb-3">
            <p className={cn(grapeNuts.className, "text-4xl md:text-6xl")}>
              {driverApi?.driver?.name}
            </p>
            <p className="text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-wide">
              {driverApi?.driver?.surname}
            </p>
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="hidden sm:block w-5 h-5 rounded-full border-2 border-white">
                <Image
                  src={driver?.nationalityImgUrl ?? ""}
                  alt={driver?.nationality ?? ""}
                  width={20}
                  height={20}
                  className="object-cover object-top w-full h-full rounded-full"
                />
              </div>
              <p>{driver?.nationality}</p>
            </div>
            <span className="mx-1 sm:mx-3">|</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6">
                <Image
                  src={team?.teamImgUrl ?? ""}
                  alt={team?.teamId ?? ""}
                  width={24}
                  height={24}
                  className="object-cover object-top w-full h-full rounded-full"
                />
              </div>
              <p>{driverApi?.team?.teamName}</p>
            </div>
            <span className="mx-1 sm:mx-3">|</span>
            <p>{driverApi?.driver?.number}</p>
          </div>
        </div>
        <div className="absolute md:static w-full md:w-1/2 h-full flex items-end justify-center">
          <div className="w-80 md:w-100 h-100 md:h-135">
            <Image
              src={driver?.imgUrl ?? ""}
              alt={driver?.driverId ?? ""}
              width={400}
              height={540}
              className="object-cover object-top w-full h-full"
            />
          </div>
        </div>
      </div>

      <section className="container px-4 sm:px-0 mx-auto mt-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white/5 backdrop-blur rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-4">
            Season {driverApi?.season ?? "—"} — Race Data
          </h3>

          <div className="flex-1 mb-6 p-6 bg-linear-to-r from-gray-800/40 to-gray-900/40 backdrop-blur-md rounded-xl shadow-lg">
            <div className="mb-4">
              <div className="text-sm text-gray-300 uppercase tracking-wide">
                Driver
              </div>
              <div className="text-2xl font-bold text-white">
                {driverApi?.driver?.name} {driverApi?.driver?.surname}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-300 uppercase tracking-wide">
                Team
              </div>
              <div className="text-lg text-white font-medium">
                {driverApi?.team?.teamName}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-300 uppercase tracking-wide">
                Number
              </div>
              <div className="text-lg text-white font-medium">
                {driverApi?.driver?.number}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-300 uppercase tracking-wide">
                Birth Date
              </div>
              <div className="text-lg text-white font-medium">
                {driverApi?.driver?.birthday}
              </div>
            </div>

            <div>
              <div className="text-sm mb-1 text-gray-300 uppercase tracking-wide">
                Nationality
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-white">
                  <Image
                    src={driver?.nationalityImgUrl ?? ""}
                    alt={driver?.nationality ?? ""}
                    width={32}
                    height={32}
                    className="object-cover object-top w-full h-full rounded-full"
                  />
                </div>
                <p>{driver?.nationality}</p>
              </div>
            </div>
          </div>

          <h4 className="text-lg font-medium mb-2">
            My Driver vs Championship Leader
          </h4>
          <div className="overflow-x-auto rounded-md mb-6">
            <Table>
              <TableHeader>
                <TableRow className="text-sm text-white/60">
                  <TableHead>Pos</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Pts</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {twoDriversData.map(({ id, apiData, stat }) => {
                  const position = stat?.position ?? apiData?.driver?.number ?? "—";
                  const points = stat?.points ?? 0;
                  const name = apiData?.driver
                    ? `${apiData.driver.name} ${apiData.driver.surname}`
                    : id;
                  const teamName =
                    apiData?.team?.teamName ?? stat?.team?.teamName ?? "—";

                  return (
                    <TableRow key={id} className="border-t border-white/6">
                      <TableCell
                        className={cn(
                          "whitespace-nowrap px-3 py-3 text-sm",
                          id == driverId && "text-red-500"
                        )}
                      >
                        {position}
                      </TableCell>

                      <TableCell
                        className={cn(
                          "px-3 py-3 text-sm",
                          id == driverId && "text-red-500"
                        )}
                      >
                        {name}
                      </TableCell>

                      <TableCell
                        className={cn(
                          "px-3 py-3 text-sm",
                          id == driverId && "text-red-500"
                        )}
                      >
                        {teamName}
                      </TableCell>

                      <TableCell
                        className={cn(
                          "px-3 py-3 text-sm",
                          id == driverId && "text-red-500"
                        )}
                      >
                        {points}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <h4 className="text-lg font-medium mb-2">All Round Results</h4>
          <div className="overflow-x-auto rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="text-sm text-white/60">
                  <TableHead>Round</TableHead>
                  <TableHead>Race</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Grid</TableHead>
                  <TableHead>Finish</TableHead>
                  <TableHead>Pts (Race)</TableHead>
                  <TableHead>Sprint (Finish / Pts)</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {(driverApi?.results ?? []).map((r: ResultEntry) => {
                  const round = r.race?.round ?? "—";
                  const name = r.race?.name ?? "—";
                  const date = r.race?.date ?? "—";
                  const grid = r.result?.gridPosition ?? "—";
                  const finish = r.result?.finishingPosition ?? "—";
                  const pts = r.result?.pointsObtained ?? 0;
                  const sprint = r.sprintResult
                    ? `${r.sprintResult.finishingPosition} / ${r.sprintResult.pointsObtained}`
                    : "—";

                  return (
                    <TableRow
                      key={
                        r.race?.raceId ?? `${r.race?.round ?? Math.random()}`
                      }
                      className="border-t border-white/6"
                    >
                      <TableCell className="whitespace-nowrap px-3 py-3 text-sm">
                        {round}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm">{name}</TableCell>
                      <TableCell className="whitespace-nowrap px-3 py-3 text-sm">
                        {date}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm">{grid}</TableCell>
                      <TableCell className="px-3 py-3 text-sm">{finish}</TableCell>
                      <TableCell className="px-3 py-3 text-sm">{pts}</TableCell>
                      <TableCell className="px-3 py-3 text-sm">{sprint}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
