"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
// import { skipToken } from "@reduxjs/toolkit/query/react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";

import {
  fetchDrivers,
  selectAllDrivers,
} from "@/entities/f1/model/driversSlice";
import { fetchTeams, selectAllTeams } from "@/entities/f1/model/teamsSlice";

import { useGetDriversQuery, useGetTeamsQuery } from "@/entities/f1api/f1api";
import { Loader2 } from "lucide-react";

interface ApiDriver {
  driverId: string;
  name: string;
  surname: string;
}

interface ApiTeam {
  teamId: string;
  teamName?: string;
  teamImgUrl?: string;
  bolidImgUrl?: string;
}

type DriversApiResponse = {
  drivers: ApiDriver[];
};

type TeamsApiResponse = {
  teams: ApiTeam[];
};

export default function Teams() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const { data: driversApi, loading: isLoadingDrivers } = useGetDriversQuery(
    undefined,
    {
      refetchOnMountOrArgChange: false,
    }
  ) as { data?: DriversApiResponse; loading?: boolean };

  const { data: teamsApi, loading: isLoadingTeams } = useGetTeamsQuery(
    undefined,
    {
      refetchOnMountOrArgChange: false,
    }
  ) as { data?: TeamsApiResponse; loading?: boolean };

  const drivers = useAppSelector(selectAllDrivers);
  const teams = useAppSelector(selectAllTeams);

  const sortedDrivers = [...drivers].sort((a, b) => a.id - b.id);
  const sortedTeams = [...teams].sort((a, b) => a.id - b.id);

  useEffect(() => {
    dispatch(fetchDrivers());
    dispatch(fetchTeams());
  }, [dispatch]);

  if (isLoadingDrivers || isLoadingTeams) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-16 w-16" />
      </div>
    );
  }

  return (
    <div className="container mx-auto pb-6">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl mt-3 mb-8"
      >
        F1 Teams 2025
      </motion.h2>

      {user ? (
        <>
          <h3 className="text-2xl mb-6">Your Favorite Teams</h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
            {user.favoriteTeamsIds && user.favoriteTeamsIds.length ? (
              user.favoriteTeamsIds.map((favTeamId: string) => {
                const favTeam = teams.find((t) => t.teamId === favTeamId);
                const favTeamApi = teamsApi?.teams?.find(
                  (t: ApiTeam) => t.teamId === favTeamId
                );

                const displayTeamId =
                  favTeam?.teamId ?? favTeamApi?.teamId ?? favTeamId;

                const teamDrivers = sortedDrivers
                  .filter((d) => d.teamId === displayTeamId)
                  .slice(0, 2);

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    key={favTeamId}
                    className="p-4 rounded-lg relative h-70 cursor-pointer overflow-hidden"
                    style={{
                      background: `var(--team-${displayTeamId
                        .toLowerCase()
                        .replace(" ", "_")})`,
                    }}
                    onClick={() => router.push(`/teams/${displayTeamId}`)}
                  >
                    <h4 className="text-2xl font-bold mb-3">
                      {favTeamApi?.teamName ?? favTeam?.teamId ?? displayTeamId}
                    </h4>

                    <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
                      {teamDrivers.length === 0 ? (
                        <p className="text-sm">No drivers found</p>
                      ) : (
                        teamDrivers.map((d) => {
                          const matchedDriverApi = driversApi?.drivers?.find(
                            (da: ApiDriver) => da.driverId === d.driverId
                          );

                          return (
                            <Link
                              key={d.id ?? d.driverId}
                              href={`/drivers/${d.driverId}`}
                              className="flex items-center gap-2"
                            >
                              <div
                                className="w-8 h-8 overflow-hidden rounded-full"
                                style={{
                                  background: `var(--team-${d.teamId
                                    .toLowerCase()
                                    .replace(" ", "_")})`,
                                }}
                              >
                                <Image
                                  src={d.imgUrl}
                                  alt={d.driverId}
                                  width={32}
                                  height={32}
                                  className="object-cover object-top w-full h-full"
                                />
                              </div>

                              <p className="text-sm font-bold">
                                {matchedDriverApi ? (
                                  <>
                                    <span className="font-normal">
                                      {matchedDriverApi.name}
                                    </span>{" "}
                                    <span className="font-bold uppercase">
                                      {matchedDriverApi.surname}
                                    </span>
                                  </>
                                ) : (
                                  d.driverId
                                )}
                              </p>
                            </Link>
                          );
                        })
                      )}
                    </div>

                    <div className="w-14 h-14 rounded-full absolute right-5 top-5">
                      <Image
                        src={
                          favTeam?.teamImgUrl ??
                          favTeamApi?.teamImgUrl ??
                          "/placeholder.png"
                        }
                        alt={displayTeamId}
                        width={56}
                        height={56}
                        className="object-contain object-center w-full h-full p-1"
                      />
                    </div>

                    <div className="rounded-lg absolute bottom-4 left-5 w-130 overflow-hidden">
                      <Image
                        src={
                          favTeam?.bolidImgUrl ??
                          favTeamApi?.bolidImgUrl ??
                          "/placeholder.png"
                        }
                        alt={displayTeamId}
                        width={500}
                        height={200}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-sm">
                You don&apos;t have a favorite team set.
              </p>
            )}
          </div>
        </>
      ) : null}

      {user ? <h3 className="text-2xl mb-6">All Teams</h3> : null}

      <div className="grid md:grid-cols-2 gap-5">
        {sortedTeams.map((team) => {
          const matchedTeam = teamsApi?.teams?.find(
            (teamApi: ApiTeam) => teamApi.teamId === team.teamId
          );

          const matchedDrivers = sortedDrivers.filter(
            (d) => d.teamId === team.teamId
          );

          return (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              key={team.id}
              className="p-4 rounded-lg relative h-70 cursor-pointer overflow-hidden"
              style={{
                background: `var(--team-${team.teamId
                  .toLowerCase()
                  .replace(" ", "_")})`,
              }}
              onClick={() => router.push(`/teams/${team.teamId}`)}
            >
              <h4 className="text-2xl font-bold mb-3">
                {matchedTeam?.teamName ?? team.teamId}
              </h4>

              <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
                {matchedDrivers.length === 0 ? (
                  <p className="text-sm">No drivers found</p>
                ) : (
                  matchedDrivers.map((driver) => {
                    const matchedDriverApi = driversApi?.drivers?.find(
                      (da: ApiDriver) => da.driverId === driver.driverId
                    );

                    return (
                      <Link
                        key={driver.id ?? driver.driverId}
                        href={`/drivers/${driver.driverId}`}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="w-8 h-8 overflow-hidden rounded-full"
                          style={{
                            background: `var(--team-${driver.teamId
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
                          {matchedDriverApi ? (
                            <>
                              <span className="font-normal">
                                {matchedDriverApi.name}
                              </span>{" "}
                              <span className="font-bold uppercase">
                                {matchedDriverApi.surname}
                              </span>
                            </>
                          ) : (
                            driver.driverId
                          )}
                        </p>
                      </Link>
                    );
                  })
                )}
              </div>

              <div className="w-14 h-14 rounded-full absolute right-5 top-5">
                <Image
                  src={team.teamImgUrl}
                  alt={team.teamId}
                  width={56}
                  height={56}
                  className="object-contain object-center w-full h-full p-1"
                />
              </div>

              <div className="rounded-lg absolute bottom-4 left-5 w-130 overflow-hidden">
                <Image
                  src={team.bolidImgUrl}
                  alt={team.teamId}
                  width={500}
                  height={200}
                  className="object-cover w-full h-full"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
