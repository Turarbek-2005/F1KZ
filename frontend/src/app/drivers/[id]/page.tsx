"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { MoveLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import {
  fetchDrivers,
  selectDriverById,
} from "@/entities/f1/model/driversSlice";
import { fetchTeams, selectTeamById } from "@/entities/f1/model/teamsSlice";
import {
  useGetDriverByIdQuery,
} from "@/entities/f1api/f1api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "@/shared/ui/table";

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
    data: driverApi,
    isLoading: driverApiLoading,
    isError: driverApiError,
  } = useGetDriverByIdQuery(driverId ?? skipToken, {
    refetchOnMountOrArgChange: false,
  });

  useEffect(() => {
    dispatch(fetchDrivers());
    dispatch(fetchTeams());
  }, [dispatch]);

  useEffect(() => {
    console.log("Redux driver:", driver);
    console.log("Redux team:", team);
    console.log("API driver:", driverApi);
  }, [driver, team, driverApi]);

  if (!driverId) {
    return (
      <div className="container mx-auto pb-6">
        <p>Driver ID is missing in URL</p>
      </div>
    );
  }

  if (driverApiLoading) {
    return (
      <div className="container mx-auto pb-6">
        <p>Loading...</p>
      </div>
    );
  }

  if (driverApiError) {
    return (
      <div className="container mx-auto pb-6">
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
        className="container mx-auto mb-2"
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
            <p className="text-3xl md:text-4xl font-bold">
              {driverApi.driver.name}
            </p>
            <p className="text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-wide">
              {driverApi.driver.surname}
            </p>
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-white">
                <Image
                  src={driver?.nationalityImgUrl!}
                  alt={driver?.nationality!}
                  width={32}
                  height={32}
                  className="object-cover object-top w-full h-full rounded-full"
                />
              </div>
              <p>{driver?.nationality}</p>
            </div>
            <span className="mx-3">|</span>
            <p>{driverApi.team.teamName}</p>
            <span className="mx-3">|</span>
            <p>{driverApi.driver.number}</p>
          </div>
        </div>
        <div className="absolute md:static w-full md:w-1/2 h-full flex items-end justify-center">
          <div className="w-80 md:w-100 h-100 md:h-135">
            <Image
              src={driver?.imgUrl!}
              alt={driver?.driverId!}
              width={400}
              height={540}
              className="object-cover object-top w-full h-full"
            />
          </div>
        </div>
      </div>
      <section className="container mx-auto mt-8">
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
                    src={driver?.nationalityImgUrl!}
                    alt={driver?.nationality!}
                    width={32}
                    height={32}
                    className="object-cover object-top w-full h-full rounded-full"
                  />
                </div>
                <p>{driver?.nationality}</p>
              </div>
            </div>
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
                {(driverApi?.results ?? []).map((r: any) => {
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
                      <TableCell className="px-3 py-3 text-sm">
                        {name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-3 py-3 text-sm">
                        {date}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm">
                        {grid}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm">
                        {finish}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm">{pts}</TableCell>
                      <TableCell className="px-3 py-3 text-sm">
                        {sprint}
                      </TableCell>
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
