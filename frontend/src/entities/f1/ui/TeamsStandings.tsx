"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { fetchTeams, selectAllTeams } from "@/entities/f1/model/teamsSlice";
import { useGetStandingsTeamsQuery } from "@/entities/f1api/f1api";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

import type { Team } from "@/entities/f1/types/f1.types";

/* =======================
   Types
======================= */

type TeamStanding = {
  teamId: string;
  position?: number;
  points?: number;
  team: {
    teamName: string;
  };
};

type TeamsStandingsApiResponse = {
  constructors_championship: TeamStanding[];
};

/* =======================
   Component
======================= */

export default function TeamsStandings() {
  const { data: teamsApi = { constructors_championship: [] }, isLoading } =
    useGetStandingsTeamsQuery(undefined, {
      refetchOnMountOrArgChange: false,
    }) as { data?: TeamsStandingsApiResponse; isLoading: boolean };

  const dispatch = useAppDispatch();
  const teams = useAppSelector(selectAllTeams);

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  const sortedTeams = teams
    .map((team: Team) => {
      const stat = teamsApi.constructors_championship.find(
        (t) => t.teamId === team.teamId
      );

      if (!stat) {
        return {
          team,
          stat: {
            position: Infinity,
            points: 0,
            team: { teamName: "Unknown" },
          },
          position: Infinity,
        };
      }

      return {
        team,
        stat,
        position: stat.position ?? Infinity,
      };
    })
    .sort((a, b) => a.position - b.position);

  if (isLoading) {
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
          <TableRow className="uppercase">
            <TableHead>Pos</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Pts</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedTeams.map(({ team, stat }) => (
            <TableRow key={team.teamId}>
              <TableCell>{stat.position ?? "-"}</TableCell>

              <TableCell>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/teams/${team.teamId}`}
                    className="w-8 h-8 overflow-hidden rounded-full flex items-center justify-center"
                    style={{
                      background: `var(--team-${team.teamId
                        .toLowerCase()
                        .replace(" ", "_")})`,
                    }}
                  >
                    <Image
                      src={team.teamImgUrl}
                      alt={team.teamId}
                      width={32}
                      height={32}
                      className="object-cover w-7 h-7"
                    />
                  </Link>

                  <span className="font-medium">
                    {stat.team.teamName}
                  </span>
                </div>
              </TableCell>

              <TableCell>{stat.points ?? 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
