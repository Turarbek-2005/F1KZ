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
  selectTeamDrivers,
} from "@/entities/f1/model/driversSlice";
import { Driver } from "@/entities/f1/types/f1.types";
import { fetchTeams, selectTeamById } from "@/entities/f1/model/teamsSlice";
import {
  useGetTeamByIdQuery,
  useGetTeamDriversQuery,
  useGetStandingsTeamsQuery,
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

export default function Team() {
  const params = useParams();
  const rawId = params?.id;
  const teamId =
    typeof rawId === "string" && rawId.length > 0 ? rawId : undefined;
  const dispatch = useAppDispatch();
  const team = useAppSelector((state) =>
    teamId ? selectTeamById(state, teamId) : undefined
  );

  const teamDrivers = useAppSelector((state) =>
    selectTeamDrivers(state, teamId!)
  );

  const {
    data: teamApi,
    isLoading: teamApiLoading,
    isError: teamApiError,
  } = useGetTeamByIdQuery(teamId ?? skipToken, {
    refetchOnMountOrArgChange: false,
  });
  const {
    data: teamDriversApi,
    isLoading: teamDriversApiLoading,
    isError: teamDriversApiError,
  } = useGetTeamDriversQuery(teamId ?? skipToken, {
    refetchOnMountOrArgChange: false,
  });

  const { data: teamsStandings = { constructors_championship: [] } } =
    useGetStandingsTeamsQuery(undefined, {
      refetchOnMountOrArgChange: false,
    });

  const topTeamStat = teamsStandings.constructors_championship?.find(
    (t: any) => t.position === 1
  );
  const topTeamId = topTeamStat?.teamId;

  const myTeamStat = teamsStandings.constructors_championship?.find(
    (t: any) => t.teamId === teamId
  );

  const {
    data: topTeamApi,
    isLoading: topTeamLoading,
    isError: topTeamError,
  } = useGetTeamByIdQuery(topTeamId ?? skipToken, {
    refetchOnMountOrArgChange: false,
  });

  const twoTeamIds = Array.from(new Set([topTeamId, teamId].filter(Boolean)));

  const twoTeamsData = twoTeamIds.map((id) => {
    const apiData = id === teamId ? team : topTeamApi;
    const stat = teamsStandings.constructors_championship?.find(
      (t: any) => t.teamId === id
    );
    return { id, apiData, stat };
  });

  useEffect(() => {
    dispatch(fetchDrivers());
    dispatch(fetchTeams());
  }, [dispatch]);

  // useEffect(() => {
  //   console.log("Redux team:", team);
  //   console.log("API team:", teamApi);
  //   console.log("Redux team drivers:", teamDrivers);
  //   console.log("API team drivers:", teamDriversApi);
  //   console.log("Teams standings:", teamsStandings);
  //   console.log("Top team stat:", topTeamStat);
  // }, [team, teamApi, teamDriversApi, teamDrivers, teamsStandings, topTeamStat]);

  if (teamApiLoading || teamDriversApiLoading) {
    return <div className="container mx-auto">Loading team data...</div>;
  }

  return (
    <div className="pb-6">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto mb-2"
      >
        <Link href="/teams" className="hover:underline flex gap-2">
          <MoveLeft className="w-4" /> Back to Teams
        </Link>
      </motion.div>
      <div
        className="w-full h-140 flex relative flex-col items-center justify-center mb-14 text-center"
        style={{
          background: `var(--team-${team?.teamId
            ?.toLowerCase()
            .replace(" ", "_")})`,
        }}
      >
        <div className="w-full h-45 mb-5">
          <Image
            src={team?.bolidImgUrl || "/placeholder.png"}
            alt={team?.teamId || "Team Bolid"}
            width={800}
            height={180}
            className="object-contain w-full h-full"
          />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-5 uppercase">
          {teamApi?.team?.[0]?.teamName ?? team?.teamId}
        </h1>
        <div className="flex gap-3 mb-3">
          {teamDriversApi?.drivers?.map(
            ({
              driver,
            }: {
              driver: { driverId: string; name: string; surname: string };
            }) => (
              <p key={driver.driverId}>
                {driver.name} {driver.surname}
              </p>
            )
          )}
        </div>
        <div className="w-10 h-10">
          <Image
            src={team?.teamImgUrl || "/placeholder.png"}
            alt={team?.teamId || "Team Logo"}
            width={40}
            height={40}
            className="object-contain w-full h-full"
          />
        </div>
      </div>
      <div className="container mx-auto">
        <h3 className="text-4xl font-black uppercase mb-5">Drivers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {teamDrivers?.map((driver: Driver) => {
            const matchedDriver = teamDriversApi?.drivers?.find(
              ({ driver: apiDriver }: { driver: any }) =>
                apiDriver.driverId === driver.driverId
            )?.driver;

            return (
              <Link key={driver.id} href={`/drivers/${driver.driverId}`}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  key={driver.id}
                  className="p-4 rounded-lg relative h-70 cursor-pointer"
                  style={{
                    background: `var(--team-${driver?.teamId
                      ?.toLowerCase()
                      .replace(" ", "_")})`,
                  }}
                >
                  <div className="flex flex-col justify-between h-full">
                    <div className="flex flex-col">
                      {matchedDriver ? (
                        <>
                          <span className="text-2xl font-bold">
                            {matchedDriver?.name} {matchedDriver?.surname}
                          </span>{" "}
                          <span className="text-sm">
                            {teamDriversApi?.team?.teamName!}
                          </span>
                          <span
                            className={cn(
                              grapeNuts.className,
                              "text-4xl font-medium font mt-2"
                            )}
                          >
                            {matchedDriver?.number}
                          </span>
                        </>
                      ) : (
                        driver.teamId
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full border-2  border-white">
                      <Image
                        src={driver?.nationalityImgUrl || "/placeholder.png"}
                        alt={driver?.nationality || ""}
                        width={32}
                        height={32}
                        className="object-cover object-top w-full h-full rounded-full"
                      />
                    </div>
                  </div>

                  <div className="w-50 h-60 overflow-hidden absolute bottom-0 right-1/5 md:right-[10%] lg:right-1/5 2xl:right-[10%] ">
                    <Image
                      src={driver?.imgUrl || "/placeholder.png"}
                      alt={driver?.driverId || ""}
                      width={160}
                      height={240}
                      className="object-cover object-top w-full h-full"
                    />
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10">
          <h4 className="text-lg font-medium mb-2">
            My Team vs Championship Leader
          </h4>
          <div className="overflow-x-auto rounded-md mb-6">
            <Table>
              <TableHeader>
                <TableRow className="text-sm text-white/60">
                  <TableHead>Pos</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Pts</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {twoTeamsData.map(({ id, apiData, stat }) => {
                  const position = stat?.position ?? "—";
                  const points = stat?.points ?? 0;
                  const teamName =
                    apiData?.teamName ?? stat?.team?.teamName ?? id;

                  return (
                    <TableRow key={id} className="border-t border-white/6">
                      <TableCell
                        className={cn(
                          "whitespace-nowrap px-3 py-3 text-sm",
                          id == teamId && "text-red-500"
                        )}
                      >
                        {position}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "px-3 py-3 text-sm",
                          id == teamId && "text-red-500"
                        )}
                      >
                        <Link
                          href={`/teams/${id}`}
                          className="flex items-center gap-3"
                        >
                          <span>{teamName}</span>
                        </Link>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "px-3 py-3 text-sm",
                          id == teamId && "text-red-500"
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
        </div>
      </div>
    </div>
  );
}
