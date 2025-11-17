"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  fetchDrivers,
  selectAllDrivers,
} from "@/entities/f1/model/driversSlice";
import { fetchTeams, selectAllTeams } from "@/entities/f1/model/teamsSlice";
import { useGetStandingsDriversQuery } from "@/entities/f1api/f1api";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

export default function DriversStandings() {
  const { data: driversApi = { drivers_championship: [] } } =
    useGetStandingsDriversQuery(undefined, { refetchOnMountOrArgChange: false });

  const dispatch = useAppDispatch();
  const drivers = useAppSelector(selectAllDrivers);
  const teams = useAppSelector(selectAllTeams);

  useEffect(() => {
    dispatch(fetchDrivers());
    dispatch(fetchTeams());
  }, [dispatch]);

  const sortedDrivers = drivers
    .map((driver: any) => {
      const stat = driversApi.drivers_championship.find(
        (d: any) => d.driverId === driver.driverId
      );

      if (!stat) {
        return { driver, stat: { position: Infinity, points: 0, teamId: "unknown",driver:{ name:"",surname:""},  team: { teamName: "Unknown" } }, matchedTeam: { teamImgUrl: "/placeholder.png", teamId: "unknown" }, position: Infinity };
      }

      const matchedTeam = teams.find((t: any) => t.teamId === stat.teamId) || { teamImgUrl: "/placeholder.png", teamId: stat.teamId };

      return {
        driver,
        stat,
        matchedTeam,
        position: stat.position !== undefined ? stat.position : Infinity,
      };
    })
    .sort((a, b) => a.position - b.position);

  return (
    <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Table>
        <TableHeader>
          <TableRow className="uppercase">
            <TableHead>Pos</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Nationality</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Pts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDrivers.map(({ driver, stat, matchedTeam }) => {
            // Внутри map все объекты гарантированно существуют
            const position = stat.position !== undefined ? stat.position : "-";
            const points = stat.points !== undefined ? stat.points : 0;
            const teamName = stat.team && stat.team.teamName ? stat.team.teamName : stat.teamId;

            return (
              <TableRow key={driver.driverId}>
                <TableCell>{position}</TableCell>

                <TableCell>
                  <Link href={`/drivers/${driver.driverId}`} className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 overflow-hidden rounded-full"
                      style={{ background: `var(--team-${stat.teamId.toLowerCase().replace(" ", "_")})` }}
                    >
                      <Image src={driver.imgUrl} alt={driver.driverId} width={32} height={32} className="object-cover object-top w-full h-full" />
                    </div>
                    <p className="text-sm font-bold">
                      <span className="font-normal">{stat.driver.name}</span>{" "}
                      <span className="font-bold uppercase">{stat.driver.surname}</span>
                    </p>
                  </Link>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-white">
                      <Image
                        src={driver.nationalityImgUrl}
                        alt={driver.nationality}
                        width={32}
                        height={32}
                        className="object-cover object-top w-full h-full rounded-full"
                      />
                    </div>
                    {driver.nationality}
                  </div>
                </TableCell>

                <TableCell>
                  <Link href={`/teams/${stat.teamId}`} className="flex items-center gap-2">
                    <div className="w-8 h-8 overflow-hidden rounded-full flex items-center justify-center" style={{ background: `var(--team-${stat.teamId.toLowerCase().replace(" ", "_")})` }}>
                      <Image src={matchedTeam.teamImgUrl} alt={matchedTeam.teamId} width={32} height={32} className="object-cover object-top w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold">{teamName}</p>
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
