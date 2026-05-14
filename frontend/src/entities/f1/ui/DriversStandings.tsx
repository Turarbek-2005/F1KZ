"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import {
  fetchDrivers,
  selectAllDrivers,
} from "@/entities/f1/model/driversSlice";
import { fetchTeams, selectAllTeams } from "@/entities/f1/model/teamsSlice";
import { useGetStandingsDriversQuery } from "@/entities/f1api/f1api";
import type {
  DriverStanding,
  DriversStandingsResponse as StandingsApiResponse,
} from "@/entities/f1api/f1api.interfaces";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import type { RootState } from "@/shared/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

import type { Driver } from "@/entities/f1/types/f1.types";

export default function DriversStandings() {
  const { data: driversApi = { drivers_championship: [] }, isLoading } =
    useGetStandingsDriversQuery(undefined, {
      refetchOnMountOrArgChange: true,
    }) as { data?: StandingsApiResponse; isLoading: boolean };

  const dispatch = useAppDispatch();
  const drivers = useAppSelector(selectAllDrivers);
  const teams = useAppSelector(selectAllTeams);
  const driversStatus = useAppSelector(
    (state: RootState) => state.drivers.status,
  );
  const teamsStatus = useAppSelector((state: RootState) => state.teams.status);

  useEffect(() => {
    if (driversStatus === "idle") {
      dispatch(fetchDrivers());
    }
    if (teamsStatus === "idle") {
      dispatch(fetchTeams());
    }
  }, [dispatch, driversStatus, teamsStatus]);

  const sortedDrivers = drivers
    .map((driver: Driver) => {
      const stat = driversApi.drivers_championship.find(
        (d) => d.driverId === driver.driverId,
      );

      if (!stat) {
        return {
          driver,
          stat: {
            position: Infinity,
            points: 0,
            teamId: "unknown",
            driver: { name: "", surname: "", shortName: "" },
            team: { teamName: "Unknown" },
          },
          matchedTeam: {
            teamImgUrl: "/placeholder.png",
            teamId: "unknown",
          },
          position: Infinity,
        };
      }

      const matchedTeam = teams.find((t) => t.teamId === stat.teamId) ?? {
        teamImgUrl: "/placeholder.png",
        teamId: stat.teamId,
      };

      return {
        driver,
        stat,
        matchedTeam,
        position: stat.position ?? Infinity,
      };
    })
    .sort((a, b) => a.position - b.position);

  const isStoreLoading =
    driversStatus === "idle" ||
    driversStatus === "loading" ||
    teamsStatus === "idle" ||
    teamsStatus === "loading";

  if (isLoading || isStoreLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-16 w-16" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Table>
        <TableHeader>
          <TableRow className="text-[12px] sm:text-sm uppercase">
            <TableHead>Pos</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Nationality</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Pts</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedDrivers.map(({ driver, stat, matchedTeam }) => {
            const position = stat.position ?? "-";
            const points = stat.points ?? 0;
            const teamIdForColor = stat.teamId ?? "unknown";
            const teamName = stat.team?.teamName ?? stat.teamId ?? "Unknown";
            const matchedTeamId = matchedTeam.teamId ?? teamIdForColor;
            const matchedTeamImg = matchedTeam.teamImgUrl ?? "/placeholder.png";
            const driverName = stat.driver?.name ?? "";
            const driverSurname = stat.driver?.surname ?? "";
            const driverShortName = stat.driver?.shortName ?? driver.driverId;

            return (
              <TableRow key={driver.driverId}>
                <TableCell>{position}</TableCell>

                <TableCell>
                  <Link
                    href={`/drivers/${driver.driverId}`}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="w-8 h-8 overflow-hidden rounded-full"
                      style={{
                        background: `var(--team-${teamIdForColor
                          .toLowerCase()
                          .replace(" ", "_")})`,
                      }}
                    >
                      <Image
                        src={driver.imgUrl}
                        alt={driver.driverId}
                        width={32}
                        height={32}
                        className="object-cover object-top w-full h-full"
                      />
                    </div>

                    <p className="text-sm font-bold">
                      <span className="hidden md:inline-block font-normal">
                        {driverName}
                      </span>{" "}
                      <span className="hidden md:inline-block font-bold uppercase">
                        {driverSurname}
                      </span>
                      <span className="block md:hidden font-bold uppercase">
                        {driverShortName}
                      </span>
                    </p>
                  </Link>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border border-gray-200">
                      <Image
                        src={driver.nationalityImgUrl}
                        alt={driver.nationality}
                        width={24}
                        height={24}
                        className="object-cover w-full h-full rounded-full"
                      />
                    </div>
                    <p className="hidden sm:block">{driver.nationality}</p>
                  </div>
                </TableCell>

                <TableCell>
                  <Link
                    href={`/teams/${matchedTeamId}`}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="w-8 h-8 overflow-hidden rounded-full flex items-center justify-center"
                      style={{
                        background: `var(--team-${teamIdForColor
                          .toLowerCase()
                          .replace(" ", "_")})`,
                      }}
                    >
                      <Image
                        src={matchedTeamImg}
                        alt={matchedTeamId}
                        width={32}
                        height={32}
                        className="object-cover w-7 h-7"
                      />
                    </div>
                    <p className="hidden sm:block text-sm font-bold">
                      {teamName}
                    </p>
                  </Link>
                </TableCell>

                <TableCell>{points}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </motion.div>
  );
}
